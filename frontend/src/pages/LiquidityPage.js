import React, { useState, useEffect } from 'react';
import { Plus, Drop, Info, ArrowRight, Warning } from '@phosphor-icons/react';
import { Card, TokenSelector, TokenModal, TokenInput, LoadingSpinner } from '../components/ui/shared';
import { useWeb3Store, useTokenStore, useLiquidityStore, useToastStore } from '../stores';

const LiquidityPage = () => {
  const { isConnected, address } = useWeb3Store();
  const { getAllTokens, getBalance } = useTokenStore();
  const { 
    tokenA, tokenB, amountA, amountB, poolInfo, isLoading,
    setTokenA, setTokenB, setAmountA, setAmountB, getPoolInfo, calculateAmountB, addLiquidity
  } = useLiquidityStore();
  const { addToast } = useToastStore();
  
  const [tokenModalOpen, setTokenModalOpen] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const tokens = getAllTokens();
  
  // Initialize tokens
  useEffect(() => {
    if (tokens.length > 0 && !tokenA) {
      const cro = tokens.find(t => t.symbol === 'CRO');
      const gang = tokens.find(t => t.symbol === 'GANG');
      setTokenA(cro || tokens[0]);
      setTokenB(gang || tokens[1]);
    }
  }, [tokens, tokenA, setTokenA, setTokenB]);
  
  // Fetch pool info when tokens change
  useEffect(() => {
    if (tokenA && tokenB) {
      getPoolInfo();
    }
  }, [tokenA, tokenB, getPoolInfo]);
  
  // Calculate amount B when amount A changes
  useEffect(() => {
    if (amountA && poolInfo?.exists) {
      calculateAmountB(amountA);
    }
  }, [amountA, poolInfo, calculateAmountB]);
  
  const handleAddLiquidity = async () => {
    if (!isConnected) {
      addToast('Please connect your wallet first', 'error');
      return;
    }
    
    if (!amountA || !amountB || parseFloat(amountA) <= 0) {
      addToast('Please enter valid amounts', 'error');
      return;
    }
    
    setIsAdding(true);
    try {
      const receipt = await addLiquidity();
      addToast('Liquidity added successfully!', 'success');
    } catch (error) {
      console.error('Add liquidity error:', error);
      addToast(error.message || 'Failed to add liquidity', 'error');
    }
    setIsAdding(false);
  };
  
  const handleMaxA = () => {
    if (tokenA) {
      const balance = getBalance(tokenA.symbol);
      if (tokenA.isNative && parseFloat(balance) > 0.1) {
        setAmountA((parseFloat(balance) - 0.1).toString());
      } else {
        setAmountA(balance);
      }
    }
  };
  
  const balanceA = tokenA ? getBalance(tokenA.symbol) : '0';
  const balanceB = tokenB ? getBalance(tokenB.symbol) : '0';
  
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Liquidity Card */}
        <div className="lg:col-span-2">
          <Card glow className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-3xl text-[#D4A017] flex items-center gap-3">
                <Drop size={32} weight="fill" />
                ADD LIQUIDITY
              </h2>
            </div>
            
            <p className="text-zinc-400 mb-6">
              Add liquidity to receive LP tokens and earn trading fees
            </p>
            
            {/* Token A */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <TokenSelector
                  token={tokenA}
                  onClick={() => setTokenModalOpen('tokenA')}
                  label="Token A"
                />
              </div>
              <TokenInput
                value={amountA}
                onChange={setAmountA}
                token={tokenA}
                balance={balanceA}
                onMax={handleMaxA}
                label="Amount"
              />
            </div>
            
            {/* Plus Icon */}
            <div className="flex justify-center -my-2 relative z-10">
              <div className="bg-[#151515] border border-white/10 p-3">
                <Plus size={20} className="text-[#D4A017]" />
              </div>
            </div>
            
            {/* Token B */}
            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between">
                <TokenSelector
                  token={tokenB}
                  onClick={() => setTokenModalOpen('tokenB')}
                  label="Token B"
                />
              </div>
              <TokenInput
                value={amountB}
                onChange={setAmountB}
                token={tokenB}
                balance={balanceB}
                label="Amount"
                readOnly={poolInfo?.exists}
              />
            </div>
            
            {/* Pool Info */}
            {isLoading ? (
              <div className="mt-6 p-4 bg-[#0f0f10] border border-white/5 flex justify-center">
                <LoadingSpinner size={24} />
              </div>
            ) : poolInfo?.exists ? (
              <div className="mt-6 p-4 bg-[#0f0f10] border border-white/5 space-y-3">
                <h4 className="text-sm text-[#D4A017] uppercase tracking-widest">Pool Information</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">{tokenA?.symbol} Reserve</span>
                  <span className="font-mono">{parseFloat(poolInfo.reserveA).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">{tokenB?.symbol} Reserve</span>
                  <span className="font-mono">{parseFloat(poolInfo.reserveB).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Pool Rate</span>
                  <span className="font-mono">1 {tokenA?.symbol} = {poolInfo.price?.toFixed(6)} {tokenB?.symbol}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Total LP Supply</span>
                  <span className="font-mono">{parseFloat(poolInfo.totalSupply).toLocaleString()}</span>
                </div>
              </div>
            ) : poolInfo && !poolInfo.exists ? (
              <div className="mt-6 p-4 bg-[#D4A017]/10 border border-[#D4A017]/30 flex items-start gap-3">
                <Info size={20} className="text-[#D4A017] flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-[#D4A017] font-bold">New Pool</p>
                  <p className="text-zinc-400">This pool doesn't exist yet. You will create it and set the initial price.</p>
                </div>
              </div>
            ) : null}
            
            {/* Share of Pool Preview */}
            {amountA && amountB && parseFloat(amountA) > 0 && (
              <div className="mt-4 p-4 bg-[#0f0f10] border border-white/5 space-y-2">
                <h4 className="text-sm text-[#D4A017] uppercase tracking-widest">You Will Receive</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      {tokenA?.logo && (
                        <img src={tokenA.logo} alt={tokenA.symbol} className="w-8 h-8 rounded-full" 
                             onError={(e) => { e.target.src = 'https://via.placeholder.com/32'; }} />
                      )}
                      {tokenB?.logo && (
                        <img src={tokenB.logo} alt={tokenB.symbol} 
                             className="w-8 h-8 rounded-full absolute -right-3 top-0 border-2 border-[#151515]"
                             onError={(e) => { e.target.src = 'https://via.placeholder.com/32'; }} />
                      )}
                    </div>
                    <span className="ml-4 font-display">{tokenA?.symbol}/{tokenB?.symbol} LP</span>
                  </div>
                  <span className="text-zinc-400 text-sm">LP Tokens</span>
                </div>
              </div>
            )}
            
            {/* Add Liquidity Button */}
            <button
              onClick={handleAddLiquidity}
              disabled={isAdding || !amountA || !amountB}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
              data-testid="add-liquidity-btn"
            >
              {isAdding ? (
                <>
                  <LoadingSpinner size={20} />
                  <span>ADDING LIQUIDITY...</span>
                </>
              ) : !isConnected ? (
                <>
                  <Drop size={20} weight="fill" />
                  <span>CONNECT WALLET</span>
                </>
              ) : (
                <>
                  <Plus size={20} weight="bold" />
                  <span>ADD LIQUIDITY</span>
                </>
              )}
            </button>
            
            {/* Warning */}
            <div className="mt-4 bg-[#E74C3C]/10 border border-[#E74C3C]/30 p-4 flex gap-3">
              <Warning size={20} className="text-[#E74C3C] flex-shrink-0 mt-0.5" />
              <div className="text-sm text-zinc-400">
                <strong className="text-[#E74C3C]">Impermanent Loss Risk:</strong> Providing liquidity carries risk. 
                Token price changes may result in impermanent loss compared to holding.
              </div>
            </div>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Your Liquidity */}
          <Card className="p-6">
            <h3 className="font-display text-xl text-[#D4A017] mb-4">YOUR LIQUIDITY</h3>
            {!isConnected ? (
              <div className="text-center py-6">
                <Drop size={48} className="text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-500 text-sm">Connect wallet to view your liquidity positions</p>
              </div>
            ) : (
              <div className="text-center py-6">
                <Drop size={48} className="text-zinc-600 mx-auto mb-4" />
                <p className="text-zinc-500 text-sm">No liquidity positions found</p>
                <p className="text-xs text-zinc-600 mt-2">Add liquidity to start earning fees</p>
              </div>
            )}
          </Card>
          
          {/* How It Works */}
          <Card className="p-6">
            <h3 className="font-display text-xl text-[#D4A017] mb-4">HOW IT WORKS</h3>
            <div className="space-y-4 text-sm">
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-[#D4A017]/20 rounded-full flex items-center justify-center text-[#D4A017] font-bold text-xs flex-shrink-0">
                  1
                </div>
                <p className="text-zinc-400">
                  Select two tokens and enter the amounts you want to provide
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-[#D4A017]/20 rounded-full flex items-center justify-center text-[#D4A017] font-bold text-xs flex-shrink-0">
                  2
                </div>
                <p className="text-zinc-400">
                  Approve the tokens and confirm the transaction
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-[#D4A017]/20 rounded-full flex items-center justify-center text-[#D4A017] font-bold text-xs flex-shrink-0">
                  3
                </div>
                <p className="text-zinc-400">
                  Receive LP tokens representing your share of the pool
                </p>
              </div>
              <div className="flex gap-3">
                <div className="w-6 h-6 bg-[#27AE60]/20 rounded-full flex items-center justify-center text-[#27AE60] font-bold text-xs flex-shrink-0">
                  $
                </div>
                <p className="text-zinc-400">
                  Earn 0.25% fee on every trade proportional to your share
                </p>
              </div>
            </div>
          </Card>
          
          {/* VVS Integration */}
          <Card className="p-6 bg-gradient-to-br from-[#151515] to-[#1a1510] border-[#D4A017]/20">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="https://s2.coinmarketcap.com/static/img/coins/64x64/14519.png" 
                alt="VVS" 
                className="w-8 h-8 rounded-full"
              />
              <h3 className="font-display text-lg text-[#D4A017]">VVS FINANCE</h3>
            </div>
            <p className="text-sm text-zinc-400">
              Liquidity is provided through VVS Finance pools. Your LP tokens can be staked in farms to earn additional rewards.
            </p>
          </Card>
        </div>
      </div>
      
      {/* Token Selection Modal */}
      <TokenModal
        isOpen={tokenModalOpen !== null}
        onClose={() => setTokenModalOpen(null)}
        onSelect={(token) => {
          if (tokenModalOpen === 'tokenA') {
            setTokenA(token);
          } else {
            setTokenB(token);
          }
        }}
        excludeToken={tokenModalOpen === 'tokenA' ? tokenB?.symbol : tokenA?.symbol}
      />
    </div>
  );
};

export default LiquidityPage;
