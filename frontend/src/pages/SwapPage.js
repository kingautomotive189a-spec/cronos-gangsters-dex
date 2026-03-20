import React, { useState, useEffect } from 'react';
import { ArrowRight, Lightning, Info, CaretDown } from '@phosphor-icons/react';
import { Card, TokenSelector, TokenModal, SwapArrowButton, TokenInput, LoadingSpinner } from '../components/ui/shared';
import { useWalletStore, useTokensStore, useToastStore } from '../stores';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SwapPage = () => {
  const { isConnected, address, balances, updateBalance, connect } = useWalletStore();
  const { tokens, fetchTokens, loading: tokensLoading } = useTokensStore();
  const { addToast } = useToastStore();
  
  const [fromToken, setFromToken] = useState(null);
  const [toToken, setToToken] = useState(null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [quote, setQuote] = useState(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isLoadingQuote, setIsLoadingQuote] = useState(false);
  const [tokenModalOpen, setTokenModalOpen] = useState(null);
  const [slippage, setSlippage] = useState(0.5);
  const [priceHistory, setPriceHistory] = useState([]);
  const [swapHistory, setSwapHistory] = useState([]);
  
  // Initialize tokens
  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);
  
  // Set default tokens
  useEffect(() => {
    if (tokens.length > 0 && !fromToken) {
      const gangToken = tokens.find(t => t.symbol === 'GANG');
      const wcroToken = tokens.find(t => t.symbol === 'WCRO');
      setFromToken(wcroToken || tokens[0]);
      setToToken(gangToken || tokens[1]);
    }
  }, [tokens, fromToken]);
  
  // Fetch price history for chart
  useEffect(() => {
    const fetchPriceHistory = async () => {
      if (!fromToken) return;
      try {
        const response = await fetch(`${API}/price-history/${fromToken.symbol}?timeframe=24h`);
        const data = await response.json();
        setPriceHistory(data.data.map(d => ({
          time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          price: d.price
        })));
      } catch (error) {
        console.error('Error fetching price history:', error);
      }
    };
    
    fetchPriceHistory();
  }, [fromToken]);
  
  // Fetch swap history
  useEffect(() => {
    const fetchSwapHistory = async () => {
      if (!address) return;
      try {
        const response = await fetch(`${API}/swap/history/${address}`);
        const data = await response.json();
        setSwapHistory(data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching swap history:', error);
      }
    };
    
    if (isConnected) {
      fetchSwapHistory();
    }
  }, [address, isConnected]);
  
  // Fetch quote when amounts change
  useEffect(() => {
    const fetchQuote = async () => {
      if (!fromToken || !toToken || !fromAmount || parseFloat(fromAmount) <= 0) {
        setQuote(null);
        setToAmount('');
        return;
      }
      
      setIsLoadingQuote(true);
      try {
        const response = await fetch(
          `${API}/swap/quote?from_token=${fromToken.symbol}&to_token=${toToken.symbol}&amount=${fromAmount}`,
          { method: 'POST' }
        );
        const data = await response.json();
        setQuote(data);
        setToAmount(data.to_amount.toFixed(6));
      } catch (error) {
        console.error('Error fetching quote:', error);
        setQuote(null);
      }
      setIsLoadingQuote(false);
    };
    
    const debounce = setTimeout(fetchQuote, 500);
    return () => clearTimeout(debounce);
  }, [fromToken, toToken, fromAmount]);
  
  const handleSwapDirection = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };
  
  const handleSwap = async () => {
    if (!isConnected) {
      connect();
      return;
    }
    
    if (!quote || parseFloat(fromAmount) <= 0) return;
    
    // Check balance
    const userBalance = balances[fromToken.symbol] || 0;
    if (parseFloat(fromAmount) > userBalance) {
      addToast(`Insufficient ${fromToken.symbol} balance`, 'error');
      return;
    }
    
    setIsSwapping(true);
    try {
      const response = await fetch(`${API}/swap/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_token: fromToken.symbol,
          to_token: toToken.symbol,
          amount: parseFloat(fromAmount),
          wallet_address: address,
          slippage
        })
      });
      
      const result = await response.json();
      
      // Update balances
      const newFromBalance = (balances[fromToken.symbol] || 0) - parseFloat(fromAmount);
      const newToBalance = (balances[toToken.symbol] || 0) + result.to_amount;
      
      await updateBalance(fromToken.symbol, newFromBalance);
      await updateBalance(toToken.symbol, newToBalance);
      
      addToast(`Swapped ${fromAmount} ${fromToken.symbol} for ${result.to_amount.toFixed(6)} ${toToken.symbol}`, 'success');
      
      // Reset form
      setFromAmount('');
      setToAmount('');
      setQuote(null);
      
      // Refresh history
      const historyRes = await fetch(`${API}/swap/history/${address}`);
      const historyData = await historyRes.json();
      setSwapHistory(historyData.slice(0, 5));
      
    } catch (error) {
      console.error('Swap error:', error);
      addToast('Swap failed. Please try again.', 'error');
    }
    setIsSwapping(false);
  };
  
  const handleMax = () => {
    if (fromToken && balances[fromToken.symbol]) {
      setFromAmount(balances[fromToken.symbol].toString());
    }
  };
  
  if (tokensLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size={48} />
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Swap Card */}
        <div className="lg:col-span-2">
          <Card glow className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-3xl text-[#D4A017]">SWAP TOKENS</h2>
              <button className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
                <Info size={18} />
                <span className="text-xs uppercase tracking-widest">Slippage: {slippage}%</span>
              </button>
            </div>
            
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
                balance={balances[fromToken?.symbol]}
                onMax={handleMax}
                label="You Pay"
              />
            </div>
            
            <SwapArrowButton onClick={handleSwapDirection} />
            
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
                  {balances[toToken?.symbol] !== undefined && (
                    <span className="text-xs text-zinc-500">
                      Balance: <span className="text-[#D4A017]">{balances[toToken?.symbol]?.toLocaleString() || '0'}</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {isLoadingQuote ? (
                    <LoadingSpinner size={24} />
                  ) : (
                    <span className="text-2xl font-mono text-white">{toAmount || '0.0'}</span>
                  )}
                </div>
                <p className="text-sm text-zinc-500 mt-2">
                  ≈ ${toToken && toAmount ? (parseFloat(toAmount) * toToken.price_usd).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
            
            {/* Quote Details */}
            {quote && (
              <div className="mt-4 p-4 bg-[#0f0f10] border border-white/5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Rate</span>
                  <span className="font-mono">1 {fromToken.symbol} = {quote.rate.toFixed(6)} {toToken.symbol}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Price Impact</span>
                  <span className={`font-mono ${quote.price_impact > 1 ? 'text-[#E74C3C]' : 'text-[#27AE60]'}`}>
                    {quote.price_impact.toFixed(4)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Trading Fee (0.3%)</span>
                  <span className="font-mono">{quote.fee.toFixed(6)} {toToken.symbol}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Minimum Received</span>
                  <span className="font-mono">{quote.minimum_received.toFixed(6)} {toToken.symbol}</span>
                </div>
              </div>
            )}
            
            {/* Swap Button */}
            <button
              onClick={handleSwap}
              disabled={isSwapping || (!isConnected ? false : (!quote || parseFloat(fromAmount) <= 0))}
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
                  <span>SWAP NOW</span>
                </>
              )}
            </button>
          </Card>
          
          {/* Price Chart */}
          {priceHistory.length > 0 && (
            <Card className="mt-6 p-6">
              <h3 className="font-display text-xl text-[#D4A017] mb-4">
                {fromToken?.symbol} PRICE (24H)
              </h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceHistory}>
                    <XAxis 
                      dataKey="time" 
                      stroke="#71717A" 
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#71717A" 
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `$${val.toFixed(6)}`}
                      width={80}
                    />
                    <Tooltip 
                      contentStyle={{
                        background: '#151515',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 0
                      }}
                      labelStyle={{ color: '#D4A017' }}
                      formatter={(val) => [`$${val.toFixed(8)}`, 'Price']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#D4A017" 
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Token Info */}
          <Card className="p-6">
            <h3 className="font-display text-xl text-[#D4A017] mb-4">TOKEN INFO</h3>
            {fromToken && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img src={fromToken.logo} alt={fromToken.symbol} className="w-12 h-12 rounded-full" />
                  <div>
                    <p className="font-display text-lg">{fromToken.symbol}</p>
                    <p className="text-sm text-zinc-500">{fromToken.name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest">Price USD</p>
                    <p className="font-mono text-lg">${fromToken.price_usd.toFixed(fromToken.price_usd < 0.01 ? 8 : 4)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest">Price CRO</p>
                    <p className="font-mono text-lg">{fromToken.price_cro.toFixed(6)}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
          
          {/* Swap History */}
          {isConnected && swapHistory.length > 0 && (
            <Card className="p-6">
              <h3 className="font-display text-xl text-[#D4A017] mb-4">RECENT SWAPS</h3>
              <div className="space-y-3">
                {swapHistory.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-[#0f0f10] border border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{tx.from_amount.toFixed(4)}</span>
                      <span className="text-zinc-500">{tx.from_token}</span>
                      <ArrowRight size={14} className="text-[#D4A017]" />
                      <span className="font-mono text-sm">{tx.to_amount.toFixed(4)}</span>
                      <span className="text-zinc-500">{tx.to_token}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
          
          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="font-display text-xl text-[#D4A017] mb-4">QUICK ACTIONS</h3>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  const gang = tokens.find(t => t.symbol === 'GANG');
                  const wcro = tokens.find(t => t.symbol === 'WCRO');
                  if (gang && wcro) {
                    setFromToken(wcro);
                    setToToken(gang);
                  }
                }}
                className="w-full btn-secondary !py-3 text-sm"
                data-testid="buy-gang-btn"
              >
                🔫 BUY $GANG
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
                💰 SELL $GANG
              </button>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Token Selection Modal */}
      <TokenModal
        isOpen={tokenModalOpen !== null}
        onClose={() => setTokenModalOpen(null)}
        tokens={tokens}
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
