import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ethers } from 'ethers';
import { 
  VVS_ROUTER_ADDRESS, 
  VVS_ROUTER_ABI, 
  ERC20_ABI, 
  DEFAULT_TOKENS,
  WCRO_ADDRESS,
  VVS_FACTORY_ADDRESS,
  VVS_FACTORY_ABI,
  PAIR_ABI
} from '../config/contracts';

const CRONOS_RPC = 'https://evm.cronos.org';

// Web3 Provider Store
export const useWeb3Store = create((set, get) => ({
  provider: null,
  signer: null,
  address: null,
  chainId: null,
  isConnected: false,
  isConnecting: false,
  
  connect: async (walletType = 'metamask') => {
    set({ isConnecting: true });
    
    try {
      let provider;
      
      if (walletType === 'metamask' && window.ethereum) {
        // MetaMask or injected provider
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // Check and switch to Cronos chain
        const chainId = await provider.getNetwork().then(n => n.chainId);
        if (chainId !== 25) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x19' }], // 25 in hex
            });
          } catch (switchError) {
            // Chain not added, add it
            if (switchError.code === 4902) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x19',
                  chainName: 'Cronos',
                  nativeCurrency: { name: 'CRO', symbol: 'CRO', decimals: 18 },
                  rpcUrls: ['https://evm.cronos.org'],
                  blockExplorerUrls: ['https://explorer.cronos.org'],
                }],
              });
            }
          }
          provider = new ethers.providers.Web3Provider(window.ethereum);
        }
      } else if (walletType === 'walletconnect') {
        // WalletConnect - for mobile wallets including Crypto.com
        throw new Error('Please use MetaMask or Crypto.com DeFi Wallet browser extension');
      } else {
        throw new Error('No wallet detected. Please install MetaMask or Crypto.com DeFi Wallet');
      }
      
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      
      set({
        provider,
        signer,
        address,
        chainId: network.chainId,
        isConnected: true,
        isConnecting: false,
      });
      
      // Listen for account changes
      if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length === 0) {
            get().disconnect();
          } else {
            set({ address: accounts[0] });
            get().refreshBalances();
          }
        });
        
        window.ethereum.on('chainChanged', () => {
          window.location.reload();
        });
      }
      
      // Fetch balances
      await get().refreshBalances();
      
      return address;
    } catch (error) {
      console.error('Connection error:', error);
      set({ isConnecting: false });
      throw error;
    }
  },
  
  disconnect: () => {
    set({
      provider: null,
      signer: null,
      address: null,
      chainId: null,
      isConnected: false,
    });
    useTokenStore.getState().clearBalances();
  },
  
  refreshBalances: async () => {
    const { provider, address } = get();
    if (!provider || !address) return;
    
    await useTokenStore.getState().fetchAllBalances(provider, address);
  },
}));

