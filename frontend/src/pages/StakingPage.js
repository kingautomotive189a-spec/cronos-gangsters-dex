import React, { useState, useEffect } from 'react';
import { Vault, Lock, Clock, Fire, Diamond, TrendUp, Warning } from '@phosphor-icons/react';
import { Card, LoadingSpinner } from '../components/ui/shared';
import { useWeb3Store, useTokenStore, useToastStore } from '../stores';

const StakingPage = () => {
  const { isConnected, address } = useWeb3Store();
  const { getBalance } = useTokenStore();
  const { addToast } = useToastStore();
  
  const [tiers] = useState([
    { months: 6, apy: 45, multiplier: '1x' },
    { months: 12, apy: 80, multiplier: '1.8x' },
    { months: 18, apy: 110, multiplier: '2.4x' },
    { months: 24, apy: 150, multiplier: '3.3x' },
    { months: 36, apy: 210, multiplier: '4.7x' },
    { months: 48, apy: 300, multiplier: 'MAX' },
  ]);
  
  const [selectedTier, setSelectedTier] = useState(tiers[0]);
  const [stakeAmount, setStakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [positions, setPositions] = useState([]);
  
  const gangBalance = getBalance('GANG');
  
  const handleStake = async () => {
    if (!isConnected) {
      addToast('Please connect your wallet first', 'error');
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
    
    if (parseFloat(stakeAmount) > parseFloat(gangBalance)) {
      addToast('Insufficient $GANG balance', 'error');
      return;
    }
    
    setIsStaking(true);
    try {
      // This would be a real contract call in production
      addToast(`Staked ${stakeAmount} $GANG for ${selectedTier.months} months at ${selectedTier.apy}% APY!`, 'success');
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
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Max APY</p>
            <p className="font-display text-xl text-[#27AE60]">300%</p>
          </div>
          <div className="bg-[#151515] border border-white/5 p-4 min-w-[120px]">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Your Balance</p>
            <p className="font-display text-xl text-white">{parseFloat(gangBalance || 0).toFixed(2)}</p>
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
                  Balance: <span className="text-[#D4A017]">{parseFloat(gangBalance || 0).toFixed(4)}</span>
                </span>
              </div>
              <div className="bg-[#0f0f10] border border-white/10 p-4 flex items-center gap-3">
                <img 
                  src="https://dd.dexscreener.com/ds-data/tokens/cronos/0x34be5b8c30ee4fde069dc878989686abe9884470.png"
                  alt="GANG"
                  className="w-8 h-8 rounded-full"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/32?text=G'; }}
                />
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="0.0"
                  className="flex-1 bg-transparent text-2xl font-mono text-white outline-none"
                  data-testid="stake-amount-input"
                />
                <button
                  onClick={() => setStakeAmount(gangBalance)}
                  className="text-xs text-[#D4A017] hover:text-[#F4C430] uppercase tracking-widest font-bold"
                  data-testid="stake-max-btn"
                >
                  MAX
                </button>
              </div>
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
        </div>
        
        {/* Right Column - Stakes & Rewards */}
        <div className="space-y-6">
          {/* Your Stakes */}
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
            ) : (
              <div className="text-center py-8">
                <Lock size={48} className="text-zinc-600 mx-auto mb-4" />
                <h4 className="font-display text-lg text-zinc-500 mb-2">No Active Stakes</h4>
                <p className="text-sm text-zinc-600">Stake $GANG to start earning rewards</p>
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
              <div className="flex items-center justify-center gap-3 mb-2">
                <img 
                  src="https://dd.dexscreener.com/ds-data/tokens/cronos/0x34be5b8c30ee4fde069dc878989686abe9884470.png"
                  alt="GANG"
                  className="w-10 h-10 rounded-full"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/40?text=G'; }}
                />
                <p className="font-display text-5xl text-[#27AE60]">0.0000</p>
              </div>
              <p className="text-zinc-500">$GANG earned</p>
            </div>
            <button
              onClick={() => addToast('No rewards to claim', 'info')}
              disabled={true}
              className="btn-primary w-full mt-4 opacity-50"
              data-testid="claim-rewards-btn"
            >
              <Diamond size={18} weight="fill" className="mr-2 inline" />
              CLAIM REWARDS
            </button>
          </Card>
          
          {/* Lock Period Guide */}
          <Card className="p-6">
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
      </div>
    </div>
  );
};

export default StakingPage;
