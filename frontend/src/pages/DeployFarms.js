import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const CONTRACTS = {
  GANG: "0x4cE15b52a34dE6F62448fDBAdDF1dB4811DDC3EF",
  XRP: "0x2Fb4Bfc7f6c26D97f47eA9b1c40E76c6BFab7D39",
  PEPE: "0x9d5991f523f3aF7c14e91Ca6063C8E08F3c97fbB",
  DOGE: "0x1a8E39ae59e5556B56b76fCBA98d22c9ae557396",
  FACTORY: "0x3B44B2a187a7b3824131F8db5a74194D0a42Fc15",
  CHEF: "0x3713567b8DB60D7127B2614965eef71cE50871Ea",
};

const FACTORY_ABI = [
  "function createPair(address tokenA, address tokenB) external returns (address pair)",
  "function getPair(address tokenA, address tokenB) external view returns (address pair)"
];

const CHEF_ABI = [
  "function addPool(uint256 _allocPoint, address _lpToken) external",
  "function poolLength() external view returns (uint256)"
];

const FARMS_TO_DEPLOY = [
  {
    name: "XRP / GANG",
    tokenA: "XRP",
    tokenB: "GANG",
    addrA: CONTRACTS.XRP,
    addrB: CONTRACTS.GANG,
    storageKey: "FARM_LP_XRP_GANG",
    allocPoint: 150,
    logo1: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
    logo2: "/gang-logo.png",
  },
  {
    name: "PEPE / GANG",
    tokenA: "PEPE",
    tokenB: "GANG",
    addrA: CONTRACTS.PEPE,
    addrB: CONTRACTS.GANG,
    storageKey: "FARM_LP_PEPE_GANG",
    allocPoint: 150,
    logo1: "https://assets.coingecko.com/coins/images/29850/small/pepe-token.jpeg",
    logo2: "/gang-logo.png",
  },
  {
    name: "DOGE / GANG",
    tokenA: "DOGE",
    tokenB: "GANG",
    addrA: CONTRACTS.DOGE,
    addrB: CONTRACTS.GANG,
    storageKey: "FARM_LP_DOGE_GANG",
    allocPoint: 150,
    logo1: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
    logo2: "/gang-logo.png",
  },
];