// Token Store with persistence for imported tokens
export const useTokenStore = create(
  persist(
    (set, get) => ({
      tokens: DEFAULT_TOKENS,
      balances: {},
      importedTokens: [],
      
      addToken: async (tokenAddress) => {
        const { tokens, importedTokens } = get();
        
        // Check if already exists
        const exists = [...tokens, ...importedTokens].find(
          t => t.address.toLowerCase() === tokenAddress.toLowerCase()
        );
        if (exists) return exists;
        
        // Fetch token info from blockchain
        try {
          const provider = new ethers.providers.JsonRpcProvider(CRONOS_RPC);
          const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
          
          const [name, symbol, decimals] = await Promise.all([
            contract.name(),
            contract.symbol(),
            contract.decimals(),
          ]);
          
          const newToken = {
            symbol,
            name,
            address: tokenAddress,
            decimals,
            logo: `https://dd.dexscreener.com/ds-data/tokens/cronos/${tokenAddress.toLowerCase()}.png`,
            imported: true,
          };
          
          set({ importedTokens: [...importedTokens, newToken] });
          return newToken;
        } catch (error) {
          console.error('Error importing token:', error);
          throw new Error('Invalid token address or token not found');
        }
      },
      
      removeImportedToken: (address) => {
        const { importedTokens } = get();
        set({
          importedTokens: importedTokens.filter(
            t => t.address.toLowerCase() !== address.toLowerCase()
          ),
        });
      },
      
      getAllTokens: () => {
        const { tokens, importedTokens } = get();
        return [...tokens, ...importedTokens];
      },
      
      getToken: (addressOrSymbol) => {
        const allTokens = get().getAllTokens();
        return allTokens.find(
          t => t.address.toLowerCase() === addressOrSymbol.toLowerCase() ||
               t.symbol.toLowerCase() === addressOrSymbol.toLowerCase()
        );
      },
      
      fetchAllBalances: async (provider, userAddress) => {
        const allTokens = get().getAllTokens();
        const balances = {};
        
        try {
          // Get native CRO balance
          const nativeBalance = await provider.getBalance(userAddress);
          balances['CRO'] = ethers.utils.formatEther(nativeBalance);
          balances['NATIVE'] = ethers.utils.formatEther(nativeBalance);
          
          // Get ERC20 balances
          const promises = allTokens
            .filter(t => !t.isNative)
            .map(async (token) => {
              try {
                const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
                const balance = await contract.balanceOf(userAddress);
                return { 
                  symbol: token.symbol, 
                  address: token.address,
                  balance: ethers.utils.formatUnits(balance, token.decimals) 
                };
              } catch {
                return { symbol: token.symbol, address: token.address, balance: '0' };
              }
            });
          
          const results = await Promise.all(promises);
          results.forEach(r => {
            balances[r.symbol] = r.balance;
            balances[r.address] = r.balance;
          });
          
          set({ balances });
        } catch (error) {
          console.error('Error fetching balances:', error);
        }
      },
      
      getBalance: (tokenAddressOrSymbol) => {
        const { balances } = get();
        return balances[tokenAddressOrSymbol] || balances[tokenAddressOrSymbol?.toUpperCase()] || '0';
      },
      
      clearBalances: () => {
        set({ balances: {} });
      },
    }),
    {
      name: 'cronos-gangsters-tokens',
      partialize: (state) => ({ importedTokens: state.importedTokens }),
    }
  )
);

