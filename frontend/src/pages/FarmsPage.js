import React, { useState, useEffect } from 'react';
import { Plant, Plus, Minus, Coins, TrendUp, Wallet } from '@phosphor-icons/react';
import { Card, LoadingSpinner } from '../components/ui/shared';
import { useWeb3Store, useTokenStore, useToastStore } from '../stores';
import { DEFAULT_TOKENS } from '../config/contracts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Token logos mapping
const TOKEN_LOGOS = {};
DEFAULT_TOKENS.forEach(t => {
  TOKEN_LOGOS[t.symbol] = t.logo;
});

const FarmsPage = () => {
  const { isConnected, address } = useWeb3Store();
  const { addToast } = useToastStore();
  
  const [farms, setFarms] = useState([
    {
      id: 'gang-cro',
      name: 'GANG/CRO',
      token0: 'GANG',
      token1: 'CRO',
      apr: 245.5,
      tvl: 1300,
      multiplier: '10x',
      earned_token: 'GANG',
      token0Logo: 'https://i.ibb.co/wNpqj6cV/gang-logo.png',
      token1Logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3635.png',
    },
    {
      id: 'gang-usdc',
      name: 'GANG/USDC',
      token0: 'GANG',
      token1: 'USDC',
      apr: 180.2,
      tvl: 850,
      multiplier: '8x',
      earned_token: 'GANG',
      token0Logo: 'https://i.ibb.co/wNpqj6cV/gang-logo.png',
      token1Logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
    },
    {
      id: 'cro-usdc',
      name: 'CRO/USDC',
      token0: 'CRO',
      token1: 'USDC',
      apr: 45.8,
      tvl: 125000,
      multiplier: '2x',
      earned_token: 'GANG',
      token0Logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3635.png',
      token1Logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png',
    },
    {
      id: 'eth-cro',
      name: 'ETH/CRO',
      token0: 'WETH',
      token1: 'CRO',
      apr: 65.3,
      tvl: 89000,
      multiplier: '3x',
      earned_token: 'GANG',
      token0Logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
      token1Logo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3635.png',
    },
  ]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [depositModalOpen, setDepositModalOpen] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  
  const handleDeposit = async (poolId) => {
    if (!isConnected) {
      addToast('Please connect your wallet first', 'error');
      return;
    }
    
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      addToast('Please enter a valid amount', 'error');
      return;
    }
    
    setIsDepositing(true);
    try {
      // This would be a real contract call in production
      addToast(`Staked ${depositAmount} LP tokens to ${poolId}!`, 'success');
      setDepositModalOpen(null);
      setDepositAmount('');
    } catch (error) {
      console.error('Deposit error:', error);
      addToast('Deposit failed. Please try again.', 'error');
    }
    setIsDepositing(false);
  };
  
  const totalTVL = farms.reduce((sum, farm) => sum + farm.tvl, 0);
  
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-4xl text-[#D4A017] flex items-center gap-3">
            <Plant size={40} weight="fill" />
            LP FARMS
          </h1>
          <p className="text-zinc-500 mt-2">Stake LP tokens, earn $GANG rewards</p>
        </div>
        
        {/* Stats */}
        <div className="flex gap-4">
          <div className="bg-[#151515] border border-white/5 p-4 min-w-[140px]">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Total TVL</p>
            <p className="font-display text-2xl text-white">${totalTVL.toLocaleString()}</p>
          </div>
        </div>
      </div>
      
      {/* Farms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {farms.map((farm) => (
          <Card key={farm.id} className="p-6 card-hover">
            {/* Farm Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src={farm.token0Logo} 
                    alt={farm.token0} 
                    className="w-10 h-10 rounded-full border-2 border-[#151515]"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/40?text=' + farm.token0[0]; }}
                  />
                  <img 
                    src={farm.token1Logo} 
                    alt={farm.token1} 
                    className="w-10 h-10 rounded-full border-2 border-[#151515] absolute -right-4 top-0"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/40?text=' + farm.token1[0]; }}
                  />
                </div>
                <div className="ml-4">
                  <h3 className="font-display text-2xl">{farm.name}</h3>
                  <p className="text-xs text-zinc-500">Earn {farm.earned_token}</p>
                </div>
              </div>
              <div className="badge-apr px-3 py-1">
                {farm.multiplier}
              </div>
            </div>
            
            {/* Farm Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest">APR</p>
                <p className="font-display text-2xl text-[#27AE60] flex items-center gap-1">
                  <TrendUp size={18} weight="bold" />
                  {farm.apr.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest">TVL</p>
                <p className="font-display text-xl">${farm.tvl.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Earn</p>
                <div className="flex items-center gap-2">
                  <img 
                    src="https://dd.dexscreener.com/ds-data/tokens/cronos/0x34be5b8c30ee4fde069dc878989686abe9884470.png"
                    alt="GANG"
                    className="w-5 h-5 rounded-full"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <p className="font-display text-xl text-[#D4A017]">{farm.earned_token}</p>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setDepositModalOpen(farm.id)}
                className="btn-primary flex-1 !py-3 flex items-center justify-center gap-2"
                data-testid={`deposit-${farm.id}-btn`}
              >
                <Plus size={18} weight="bold" />
                {isConnected ? 'STAKE LP' : 'CONNECT WALLET'}
              </button>
              <button
                onClick={() => addToast('Harvest feature coming soon!', 'info')}
                className="btn-secondary !py-3 flex items-center justify-center gap-2"
                data-testid={`harvest-${farm.id}-btn`}
              >
                <Coins size={18} weight="bold" />
                HARVEST
              </button>
            </div>
          </Card>
        ))}
      </div>
      
      {/* Info Section */}
      <Card className="mt-8 p-6 bg-gradient-to-r from-[#151515] to-[#1a1a1a]">
        <div className="flex items-start gap-4">
          <div className="bg-[#D4A017]/20 p-3 rounded-full">
            <Plant size={32} weight="fill" className="text-[#D4A017]" />
          </div>
          <div>
            <h3 className="font-display text-xl text-[#D4A017] mb-2">HOW LP FARMING WORKS</h3>
            <ul className="text-zinc-400 text-sm space-y-2">
              <li className="flex items-center gap-2">
                <span className="text-[#D4A017]">1.</span> 
                Add liquidity on the Liquidity page to receive LP tokens
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#D4A017]">2.</span> 
                Stake your LP tokens in a farm to earn $GANG rewards
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#D4A017]">3.</span> 
                Harvest your rewards at any time or let them compound
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#D4A017]">4.</span> 
                Withdraw your LP tokens anytime to remove liquidity
              </li>
            </ul>
          </div>
        </div>
      </Card>
      
      {/* Deposit Modal */}
      {depositModalOpen && (
        <div className="modal-overlay" onClick={() => setDepositModalOpen(null)}>
          <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-display text-2xl text-[#D4A017] mb-6">
              STAKE LP TOKENS
            </h3>
            
            <div className="mb-4">
              <label className="block text-xs text-zinc-500 uppercase tracking-widest mb-2">
                LP Token Amount
              </label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0.0"
                className="token-input"
                data-testid="deposit-amount-input"
              />
            </div>
            
            <p className="text-sm text-zinc-500 mb-6">
              Stake your LP tokens to earn $GANG rewards based on the pool's APR.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setDepositModalOpen(null)}
                className="btn-secondary flex-1 !py-3"
              >
                CANCEL
              </button>
              <button
                onClick={() => handleDeposit(depositModalOpen)}
                disabled={isDepositing}
                className="btn-primary flex-1 !py-3"
                data-testid="confirm-deposit-btn"
              >
                {isDepositing ? <LoadingSpinner size={20} /> : 'STAKE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmsPage;