const DeployFarms = () => {
  const [wallet, setWallet] = useState('');
  const [farmStates, setFarmStates] = useState(
    FARMS_TO_DEPLOY.map(f => ({
      lpAddr: localStorage.getItem(f.storageKey) || '',
      step: localStorage.getItem(f.storageKey) ? 'lp_created' : 'init',
      status: '',
      loading: false,
      chefAdded: false,
    }))
  );

  const connectWallet = async () => {
    if (!window.ethereum) return;
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWallet(accounts[0]);
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (parseInt(chainId, 16) !== 25) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x19' }],
          });
        } catch (e) { /* user rejected chain switch */ }
      }
    } catch (e) { /* user rejected connect */ }
  };

  useEffect(() => {
    if (window.ethereum) connectWallet();
    // eslint-disable-next-line
  }, []);

  const updateFarmState = (idx, updates) => {
    setFarmStates(prev => prev.map((s, i) => i === idx ? { ...s, ...updates } : s));
  };

  const createLPPair = async (idx) => {
    const farm = FARMS_TO_DEPLOY[idx];
    if (!window.ethereum) {
      updateFarmState(idx, { status: 'Install MetaMask or use wallet browser!' });
      return;
    }
    try {
      updateFarmState(idx, { loading: true, status: 'Connecting wallet...' });
      await connectWallet();

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const factory = new ethers.Contract(CONTRACTS.FACTORY, FACTORY_ABI, signer);

      updateFarmState(idx, { status: 'Checking if pair exists...' });
      const existing = await factory.getPair(farm.addrA, farm.addrB);

      if (existing && existing !== ethers.constants.AddressZero) {
        localStorage.setItem(farm.storageKey, existing);
        updateFarmState(idx, {
          lpAddr: existing,
          step: 'lp_created',
          status: 'LP pair already exists!',
          loading: false,
        });
        return;
      }

      updateFarmState(idx, { status: 'Creating LP pair — confirm in wallet...' });
      const tx = await factory.createPair(farm.addrA, farm.addrB);
      updateFarmState(idx, { status: 'TX sent! Waiting for confirmation...' });
      await tx.wait();

      const pairAddr = await factory.getPair(farm.addrA, farm.addrB);
      localStorage.setItem(farm.storageKey, pairAddr);

      updateFarmState(idx, {
        lpAddr: pairAddr,
        step: 'lp_created',
        status: 'LP pair created successfully!',
        loading: false,
      });
    } catch (err) {
      console.error(err);
      const msg = err.code === 4001 ? 'Transaction rejected' :
                  err.message?.includes('insufficient') ? 'Not enough CRO for gas!' :
                  (err.reason || err.message || 'Failed').slice(0, 120);
      updateFarmState(idx, { status: 'Error: ' + msg, loading: false });
    }
  };

  const addToMasterChef = async (idx) => {
    const farm = FARMS_TO_DEPLOY[idx];
    const fs = farmStates[idx];
    if (!fs.lpAddr) {
      updateFarmState(idx, { status: 'Create LP pair first!' });
      return;
    }
    try {
      updateFarmState(idx, { loading: true, status: 'Adding to MasterChef — confirm in wallet...' });

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const chef = new ethers.Contract(CONTRACTS.CHEF, CHEF_ABI, signer);

      const tx = await chef.addPool(farm.allocPoint, fs.lpAddr, { gasLimit: 500000 });
      updateFarmState(idx, { status: 'TX sent! Waiting for confirmation...' });
      await tx.wait();

      updateFarmState(idx, {
        step: 'chef_added',
        status: 'Farm activated on MasterChef!',
        loading: false,
        chefAdded: true,
      });
    } catch (err) {
      console.error(err);
      const msg = err.code === 4001 ? 'Transaction rejected' :
                  err.message?.includes('insufficient') ? 'Not enough CRO for gas!' :
                  (err.reason || err.message || 'Failed').slice(0, 120);
      updateFarmState(idx, { status: 'Error: ' + msg, loading: false });
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title} data-testid="deploy-farms-title">Deploy New Farms</h1>
        <p style={styles.subtitle}>1-Click LP Pair Creation & MasterChef Registration</p>

        {wallet ? (
          <div style={styles.walletBadge} data-testid="deploy-farms-wallet">
            {wallet.slice(0, 6)}...{wallet.slice(-4)}
          </div>
        ) : (
          <button style={styles.connectBtn} onClick={connectWallet} data-testid="deploy-farms-connect">
            CONNECT WALLET
          </button>
        )}

        <div style={styles.grid}>
          {FARMS_TO_DEPLOY.map((farm, idx) => {
            const fs = farmStates[idx];
            return (
              <div key={farm.storageKey} style={styles.card} data-testid={`farm-deploy-card-${farm.tokenA.toLowerCase()}`}>
                <div style={styles.cardHeader}>
                  <div style={styles.tokenLogos}>
                    <img src={farm.logo1} style={styles.tokenLogo} alt={farm.tokenA}
                      onError={(e) => { e.target.style.display = 'none'; }} />
                    <img src={farm.logo2} style={{ ...styles.tokenLogo, marginLeft: '-8px' }} alt="GANG"
                      onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                  <div style={styles.farmName}>{farm.name}</div>
                </div>

                {/* Step 1: Create LP Pair */}
                <div style={styles.step}>
                  <div style={styles.stepLabel}>
                    <span style={{
                      ...styles.stepNum,
                      background: fs.step !== 'init' ? '#27ae60' : '#ffd700',
                    }}>
                      {fs.step !== 'init' ? '\u2713' : '1'}
                    </span>
                    Create LP Pair on VVS Factory
                  </div>

                  {fs.lpAddr ? (
                    <div style={styles.addressBox}>
                      <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>LP Address:</div>
                      <code
                        style={styles.address}
                        onClick={() => navigator.clipboard.writeText(fs.lpAddr)}
                        data-testid={`lp-addr-${farm.tokenA.toLowerCase()}`}
                      >
                        {fs.lpAddr}
                      </code>
                    </div>
                  ) : (
                    <button
                      style={{ ...styles.actionBtn, opacity: fs.loading ? 0.6 : 1 }}
                      onClick={() => createLPPair(idx)}
                      disabled={fs.loading || !wallet}
                      data-testid={`create-lp-${farm.tokenA.toLowerCase()}`}
                    >
                      {fs.loading && fs.step === 'init' ? 'CREATING...' : 'CREATE LP PAIR'}
                    </button>
                  )}
                </div>

                {/* Step 2: Add to MasterChef */}
                <div style={{ ...styles.step, opacity: fs.lpAddr ? 1 : 0.4 }}>
                  <div style={styles.stepLabel}>
                    <span style={{
                      ...styles.stepNum,
                      background: fs.chefAdded ? '#27ae60' : (fs.lpAddr ? '#ffd700' : '#333'),
                      color: fs.chefAdded || fs.lpAddr ? '#000' : '#666',
                    }}>
                      {fs.chefAdded ? '\u2713' : '2'}
                    </span>
                    Register on MasterChef
                  </div>

                  {fs.chefAdded ? (
                    <div style={styles.successBadge} data-testid={`chef-done-${farm.tokenA.toLowerCase()}`}>
                      FARM ACTIVE
                    </div>
                  ) : (
                    <button
                      style={{
                        ...styles.actionBtn,
                        opacity: (!fs.lpAddr || fs.loading) ? 0.5 : 1,
                        background: fs.lpAddr ? 'linear-gradient(135deg, #27ae60, #1a8a4a)' : '#222',
                      }}
                      onClick={() => addToMasterChef(idx)}
                      disabled={!fs.lpAddr || fs.loading}
                      data-testid={`add-chef-${farm.tokenA.toLowerCase()}`}
                    >
                      {fs.loading && fs.step === 'lp_created' ? 'ADDING...' : 'ADD TO MASTERCHEF'}
                    </button>
                  )}
                </div>

                {/* Status message */}
                {fs.status && (
                  <div style={{
                    ...styles.statusBar,
                    background: fs.status.includes('Error') || fs.status.includes('rejected') ? 'rgba(255,0,0,0.12)' :
                      fs.status.includes('created') || fs.status.includes('activated') || fs.status.includes('exists') ? 'rgba(0,255,0,0.12)' :
                      'rgba(255,255,0,0.1)',
                  }} data-testid={`status-${farm.tokenA.toLowerCase()}`}>
                    {fs.status}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={styles.infoBox}>
          <p><strong style={{ color: '#ccc' }}>Network:</strong> Cronos Mainnet (Chain ID 25)</p>
          <p><strong style={{ color: '#ccc' }}>Factory:</strong> VVS Finance</p>
          <p><strong style={{ color: '#ccc' }}>MasterChef:</strong> GangsterChef</p>
          <p style={{ marginTop: '10px', color: '#999', fontSize: '11px' }}>
            After deploying, go back to the Farms page to stake LP tokens and earn $GANG rewards.
          </p>
        </div>

        <a href="/cronos-gangsters.html" style={styles.backLink} data-testid="back-to-farms">
          Back to Farms
        </a>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0a0a12',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '40px 15px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  container: {
    maxWidth: '820px',
    width: '100%',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    background: 'linear-gradient(90deg, #ffd700, #ff8c00)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '6px',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    fontSize: '0.9rem',
    marginBottom: '24px',
  },
  walletBadge: {
    textAlign: 'center',
    background: 'rgba(0,255,136,0.08)',
    border: '1px solid rgba(0,255,136,0.2)',
    padding: '10px',
    borderRadius: '10px',
    marginBottom: '24px',
    color: '#0f8',
    fontSize: '0.85rem',
    fontFamily: 'monospace',
  },
  connectBtn: {
    display: 'block',
    margin: '0 auto 24px',
    background: 'linear-gradient(135deg, #ffd700, #ff8c00)',
    color: '#000',
    border: 'none',
    padding: '14px 36px',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  card: {
    background: '#12121e',
    borderRadius: '16px',
    padding: '22px',
    border: '1px solid rgba(255,215,0,0.1)',
    color: '#fff',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    paddingBottom: '14px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  tokenLogos: {
    display: 'flex',
    alignItems: 'center',
  },
  tokenLogo: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    border: '2px solid #1a1a2e',
    objectFit: 'cover',
  },
  farmName: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#ffd700',
  },
  step: {
    marginBottom: '16px',
  },
  stepLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    fontSize: '0.82rem',
    color: '#bbb',
    fontWeight: '600',
  },
  stepNum: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    fontSize: '11px',
    fontWeight: '800',
    color: '#000',
    flexShrink: 0,
  },
  actionBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #ffd700, #b8860b)',
    color: '#000',
    border: 'none',
    padding: '12px',
    borderRadius: '10px',
    fontSize: '0.82rem',
    fontWeight: '700',
    cursor: 'pointer',
    letterSpacing: '0.5px',
  },
  addressBox: {
    background: 'rgba(0,0,0,0.25)',
    borderRadius: '8px',
    padding: '10px',
    border: '1px solid rgba(39,174,96,0.2)',
  },
  address: {
    fontSize: '0.58rem',
    color: '#ffd700',
    wordBreak: 'break-all',
    cursor: 'pointer',
    display: 'block',
    fontFamily: 'monospace',
  },
  successBadge: {
    background: 'rgba(39,174,96,0.1)',
    border: '1px solid rgba(39,174,96,0.35)',
    color: '#27ae60',
    padding: '10px',
    borderRadius: '10px',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: '0.82rem',
    letterSpacing: '2px',
  },
  statusBar: {
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '0.72rem',
    color: '#ddd',
    marginTop: '4px',
  },
  infoBox: {
    background: '#12121e',
    borderRadius: '14px',
    padding: '18px',
    color: '#777',
    fontSize: '0.82rem',
    border: '1px solid rgba(255,255,255,0.05)',
    marginBottom: '16px',
    lineHeight: '1.8',
  },
  backLink: {
    display: 'block',
    textAlign: 'center',
    color: '#ffd700',
    textDecoration: 'none',
    fontSize: '0.9rem',
    padding: '14px',
    fontWeight: '600',
  },
};

export default DeployFarms;