// Swap Store
export const useSwapStore = create((set, get) => ({
  fromToken: null,
  toToken: null,
  fromAmount: '',
  toAmount: '',
  quote: null,
  isLoading: false,
  slippage: 0.5,
  
  setFromToken: (token) => set({ fromToken: token, quote: null, toAmount: '' }),
  setToToken: (token) => set({ toToken: token, quote: null, toAmount: '' }),
  setFromAmount: (amount) => set({ fromAmount: amount }),
  setSlippage: (slippage) => set({ slippage }),
  
  switchTokens: () => {
    const { fromToken, toToken, fromAmount, toAmount } = get();
    set({
      fromToken: toToken,
      toToken: fromToken,
      fromAmount: toAmount,
      toAmount: fromAmount,
      quote: null,
    });
  },
  
  getQuote: async () => {
    const { fromToken, toToken, fromAmount } = get();
    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) {
      set({ quote: null, toAmount: '' });
      return;
    }
    
    set({ isLoading: true });
    
    try {
      const provider = new ethers.providers.JsonRpcProvider(CRONOS_RPC);
      const router = new ethers.Contract(VVS_ROUTER_ADDRESS, VVS_ROUTER_ABI, provider);
      
      const amountIn = ethers.utils.parseUnits(fromAmount, fromToken.decimals);
      
      // Build path
      const fromAddress = fromToken.isNative ? WCRO_ADDRESS : fromToken.address;
      const toAddress = toToken.isNative ? WCRO_ADDRESS : toToken.address;
      
      let path;
      if (fromAddress.toLowerCase() === WCRO_ADDRESS.toLowerCase() || 
          toAddress.toLowerCase() === WCRO_ADDRESS.toLowerCase()) {
        path = [fromAddress, toAddress];
      } else {
        // Route through WCRO
        path = [fromAddress, WCRO_ADDRESS, toAddress];
      }
      
      const amounts = await router.getAmountsOut(amountIn, path);
      const amountOut = amounts[amounts.length - 1];
      const formattedOut = ethers.utils.formatUnits(amountOut, toToken.decimals);
      
      // Calculate price impact (simplified)
      const priceImpact = parseFloat(fromAmount) > 1000 ? 0.5 : 0.1;
      
      const quote = {
        fromAmount,
        toAmount: formattedOut,
        rate: parseFloat(formattedOut) / parseFloat(fromAmount),
        priceImpact,
        path,
        amountIn,
        amountOutMin: amountOut.mul(995).div(1000), // 0.5% slippage
      };
      
      set({ quote, toAmount: parseFloat(formattedOut).toFixed(6), isLoading: false });
      return quote;
    } catch (error) {
      console.error('Quote error:', error);
      set({ quote: null, toAmount: '', isLoading: false });
      throw error;
    }
  },
  
  executeSwap: async () => {
    const { fromToken, toToken, fromAmount, quote, slippage } = get();
    const { signer, address } = useWeb3Store.getState();
    
    if (!signer || !quote) throw new Error('Not ready to swap');
    
    const router = new ethers.Contract(VVS_ROUTER_ADDRESS, VVS_ROUTER_ABI, signer);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes
    
    const slippageMultiplier = (100 - slippage) / 100;
    const amountOutMin = quote.amountOutMin.mul(Math.floor(slippageMultiplier * 1000)).div(1000);
    
    let tx;
    
    if (fromToken.isNative) {
      // CRO -> Token
      tx = await router.swapExactETHForTokens(
        amountOutMin,
        quote.path,
        address,
        deadline,
        { value: quote.amountIn }
      );
    } else if (toToken.isNative) {
      // Token -> CRO
      // First approve
      const tokenContract = new ethers.Contract(fromToken.address, ERC20_ABI, signer);
      const allowance = await tokenContract.allowance(address, VVS_ROUTER_ADDRESS);
      if (allowance.lt(quote.amountIn)) {
        const approveTx = await tokenContract.approve(VVS_ROUTER_ADDRESS, ethers.constants.MaxUint256);
        await approveTx.wait();
      }
      
      tx = await router.swapExactTokensForETH(
        quote.amountIn,
        amountOutMin,
        quote.path,
        address,
        deadline
      );
    } else {
      // Token -> Token
      // First approve
      const tokenContract = new ethers.Contract(fromToken.address, ERC20_ABI, signer);
      const allowance = await tokenContract.allowance(address, VVS_ROUTER_ADDRESS);
      if (allowance.lt(quote.amountIn)) {
        const approveTx = await tokenContract.approve(VVS_ROUTER_ADDRESS, ethers.constants.MaxUint256);
        await approveTx.wait();
      }
      
      tx = await router.swapExactTokensForTokens(
        quote.amountIn,
        amountOutMin,
        quote.path,
        address,
        deadline
      );
    }
    
    const receipt = await tx.wait();
    
    // Refresh balances
    await useWeb3Store.getState().refreshBalances();
    
    // Reset form
    set({ fromAmount: '', toAmount: '', quote: null });
    
    return receipt;
  },
}));

