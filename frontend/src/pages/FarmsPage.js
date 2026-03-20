import React, { useState, useEffect } from 'react';
import { Plant, Plus, Minus, Coins, TrendUp, Wallet } from '@phosphor-icons/react';
import { Card, LoadingSpinner } from '../components/ui/shared';
import { useWalletStore, useToastStore } from '../stores';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FarmsPage = () => {
  const { isConnected, address, connect } = useWalletStore();
  const { addToast } = useToastStore();
  
  const [farms, setFarms] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [depositModalOpen, setDepositModalOpen] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  
  // Fetch farms
  useEffect(() => {
    const fetchFarms = async () => {
      try {
        const response = await fetch(`${API}/farms`);
        const data = await response.json();
        setFarms(data);
      } catch (error) {
        console.error('Error fetching farms:', error);
      }
      setLoading(false);
    };
    
    fetchFarms();
  }, []);
  
  // Fetch user positions
  useEffect(() => {
    const fetchPositions = async () => {
      if (!address) return;
      try {
        const response = await fetch(`${API}/farms/positions/${address}`);
        const data = await response.json();
        setPositions(data);
      } catch (error) {
        console.error('Error fetching positions:', error);
      }
    };
    
    if (isConnected) {
      fetchPositions();
    }
  }, [address, isConnected]);
  
  const handleDeposit = async (poolId) => {
    if (!isConnected) {
      connect();
      return;
    }
    
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      addToast('Please enter a valid amount', 'error');
      return;
    }
    
    setIsDepositing(true);
    try {
      const response = await fetch(`${API}/farms/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: address,
          pool_id: poolId,
          amount: parseFloat(depositAmount)
        })
      });
      
      const result = await response.json();
      addToast(`Successfully deposited ${depositAmount} LP tokens!`, 'success');
      
      // Refresh positions
      const posRes = await fetch(`${API}/farms/positions/${address}`);
      const posData = await posRes.json();
      setPositions(posData);
      
      setDepositModalOpen(null);
      setDepositAmount('');
    } catch (error) {
      console.error('Deposit error:', error);
      addToast('Deposit failed. Please try again.', 'error');
    }
    setIsDepositing(false);
  };
  
  const getUserPosition = (poolId) => {
    return positions.find(p => p.pool_id === poolId);
  };
  
  const totalTVL = farms.reduce((sum, farm) => sum + farm.tvl, 0);
  const totalEarned = positions.reduce((sum, pos) => sum + (pos.rewards_earned || 0), 0);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size={48} />
      </div>
    );
  }
  
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
          {isConnected && (
            <div className="bg-[#151515] border border-white/5 p-4 min-w-[140px]">
              <p className="text-xs text-zinc-500 uppercase tracking-widest">Your Earnings</p>
              <p className="font-display text-2xl text-[#27AE60]">{totalEarned.toFixed(4)} GANG</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Farms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {farms.map((farm) => {
          const userPosition = getUserPosition(farm.id);
          
          return (
            <Card key={farm.id} className="p-6 card-hover">
              {/* Farm Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src={farm.token0_info?.logo} 
                      alt={farm.token0} 
                      className="w-10 h-10 rounded-full border-2 border-[#151515]"
                    />
                    <img 
                      src={farm.token1_info?.logo} 
                      alt={farm.token1} 
                      className="w-10 h-10 rounded-full border-2 border-[#151515] absolute -right-4 top-0"
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
                  <p className="font-display text-xl text-[#D4A017]">{farm.earned_token}</p>
                </div>
              </div>
              
              {/* User Position */}
              {userPosition && (
                <div className="bg-[#0f0f10] border border-white/5 p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-widest">Your Stake</p>
                      <p className="font-mono text-lg">{userPosition.lp_amount.toFixed(4)} LP</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-zinc-500 uppercase tracking-widest">Earned</p>
                      <p className="font-mono text-lg text-[#27AE60]">
                        {userPosition.rewards_earned?.toFixed(4) || '0.0000'} {farm.earned_token}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setDepositModalOpen(farm.id)}
                  className="btn-primary flex-1 !py-3 flex items-center justify-center gap-2"
                  data-testid={`deposit-${farm.id}-btn`}
                >
                  <Plus size={18} weight="bold" />
                  {isConnected ? 'DEPOSIT LP' : 'CONNECT WALLET'}
                </button>
                {userPosition && (
                  <button
                    onClick={() => addToast('Harvest feature coming soon!', 'info')}
                    className="btn-secondary !py-3 flex items-center justify-center gap-2"
                    data-testid={`harvest-${farm.id}-btn`}
                  >
                    <Coins size={18} weight="bold" />
                    HARVEST
                  </button>
                )}
              </div>
            </Card>
          );
        })}
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
              <li>1. Provide liquidity to a token pair on VVS Finance</li>
              <li>2. Receive LP tokens representing your share of the pool</li>
              <li>3. Stake your LP tokens here to earn $GANG rewards</li>
              <li>4. Harvest your rewards at any time or let them compound</li>
            </ul>
          </div>
        </div>
      </Card>
      
      {/* Deposit Modal */}
      {depositModalOpen && (
        <div className="modal-overlay" onClick={() => setDepositModalOpen(null)}>
          <div className="modal-content p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-display text-2xl text-[#D4A017] mb-6">
              DEPOSIT LP TOKENS
            </h3>
            
            <div className="mb-4">
              <label className="block text-xs text-zinc-500 uppercase tracking-widest mb-2">
                Amount
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
              Note: You need LP tokens from VVS Finance to deposit here.
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
                {isDepositing ? <LoadingSpinner size={20} /> : 'DEPOSIT'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmsPage;
