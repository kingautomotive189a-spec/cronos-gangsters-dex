import React, { useState, useEffect, useCallback } from 'react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Trading = () => {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(0);
  const [pairs, setPairs] = useState([]);
  const [selectedPair, setSelectedPair] = useState('BTC');
  const [positions, setPositions] = useState({ open: [], closed: [] });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Trade form
  const [direction, setDirection] = useState('long');
  const [leverage, setLeverage] = useState(10);
  const [amount, setAmount] = useState(10);

  useEffect(() => {
    fetchPairs();
    const interval = setInterval(fetchPairs, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPairs = async () => {
    try {
      const res = await fetch(`${API}/trading/pairs`);
      const data = await res.json();
      if (data.success) setPairs(data.pairs);
    } catch (e) { console.error(e); }
  };

  const fetchBalance = useCallback(async () => {
    if (!wallet) return;
    try {
      const res = await fetch(`${API}/mining/user/${wallet}`);
      const data = await res.json();
      if (data.success) setBalance(data.balance);
    } catch (e) { console.error(e); }
  }, [wallet]);

  const fetchPositions = useCallback(async () => {
    if (!wallet) return;
    try {
      const res = await fetch(`${API}/trading/positions/${wallet}`);
      const data = await res.json();
      if (data.success) {
        setPositions({ open: data.open_positions, closed: data.closed_positions });
      }
    } catch (e) { console.error(e); }
  }, [wallet]);

  useEffect(() => {
    if (wallet) {
      fetchBalance();
      fetchPositions();
      const interval = setInterval(() => {
        fetchBalance();
        fetchPositions();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [wallet, fetchBalance, fetchPositions]);

  const connect = async () => {
    if (!window.ethereum) return setMessage('Install MetaMask!');
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setWallet(accounts[0]);
      // Register if needed
      await fetch(`${API}/mining/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: accounts[0] })
      });
    } catch (e) { setMessage('Connection failed'); }
  };

  const openPosition = async () => {
    if (!wallet) return;
    try {
      setLoading(true);
      const res = await fetch(`${API}/trading/open`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: wallet,
          pair: selectedPair,
          direction,
          leverage,
          amount
        })
      });
      const data = await res.json();
      setMessage(data.success ? data.message : data.error);
      fetchBalance();
      fetchPositions();
    } catch (e) { setMessage('Failed to open position'); }
    finally { setLoading(false); }
  };

  const closePosition = async (positionId) => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/trading/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_address: wallet, position_id: positionId })
      });
      const data = await res.json();
      setMessage(data.success ? data.message : data.error);
      fetchBalance();
      fetchPositions();
    } catch (e) { setMessage('Failed to close position'); }
    finally { setLoading(false); }
  };

  const currentPair = pairs.find(p => p.symbol === selectedPair);

  return (
    <div style={s.container}>
      {/* Header */}
      <div style={s.header}>
        <h1 style={s.title}>⚡ Leverage Trading</h1>
        <p style={s.subtitle}>Trade BTC, ETH, SOL & more with up to 100x leverage</p>
      </div>

      {/* Connect */}
      {!wallet ? (
        <button style={s.connectBtn} onClick={connect}>Connect Wallet</button>
      ) : (
        <>
          {/* Balance Bar */}
          <div style={s.balanceBar}>
            <span>Balance: <strong style={{color: '#ffd700'}}>{balance.toFixed(2)} $GANG</strong></span>
            <span style={s.walletAddr}>{wallet.slice(0,6)}...{wallet.slice(-4)}</span>
          </div>

          {/* Trading Pairs */}
          <div style={s.pairsGrid}>
            {pairs.map(pair => (
              <div
                key={pair.symbol}
                style={{
                  ...s.pairCard,
                  border: selectedPair === pair.symbol ? '2px solid #ffd700' : '1px solid #333',
                  background: selectedPair === pair.symbol ? '#ffd70015' : '#ffffff08'
                }}
                onClick={() => setSelectedPair(pair.symbol)}
              >
                <div style={s.pairIcon}>{pair.icon}</div>
                <div style={s.pairSymbol}>{pair.symbol}</div>
                <div style={s.pairPrice}>${pair.price?.toLocaleString(undefined, {maximumFractionDigits: 6}) || '...'}</div>
              </div>
            ))}
          </div>

          {/* Trading Panel */}
          <div style={s.tradingPanel}>
            <div style={s.panelHeader}>
              <span style={s.pairTitle}>{currentPair?.icon} {selectedPair}/USD</span>
              <span style={s.priceTag}>${currentPair?.price?.toLocaleString(undefined, {maximumFractionDigits: 6})}</span>
            </div>

            {/* Direction */}
            <div style={s.directionRow}>
              <button
                style={{...s.dirBtn, ...(direction === 'long' ? s.longActive : {})}}
                onClick={() => setDirection('long')}
              >
                📈 LONG
              </button>
              <button
                style={{...s.dirBtn, ...(direction === 'short' ? s.shortActive : {})}}
                onClick={() => setDirection('short')}
              >
                📉 SHORT
              </button>
            </div>

            {/* Leverage */}
            <div style={s.section}>
              <label style={s.label}>Leverage</label>
              <div style={s.leverageRow}>
                {[10, 25, 50, 100].map(lev => (
                  <button
                    key={lev}
                    style={{
                      ...s.levBtn,
                      background: leverage === lev ? '#ffd700' : '#333',
                      color: leverage === lev ? '#000' : '#fff'
                    }}
                    onClick={() => setLeverage(lev)}
                  >
                    {lev}x
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div style={s.section}>
              <label style={s.label}>Amount ($GANG)</label>
              <div style={s.amountRow}>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(Math.max(5, +e.target.value))}
                  style={s.input}
                  min="5"
                />
                <button style={s.maxBtn} onClick={() => setAmount(Math.floor(balance))}>MAX</button>
              </div>
            </div>

            {/* Info */}
            <div style={s.infoBox}>
              <div style={s.infoRow}>
                <span>Position Size</span>
                <span>{(amount * leverage).toFixed(2)} $GANG</span>
              </div>
              <div style={s.infoRow}>
                <span>Fee (0.1%)</span>
                <span>{(amount * 0.001).toFixed(4)} $GANG</span>
              </div>
              <div style={s.infoRow}>
                <span>Liquidation</span>
                <span style={{color: '#f44'}}>{direction === 'long' ? '-' : '+'}{(100/leverage).toFixed(1)}%</span>
              </div>
            </div>

            {/* Open Button */}
            <button
              style={{
                ...s.openBtn,
                background: direction === 'long' 
                  ? 'linear-gradient(90deg, #00c853, #00a843)'
                  : 'linear-gradient(90deg, #f44, #c00)'
              }}
              onClick={openPosition}
              disabled={loading || amount > balance}
            >
              {loading ? 'Opening...' : `Open ${leverage}x ${direction.toUpperCase()}`}
            </button>
          </div>

          {/* Open Positions */}
          {positions.open.length > 0 && (
            <div style={s.positionsSection}>
              <h3 style={s.sectionTitle}>📊 Open Positions</h3>
              {positions.open.map(pos => (
                <div key={pos.position_id} style={s.positionCard}>
                  <div style={s.posHeader}>
                    <span style={s.posSymbol}>
                      {TRADING_PAIRS[pos.pair]?.icon || '📊'} {pos.pair}
                    </span>
                    <span style={{
                      ...s.posDir,
                      background: pos.direction === 'long' ? '#00c85333' : '#f4433633',
                      color: pos.direction === 'long' ? '#00c853' : '#f44'
                    }}>
                      {pos.leverage}x {pos.direction.toUpperCase()}
                    </span>
                  </div>
                  <div style={s.posDetails}>
                    <div>
                      <span style={s.posLabel}>Entry</span>
                      <span>${pos.entry_price?.toLocaleString(undefined, {maximumFractionDigits: 6})}</span>
                    </div>
                    <div>
                      <span style={s.posLabel}>Current</span>
                      <span>${pos.current_price?.toLocaleString(undefined, {maximumFractionDigits: 6})}</span>
                    </div>
                    <div>
                      <span style={s.posLabel}>Size</span>
                      <span>{pos.amount?.toFixed(2)} $GANG</span>
                    </div>
                    <div>
                      <span style={s.posLabel}>PnL</span>
                      <span style={{color: pos.unrealized_pnl >= 0 ? '#00c853' : '#f44', fontWeight: 700}}>
                        {pos.unrealized_pnl >= 0 ? '+' : ''}{pos.unrealized_pnl?.toFixed(2)} ({pos.pnl_percent?.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div style={s.posLiq}>
                    Liquidation: ${pos.liquidation_price?.toLocaleString(undefined, {maximumFractionDigits: 6})}
                  </div>
                  <button
                    style={s.closeBtn}
                    onClick={() => closePosition(pos.position_id)}
                    disabled={loading}
                  >
                    Close Position
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* History */}
          {positions.closed.length > 0 && (
            <div style={s.positionsSection}>
              <h3 style={s.sectionTitle}>📜 Trade History</h3>
              {positions.closed.slice(0, 5).map(pos => (
                <div key={pos.position_id} style={s.historyCard}>
                  <span>{pos.pair} {pos.leverage}x {pos.direction.toUpperCase()}</span>
                  <span style={{
                    color: pos.pnl >= 0 ? '#00c853' : '#f44',
                    fontWeight: 700
                  }}>
                    {pos.pnl >= 0 ? '+' : ''}{pos.pnl?.toFixed(2)} $GANG
                  </span>
                  <span style={{color: '#666', fontSize: 12}}>
                    {pos.status === 'liquidated' ? '💀 LIQUIDATED' : '✓'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Toast */}
      {message && (
        <div style={s.toast} onClick={() => setMessage('')}>{message}</div>
      )}
    </div>
  );
};

const TRADING_PAIRS = {
  GANG: { icon: '💎' },
  BTC: { icon: '₿' },
  ETH: { icon: '⟠' },
  CRO: { icon: '🔷' },
  SOL: { icon: '◎' },
  DOGE: { icon: '🐕' },
  PEPE: { icon: '🐸' },
  SHIB: { icon: '🦊' },
};

const s = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #0a0a12 0%, #0f0f1a 100%)',
    color: '#fff',
    padding: 15,
    maxWidth: 500,
    margin: '0 auto',
    fontFamily: 'system-ui, sans-serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    background: 'linear-gradient(90deg, #ffd700, #ff8c00)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
    marginTop: 5,
  },
  connectBtn: {
    width: '100%',
    background: 'linear-gradient(90deg, #ffd700, #ff8c00)',
    color: '#000',
    border: 'none',
    padding: 18,
    borderRadius: 12,
    fontSize: 18,
    fontWeight: 700,
    cursor: 'pointer',
  },
  balanceBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#ffffff08',
    padding: '12px 16px',
    borderRadius: 10,
    marginBottom: 15,
  },
  walletAddr: {
    color: '#888',
    fontSize: 12,
  },
  pairsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 8,
    marginBottom: 15,
  },
  pairCard: {
    padding: 10,
    borderRadius: 10,
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  pairIcon: {
    fontSize: 20,
  },
  pairSymbol: {
    fontSize: 12,
    fontWeight: 600,
    marginTop: 2,
  },
  pairPrice: {
    fontSize: 9,
    color: '#888',
    marginTop: 2,
  },
  tradingPanel: {
    background: '#ffffff08',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    border: '1px solid #333',
  },
  panelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pairTitle: {
    fontSize: 20,
    fontWeight: 700,
  },
  priceTag: {
    fontSize: 18,
    color: '#ffd700',
    fontWeight: 600,
  },
  directionRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
    marginBottom: 20,
  },
  dirBtn: {
    padding: 14,
    border: '2px solid #333',
    borderRadius: 10,
    background: 'transparent',
    color: '#fff',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
  },
  longActive: {
    background: '#00c85333',
    borderColor: '#00c853',
    color: '#00c853',
  },
  shortActive: {
    background: '#f4433633',
    borderColor: '#f44',
    color: '#f44',
  },
  section: {
    marginBottom: 15,
  },
  label: {
    display: 'block',
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
  },
  leverageRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 8,
  },
  levBtn: {
    padding: 12,
    border: 'none',
    borderRadius: 8,
    fontWeight: 700,
    cursor: 'pointer',
  },
  amountRow: {
    display: 'flex',
    gap: 10,
  },
  input: {
    flex: 1,
    background: '#ffffff10',
    border: '1px solid #333',
    borderRadius: 10,
    padding: 14,
    color: '#fff',
    fontSize: 16,
  },
  maxBtn: {
    background: '#ffd70033',
    color: '#ffd700',
    border: 'none',
    padding: '0 20px',
    borderRadius: 10,
    fontWeight: 700,
    cursor: 'pointer',
  },
  infoBox: {
    background: '#00000033',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '6px 0',
    fontSize: 14,
    color: '#aaa',
  },
  openBtn: {
    width: '100%',
    padding: 16,
    border: 'none',
    borderRadius: 12,
    color: '#fff',
    fontSize: 18,
    fontWeight: 700,
    cursor: 'pointer',
  },
  positionsSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#ffd700',
  },
  positionCard: {
    background: '#ffffff08',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    border: '1px solid #333',
  },
  posHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  posSymbol: {
    fontSize: 18,
    fontWeight: 700,
  },
  posDir: {
    padding: '4px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
  },
  posDetails: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px 15px',
    marginBottom: 10,
  },
  posLabel: {
    display: 'block',
    color: '#666',
    fontSize: 11,
  },
  posLiq: {
    fontSize: 12,
    color: '#f44',
    marginBottom: 10,
  },
  closeBtn: {
    width: '100%',
    padding: 12,
    background: '#ffffff15',
    border: '1px solid #666',
    borderRadius: 8,
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
  },
  historyCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#ffffff05',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  toast: {
    position: 'fixed',
    bottom: 20,
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#ffd700',
    color: '#000',
    padding: '12px 25px',
    borderRadius: 10,
    fontWeight: 600,
    zIndex: 1000,
    cursor: 'pointer',
    maxWidth: '90%',
    textAlign: 'center',
  },
};

export default Trading;