// Liquidity Store
export const useLiquidityStore = create((set, get) => ({
  tokenA: null,
  tokenB: null,
  amountA: '',
  amountB: '',
  isLoading: false,
  poolInfo: null,
  
  setTokenA: (token) => set({ tokenA: token, poolInfo: null }),
  setTokenB: (token) => set({ tokenB: token, poolInfo: null }),
  setAmountA: (amount) => set({ amountA: amount }),
  setAmountB: (amount) => set({ amountB: amount }),
  
  getPoolInfo: async () => {
    const { tokenA, tokenB } = get();
    if (!tokenA || !tokenB) return null;
    
    set({ isLoading: true });
    
    try {
      const provider = new ethers.providers.JsonRpcProvider(CRONOS_RPC);
      const factory = new ethers.Contract(VVS_FACTORY_ADDRESS, VVS_FACTORY_ABI, provider);
      
      const addressA = tokenA.isNative ? WCRO_ADDRESS : tokenA.address;
      const addressB = tokenB.isNative ? WCRO_ADDRESS : tokenB.address;
      
      const pairAddress = await factory.getPair(addressA, addressB);
      
      if (pairAddress === ethers.constants.AddressZero) {
        set({ poolInfo: { exists: false }, isLoading: false });
        return { exists: false };
      }
      
      const pair = new ethers.Contract(pairAddress, PAIR_ABI, provider);
      const [reserves, token0, totalSupply] = await Promise.all([
        pair.getReserves(),
        pair.token0(),
        pair.totalSupply(),
      ]);
      
      const isToken0 = addressA.toLowerCase() === token0.toLowerCase();
      const reserveA = isToken0 ? reserves._reserve0 : reserves._reserve1;
      const reserveB = isToken0 ? reserves._reserve1 : reserves._reserve0;
      
      const poolInfo = {
        exists: true,
        pairAddress,
        reserveA: ethers.utils.formatUnits(reserveA, tokenA.decimals),
        reserveB: ethers.utils.formatUnits(reserveB, tokenB.decimals),
        totalSupply: ethers.utils.formatEther(totalSupply),
        price: parseFloat(ethers.utils.formatUnits(reserveB, tokenB.decimals)) / 
               parseFloat(ethers.utils.formatUnits(reserveA, tokenA.decimals)),
      };
      
      set({ poolInfo, isLoading: false });
      return poolInfo;
    } catch (error) {
      console.error('Pool info error:', error);
      set({ poolInfo: null, isLoading: false });
      return null;
    }
  },
  
  calculateAmountB: async (amountA) => {
    const { tokenA, tokenB, poolInfo } = get();
    if (!poolInfo?.exists || !amountA || parseFloat(amountA) <= 0) {
      set({ amountB: '' });
      return;
    }
    
    const amountB = (parseFloat(amountA) * poolInfo.price).toFixed(6);
    set({ amountA, amountB });
  },
  
  addLiquidity: async () => {
    const { tokenA, tokenB, amountA, amountB } = get();
    const { signer, address } = useWeb3Store.getState();
    
    if (!signer || !amountA || !amountB) throw new Error('Not ready');
    
    const router = new ethers.Contract(VVS_ROUTER_ADDRESS, VVS_ROUTER_ABI, signer);
    const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
    
    const amountADesired = ethers.utils.parseUnits(amountA, tokenA.decimals);
    const amountBDesired = ethers.utils.parseUnits(amountB, tokenB.decimals);
    const amountAMin = amountADesired.mul(95).div(100);
    const amountBMin = amountBDesired.mul(95).div(100);
    
    let tx;
    
    if (tokenA.isNative || tokenB.isNative) {
      const token = tokenA.isNative ? tokenB : tokenA;
      const tokenAmount = tokenA.isNative ? amountBDesired : amountADesired;
      const ethAmount = tokenA.isNative ? amountADesired : amountBDesired;
      const tokenMin = tokenA.isNative ? amountBMin : amountAMin;
      const ethMin = tokenA.isNative ? amountAMin : amountBMin;
      
      // Approve token
      const tokenContract = new ethers.Contract(token.address, ERC20_ABI, signer);
      const allowance = await tokenContract.allowance(address, VVS_ROUTER_ADDRESS);
      if (allowance.lt(tokenAmount)) {
        const approveTx = await tokenContract.approve(VVS_ROUTER_ADDRESS, ethers.constants.MaxUint256);
        await approveTx.wait();
      }
      
      tx = await router.addLiquidityETH(
        token.address,
        tokenAmount,
        tokenMin,
        ethMin,
        address,
        deadline,
        { value: ethAmount }
      );
    } else {
      // Approve both tokens
      for (const [token, amount] of [[tokenA, amountADesired], [tokenB, amountBDesired]]) {
        const tokenContract = new ethers.Contract(token.address, ERC20_ABI, signer);
        const allowance = await tokenContract.allowance(address, VVS_ROUTER_ADDRESS);
        if (allowance.lt(amount)) {
          const approveTx = await tokenContract.approve(VVS_ROUTER_ADDRESS, ethers.constants.MaxUint256);
          await approveTx.wait();
        }
      }
      
      tx = await router.addLiquidity(
        tokenA.address,
        tokenB.address,
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        address,
        deadline
      );
    }
    
    const receipt = await tx.wait();
    await useWeb3Store.getState().refreshBalances();
    
    set({ amountA: '', amountB: '' });
    return receipt;
  },
}));

// Toast Store
export const useToastStore = create((set) => ({
  toasts: [],
  
  addToast: (message, type = 'info') => {
    const id = Date.now();
    set(state => ({
      toasts: [...state.toasts, { id, message, type }]
    }));
    
    setTimeout(() => {
      set(state => ({
        toasts: state.toasts.filter(t => t.id !== id)
      }));
    }, 5000);
  },
  
  removeToast: (id) => {
    set(state => ({
      toasts: state.toasts.filter(t => t.id !== id)
    }));
  }
}));
