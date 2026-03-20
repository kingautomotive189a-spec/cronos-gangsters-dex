import React, { useState, useEffect } from 'react';
import { Vault, Lock, Clock, Fire, Diamond, TrendUp, Warning } from '@phosphor-icons/react';
import { Card, LoadingSpinner } from '../components/ui/shared';
import { useWalletStore, useToastStore } from '../stores';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const StakingPage = () => {
  const { isConnected, address, balances, connect, updateBalance } = useWalletStore();
  const { addToast } = useToastStore();
  
  const [tiers, setTiers] = useState([]);
  const [positions, setPositions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedTier, setSelectedTier] = useState(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tiersRes, statsRes] = await Promise.all([
          fetch(`${API}/staking/tiers`),
          fetch(`${API}/staking/stats`)
        ]);
        
        const tiersData = await tiersRes.json();
        const statsData = await statsRes.json();
        
        setTiers(tiersData);
        setStats(statsData);
        
        // Set default tier
        if (tiersData.length > 0 && !selectedTier) {
          setSelectedTier(tiersData[0]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    };
    
    fetchData();
  }, [selectedTier]);
  
  // Fetch user positions
  useEffect(() => {
    const fetchPositions = async () => {
      if (!address) return;
      try {
        const response = await fetch(`${API}/staking/positions/${address}`);
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
  
  const handleStake = async () => {
    if (!isConnected) {
      connect();
      return;
    }
    
    if (!selectedTier) {
      addToast('Please select a lock period', 'error');
      return;
    }
    
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      addToast('Please enter a valid amount', 'error');
      return;
    }
    
    const gangBalance = balances['GANG'] || 0;
    if (parseFloat(stakeAmount) > gangBalance) {
      addToast('Insufficient $GANG balance', 'error');
      return;
    }
    
    setIsStaking(true);
    try {
      const response = await fetch(`${API}/staking/stake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet_address: address,
          amount: parseFloat(stakeAmount),
          lock_months: selectedTier.months
        })
      });
      
      const result = await response.json();
      
      // Update balance
      const newBalance = gangBalance - parseFloat(stakeAmount);
      await updateBalance('GANG', newBalance);
      
      addToast(`Successfully staked ${stakeAmount} $GANG for ${selectedTier.months} months!`, 'success');
      
      // Refresh positions
      const posRes = await fetch(`${API}/staking/positions/${address}`);
      const posData = await posRes.json();
      setPositions(posData);
      
      // Refresh stats
      const statsRes = await fetch(`${API}/staking/stats`);
      const statsData = await statsRes.json();
      setStats(statsData);
      
      setStakeAmount('');
    } catch (error) {
      console.error('Staking error:', error);
      addToast('Staking failed. Please try again.', 'error');
    }
    setIsStaking(false);
  };
  
  const calculateUnlockDate = (months) => {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  const calculateEstimatedRewards = () => {
    if (!stakeAmount || !selectedTier || parseFloat(stakeAmount) <= 0) return 0;
    const amount = parseFloat(stakeAmount);
    const yearlyReward = amount * (selectedTier.apy / 100);
    return yearlyReward;
  };
  
  const totalStaked = positions.reduce((sum, pos) => sum + pos.amount, 0);
  const totalRewards = positions.reduce((sum, pos) => sum + (pos.rewards_earned || 0), 0);
  
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
            <Vault size={40} weight="fill" />
            $GANG STAKING VAULT
          </h1>
          <p className="text-zinc-500 mt-2">Lock $GANG for boosted rewards — longer lock = bigger cut</p>
        </div>
        
        {/* Global Stats */}
        <div className="flex gap-4 flex-wrap">
          <div className="bg-[#151515] border border-white/5 p-4 min-w-[120px]">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Total Locked</p>
            <p className="font-display text-xl text-white">{stats?.total_staked?.toLocaleString() || '0'}</p>
            <p className="text-xs text-zinc-500">${stats?.tvl_usd?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-[#151515] border border-white/5 p-4 min-w-[120px]">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Total Stakers</p>
            <p className="font-display text-xl text-white">{stats?.total_stakers || 0}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stake Form */}
        <div>
          <Card glow className="p-6">
            <h2 className="font-display text-2xl text-[#D4A017] mb-6 flex items-center gap-2">
              <Lock size={24} weight="fill" />
              STAKE $GANG
            </h2>
            
            {/* Amount Input */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <label className="text-xs text-zinc-500 uppercase tracking-widest">Amount to Stake</label>
                <span className="text-xs text-zinc-500">
                  Balance: <span className="text-[#D4A017]">{(balances['GANG'] || 0).toLocaleString()}</span>
                </span>
              </div>
              <div className="bg-[#0f0f10] border border-white/10 p-4 flex items-center gap-3">
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="0.0"
                  className="flex-1 bg-transparent text-2xl font-mono text-white outline-none"
                  data-testid="stake-amount-input"
                />
                <button
                  onClick={() => setStakeAmount((balances['GANG'] || 0).toString())}
                  className="text-xs text-[#D4A017] hover:text-[#F4C430] uppercase tracking-widest font-bold"
                  data-testid="stake-max-btn"
                >
                  MAX
                </button>
              </div>
              <p className="text-sm text-zinc-500 mt-2">
                ≈ ${stakeAmount ? (parseFloat(stakeAmount) * 0.00001306).toFixed(4) : '0.00'}
              </p>
            </div>
            
            {/* Lock Period Selection */}
            <div className="mb-6">
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Clock size={14} />
                Choose Lock Period
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {tiers.map((tier) => (
                  <button
                    key={tier.months}
                    onClick={() => setSelectedTier(tier)}
                    className={`lock-option text-center ${selectedTier?.months === tier.months ? 'selected' : ''}`}
                    data-testid={`lock-${tier.months}-btn`}
                  >
                    <div className="text-xs text-[#D4A017] mb-1">{tier.multiplier}</div>
                    <div className="font-display text-2xl">
                      {tier.months < 12 ? tier.months : tier.months / 12}
                    </div>
                    <div className="text-xs text-zinc-500 uppercase">
                      {tier.months < 12 ? 'Months' : tier.months === 12 ? 'Year' : 'Years'}
                    </div>
                    <div className={`font-display text-lg mt-2 ${tier.apy >= 200 ? 'text-[#27AE60]' : 'text-white'}`}>
                      {tier.apy}%
                    </div>
                    <div className="text-xs text-zinc-500">APY</div>
                    {tier.multiplier === 'MAX' && (
                      <Fire size={16} weight="fill" className="text-[#E74C3C] mx-auto mt-1" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Preview */}
            {selectedTier && stakeAmount && parseFloat(stakeAmount) > 0 && (
              <div className="bg-[#0f0f10] border border-[#D4A017]/20 p-4 mb-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Lock Period</span>
                  <span className="font-mono">{selectedTier.months} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">APY</span>
                  <span className="font-mono text-[#27AE60]">{selectedTier.apy}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Unlock Date</span>
                  <span className="font-mono">{calculateUnlockDate(selectedTier.months)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Est. Rewards (1yr)</span>
                  <span className="font-mono text-[#D4A017]">{calculateEstimatedRewards().toFixed(2)} GANG</span>
                </div>
                <div className="flex justify-between border-t border-white/10 pt-3">
                  <span className="text-zinc-500">Early Exit Penalty</span>
                  <span className="font-mono text-[#E74C3C]">25% of staked</span>
                </div>
              </div>
            )}
            
            {/* Stake Button */}
            <button
              onClick={handleStake}
              disabled={isStaking}
              className="btn-primary w-full flex items-center justify-center gap-2"
              data-testid="stake-button"
            >
              {isStaking ? (
                <LoadingSpinner size={20} />
              ) : (
                <>
                  <Lock size={20} weight="fill" />
                  {isConnected ? 'LOCK & STAKE $GANG' : 'CONNECT WALLET'}
                </>
              )}
            </button>
            
            {/* Warning */}
            <div className="mt-4 bg-[#E74C3C]/10 border border-[#E74C3C]/30 p-4 flex gap-3">
              <Warning size={20} className="text-[#E74C3C] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-zinc-400">
                <strong className="text-[#E74C3C]">Warning:</strong> Early withdrawal incurs a 25% penalty on your staked amount. Make sure you can commit to the lock period.
              </div>
            </div>
          </Card>
          
          {/* Lock Period Guide */}
          <Card className="mt-6 p-6">
            <h3 className="font-display text-xl text-[#D4A017] mb-4">LOCK PERIOD GUIDE</h3>
            <div className="space-y-2">
              {tiers.map((tier) => (
                <div 
                  key={tier.months}
                  className="flex justify-between items-center p-3 bg-[#0f0f10] border border-white/5"
                >
                  <span className="text-zinc-400">
                    {tier.months < 12 ? `${tier.months} Months` : `${tier.months / 12} Year${tier.months > 12 ? 's' : ''}`}
                  </span>
                  <span className="font-mono text-[#27AE60]">
                    {tier.apy}% APY · {tier.multiplier}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
        
        {/* Right Column - User Stakes & Rewards */}
        <div className="space-y-6">
          {/* User Positions */}
          <Card className="p-6">
            <h3 className="font-display text-xl text-[#D4A017] mb-4 flex items-center gap-2">
              <Vault size={20} weight="fill" />
              YOUR STAKES
            </h3>
            
            {!isConnected ? (
              <div className="text-center py-8">
                <Lock size={48} className="text-zinc-600 mx-auto mb-4" />
                <h4 className="font-display text-lg text-zinc-500 mb-2">No Active Stakes</h4>
                <p className="text-sm text-zinc-600">Connect your wallet to view your positions</p>
              </div>
            ) : positions.length === 0 ? (
              <div className="text-center py-8">
                <Lock size={48} className="text-zinc-600 mx-auto mb-4" />
                <h4 className="font-display text-lg text-zinc-500 mb-2">No Active Stakes</h4>
                <p className="text-sm text-zinc-600">Stake $GANG to start earning rewards</p>
              </div>
            ) : (
              <div className="space-y-4">
                {positions.map((position) => (
                  <div key={position.id} className="bg-[#0f0f10] border border-white/5 p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-display text-lg">{position.amount.toLocaleString()} GANG</p>
                        <p className="text-xs text-zinc-500">{position.lock_months} month lock</p>
                      </div>
                      <div className="badge-apr">{position.apy}% APY</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-zinc-500">Rewards Earned</p>
                        <p className="font-mono text-[#27AE60]">
                          {(position.rewards_earned || 0).toFixed(4)} GANG
                        </p>
                      </div>
                      <div>
                        <p className="text-zinc-500">Unlocks</p>
                        <p className="font-mono">
                          {new Date(position.unlock_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Total Summary */}
                <div className="border-t border-white/10 pt-4">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Total Staked</span>
                    <span className="font-mono">{totalStaked.toLocaleString()} GANG</span>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-zinc-500">Total Rewards</span>
                    <span className="font-mono text-[#27AE60]">{totalRewards.toFixed(4)} GANG</span>
                  </div>
                </div>
              </div>
            )}
          </Card>
          
          {/* Claimable Rewards */}
          <Card className="p-6">
            <h3 className="font-display text-xl text-[#D4A017] mb-4 flex items-center gap-2">
              <Diamond size={20} weight="fill" />
              CLAIMABLE REWARDS
            </h3>
            <div className="text-center py-4">
              <p className="font-display text-5xl text-[#27AE60]">
                {totalRewards.toFixed(4)}
              </p>
              <p className="text-zinc-500 mt-1">$GANG earned</p>
              <p className="text-sm text-zinc-600">
                ≈ ${(totalRewards * 0.00001306).toFixed(4)}
              </p>
            </div>
            <button
              onClick={() => addToast('Claim rewards feature coming soon!', 'info')}
              disabled={totalRewards <= 0}
              className="btn-primary w-full mt-4"
              data-testid="claim-rewards-btn"
            >
              <Diamond size={18} weight="fill" className="mr-2 inline" />
              CLAIM REWARDS
            </button>
          </Card>
          
          {/* Vault Stats */}
          <Card className="p-6 bg-gradient-to-br from-[#151515] to-[#1a1510] border-[#D4A017]/20">
            <h3 className="font-display text-xl text-[#D4A017] mb-4 flex items-center gap-2">
              <TrendUp size={20} weight="bold" />
              VAULT STATS
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-500">Total Value Locked</span>
                <span className="font-mono">${stats?.tvl_usd?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Total Stakers</span>
                <span className="font-mono">{stats?.total_stakers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Avg Lock Period</span>
                <span className="font-mono">{stats?.avg_lock_months || 0} months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Rewards Distributed</span>
                <span className="font-mono text-[#D4A017]">
                  {stats?.rewards_distributed?.toFixed(2) || '0'} GANG
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StakingPage;
