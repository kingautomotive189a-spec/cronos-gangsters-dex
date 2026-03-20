import React, { useState, useEffect, useCallback } from 'react';
import { Lightning, Info, Gear, ArrowRight } from '@phosphor-icons/react';
import { Card, TokenSelector, TokenModal, SwapArrowButton, TokenInput, LoadingSpinner } from '../components/ui/shared';
import { useWeb3Store, useTokenStore, useSwapStore, useToastStore } from '../stores';
import { ethers } from 'ethers';

const SwapPage = () => {
  const { isConnected, address } = useWeb3Store();
  const { getAllTokens, getBalance } = useTokenStore();
  const { 
    fromToken, toToken, fromAmount, toAmount, quote, isLoading,
    setFromToken, setToToken, setFromAmount, switchTokens, getQuote, executeSwap, slippage, setSlippage
  } = useSwapStore();
  const { addToast } = useToastStore();
  
  const [tokenModalOpen, setTokenModalOpen] = useState(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const tokens = getAllTokens();
  
  // Initialize tokens
  useEffect(() => {
    if (tokens.length > 0 && !fromToken) {
      const cro = tokens.find(t => t.symbol === 'CRO');
      const gang = tokens.find(t => t.symbol === 'GANG');
      setFromToken(cro || tokens[0]);
      setToToken(gang || tokens[1]);
    }
  }, [tokens, fromToken, setFromToken, setToToken]);
  
  // Debounced quote fetching
  useEffect(() => {
    if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) return;
    
    const timer = setTimeout(() => {
      getQuote().catch(err => {
        console.error('Quote error:', err);
      });
    }, 500);
    
    return () => clearTimeout(timer);
  }, [fromToken, toToken, fromAmount, getQuote]);
  
  const handleSwap = async () => {
    if (!isConnected) {
      addToast('Please connect your wallet first', 'error');
      return;
    }
    
    if (!quote) {
      addToast('Please wait for quote', 'error');
      return;
    }
    
    const balance = getBalance(fromToken.symbol);
    if (parseFloat(fromAmount) > parseFloat(balance)) {
      addToast(`Insufficient ${fromToken.symbol} balance`, 'error');
      return;
    }
    
    setIsSwapping(true);
    try {
      const receipt = await executeSwap();
      addToast(
        `Swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}!`,
        'success'
      );
    } catch (error) {
      console.error('Swap error:', error);
      addToast(error.message || 'Swap failed', 'error');
    }
    setIsSwapping(false);
  };
  
  const handleMax = () => {
    if (fromToken) {
      const balance = getBalance(fromToken.symbol);
      // Leave some for gas if native
      if (fromToken.isNative && parseFloat(balance) > 0.1) {
        setFromAmount((parseFloat(balance) - 0.1).toString());
      } else {
        setFromAmount(balance);
      }
    }
  };
  
  const fromBalance = fromToken ? getBalance(fromToken.symbol) : '0';
  const toBalance = toToken ? getBalance(toToken.symbol) : '0';
  
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Swap Card */}
        <div className="lg:col-span-2">
          <Card glow className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-3xl text-[#D4A017]">SWAP TOKENS</h2>
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors p-2"
              >
                <Gear size={20} />
              </button>
            </div>
            
            {/* Settings Panel */}
            {showSettings && (
              <div className="mb-6 p-4 bg-[#0f0f10] border border-white/10">
                <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Slippage Tolerance</p>
                <div className="flex gap-2">
                  {[0.1, 0.5, 1.0].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSlippage(s)}
                      className={`slippage-btn ${slippage === s ? 'active' : ''}`}
                    >
                      {s}%
                    </button>
                  ))}
                  <input
                    type="number"
                    value={slippage}
                    onChange={(e) => setSlippage(parseFloat(e.target.value) || 0.5)}
                    className="w-20 bg-[#151515] border border-white/10 px-3 py-2 text-sm text-center outline-none focus:border-[#D4A017]"
                    placeholder="Custom"
                  />
                </div>
              </div>
            )}
            
            {/* From Token */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <TokenSelector
                  token={fromToken}
                  onClick={() => setTokenModalOpen('from')}
                  label="From"
                />
              </div>
              <TokenInput
                value={fromAmount}
                onChange={setFromAmount}
                token={fromToken}
                balance={fromBalance}
                onMax={handleMax}
                label="You Pay"
              />
            </div>
            
            <SwapArrowButton onClick={switchTokens} />
            
            {/* To Token */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <TokenSelector
                  token={toToken}
                  onClick={() => setTokenModalOpen('to')}
                  label="To"
                />
              </div>
              <div className="bg-[#0f0f10] border border-white/10 p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-zinc-500 uppercase tracking-widest">You Receive</span>
                  <span className="text-xs text-zinc-500">
                    Balance: <span className="text-[#D4A017]">{parseFloat(toBalance).toFixed(6)}</span>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {toToken?.logo && (
                    <img 
                      src={toToken.logo} 
                      alt={toToken.symbol} 
                      className="w-8 h-8 rounded-full"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/32?text=' + toToken?.symbol?.[0]; }}
                    />
                  )}
                  {isLoading ? (
                    <LoadingSpinner size={24} />
                  ) : (
                    <span className="text-2xl font-mono text-white">{toAmount || '0.0'}</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Quote Details */}
            {quote && (
              <div className="mt-4 p-4 bg-[#0f0f10] border border-white/5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Rate</span>
                  <span className="font-mono">1 {fromToken?.symbol} = {quote.rate?.toFixed(6)} {toToken?.symbol}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Price Impact</span>
                  <span className={`font-mono ${quote.priceImpact > 1 ? 'text-[#E74C3C]' : 'text-[#27AE60]'}`}>
                    ~{quote.priceImpact?.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Slippage Tolerance</span>
                  <span className="font-mono">{slippage}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Route</span>
                  <span className="font-mono text-xs">
                    {quote.path?.length === 2 ? 'Direct' : 'Via WCRO'}
                  </span>
                </div>
              </div>
            )}
            
            {/* Swap Button */}
            <button
              onClick={handleSwap}
              disabled={isSwapping || isLoading || (!isConnected ? false : !quote)}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
              data-testid="swap-button"
            >
              {isSwapping ? (
                <>
                  <LoadingSpinner size={20} />
                  <span>SWAPPING...</span>
                </>
              ) : !isConnected ? (
                <>
                  <Lightning size={20} weight="fill" />
                  <span>CONNECT WALLET TO SWAP</span>
                </>
              ) : (
                <>
                  <Lightning size={20} weight="fill" />
                  <span>SWAP VIA VVS FINANCE</span>
                </>
              )}
            </button>
            
            <p className="text-xs text-zinc-500 text-center mt-4">
              Powered by VVS Finance Router on Cronos
            </p>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Token Info */}
          <Card className="p-6">
            <h3 className="font-display text-xl text-[#D4A017] mb-4">TOKEN INFO</h3>
            {fromToken && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={fromToken.logo} 
                    alt={fromToken.symbol} 
                    className="w-12 h-12 rounded-full"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/48?text=' + fromToken?.symbol?.[0]; }}
                  />
                  <div>
                    <p className="font-display text-lg">{fromToken.symbol}</p>
                    <p className="text-sm text-zinc-500">{fromToken.name}</p>
                  </div>
                </div>
                {fromToken.address !== 'NATIVE' && (
                  <div className="bg-[#0f0f10] p-3 border border-white/5">
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Contract</p>
                    <p className="font-mono text-xs text-[#D4A017] break-all">{fromToken.address}</p>
                  </div>
                )}
              </div>
            )}
          </Card>
          
          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="font-display text-xl text-[#D4A017] mb-4">QUICK ACTIONS</h3>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  const gang = tokens.find(t => t.symbol === 'GANG');
                  const cro = tokens.find(t => t.symbol === 'CRO');
                  if (gang && cro) {
                    setFromToken(cro);
                    setToToken(gang);
                  }
                }}
                className="w-full btn-secondary !py-3 text-sm flex items-center justify-center gap-2"
                data-testid="buy-gang-btn"
              >
                <img 
                  src="https://dd.dexscreener.com/ds-data/tokens/cronos/0x34be5b8c30ee4fde069dc878989686abe9884470.png" 
                  alt="GANG" 
                  className="w-5 h-5 rounded-full"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                BUY $GANG
              </button>
              <button 
                onClick={() => {
                  const gang = tokens.find(t => t.symbol === 'GANG');
                  const usdc = tokens.find(t => t.symbol === 'USDC');
                  if (gang && usdc) {
                    setFromToken(gang);
                    setToToken(usdc);
                  }
                }}
                className="w-full btn-secondary !py-3 text-sm"
              >
                SELL $GANG
              </button>
            </div>
          </Card>
          
          {/* VVS Info */}
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
              All swaps are executed through VVS Finance, the leading DEX on Cronos chain with deep liquidity.
            </p>
          </Card>
        </div>
      </div>
      
      {/* Token Selection Modal */}
      <TokenModal
        isOpen={tokenModalOpen !== null}
        onClose={() => setTokenModalOpen(null)}
        onSelect={(token) => {
          if (tokenModalOpen === 'from') {
            setFromToken(token);
          } else {
            setToToken(token);
          }
        }}
        excludeToken={tokenModalOpen === 'from' ? toToken?.symbol : fromToken?.symbol}
      />
    </div>
  );
};

export default SwapPage;
