import { create } from 'zustand';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Wallet Store
export const useWalletStore = create((set, get) => ({
  isConnected: false,
  address: null,
  balances: {},
  
  connect: async () => {
    // Simulate wallet connection with a random address
    const address = '0x' + Array.from({length: 40}, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    set({ isConnected: true, address });
    
    // Fetch balances
    try {
      const response = await fetch(`${API}/wallet/balances/${address}`);
      const data = await response.json();
      const balances = {};
      data.forEach(item => {
        balances[item.token] = item.balance;
      });
      set({ balances });
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
    
    return address;
  },
  
  disconnect: () => {
    set({ isConnected: false, address: null, balances: {} });
  },
  
  updateBalance: async (token, newBalance) => {
    const { address, balances } = get();
    set({ balances: { ...balances, [token]: newBalance } });
    
    // Update on server
    try {
      await fetch(`${API}/wallet/update-balance?wallet_address=${address}&token=${token}&amount=${newBalance}`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  },
  
  refreshBalances: async () => {
    const { address } = get();
    if (!address) return;
    
    try {
      const response = await fetch(`${API}/wallet/balances/${address}`);
      const data = await response.json();
      const balances = {};
      data.forEach(item => {
        balances[item.token] = item.balance;
      });
      set({ balances });
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  }
}));

// Tokens Store
export const useTokensStore = create((set) => ({
  tokens: [],
  prices: {},
  loading: true,
  
  fetchTokens: async () => {
    try {
      const [tokensRes, pricesRes] = await Promise.all([
        fetch(`${API}/tokens`),
        fetch(`${API}/token-prices`)
      ]);
      
      const tokens = await tokensRes.json();
      const prices = await pricesRes.json();
      
      set({ tokens, prices, loading: false });
    } catch (error) {
      console.error('Error fetching tokens:', error);
      set({ loading: false });
    }
  }
}));

// DEX Stats Store
export const useDexStatsStore = create((set) => ({
  stats: null,
  loading: true,
  
  fetchStats: async () => {
    try {
      const response = await fetch(`${API}/dex/stats`);
      const stats = await response.json();
      set({ stats, loading: false });
    } catch (error) {
      console.error('Error fetching DEX stats:', error);
      set({ loading: false });
    }
  }
}));

// Toast Store
export const useToastStore = create((set) => ({
  toasts: [],
  
  addToast: (message, type = 'info') => {
    const id = Date.now();
    set(state => ({
      toasts: [...state.toasts, { id, message, type }]
    }));
    
    // Auto remove after 5 seconds
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
