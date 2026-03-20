import React from 'react';
import { Wallet, X, Check, Warning, Skull, CaretDown, ArrowsDownUp } from '@phosphor-icons/react';
import { useWalletStore, useToastStore } from '../../stores';

// Header Component
export const Header = ({ currentPage, setCurrentPage }) => {
  const { isConnected, address, connect, disconnect } = useWalletStore();
  
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };
  
  return (
    <header className="sticky top-0 z-50 bg-[#0f0f10]/90 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage('swap')}>
            <Skull size={36} weight="fill" className="text-[#D4A017]" />
            <div>
              <h1 className="font-display text-2xl text-[#D4A017] leading-none">CRONOS GANGSTERS</h1>
              <p className="text-xs text-zinc-500 tracking-widest">THE MOST RUTHLESS DEX</p>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {['swap', 'farms', 'staking'].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`tab ${currentPage === page ? 'active' : ''}`}
                data-testid={`nav-${page}`}
              >
                {page}
              </button>
            ))}
          </nav>
          
          {/* Wallet Button */}
          {isConnected ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Connected</p>
                <p className="text-sm text-[#D4A017] font-mono">{formatAddress(address)}</p>
              </div>
              <button
                onClick={disconnect}
                className="btn-secondary !py-3 !px-4 text-sm flex items-center gap-2"
                data-testid="disconnect-wallet-btn"
              >
                <Wallet size={18} />
                <span className="hidden sm:inline">Disconnect</span>
              </button>
            </div>
          ) : (
            <button
              onClick={connect}
              className="btn-primary !py-3 !px-6 flex items-center gap-2"
              data-testid="connect-wallet-btn"
            >
              <Wallet size={18} />
              Connect Wallet
            </button>
          )}
        </div>
        
        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center gap-1 pb-4 overflow-x-auto">
          {['swap', 'farms', 'staking'].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`tab whitespace-nowrap ${currentPage === page ? 'active' : ''}`}
            >
              {page}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

// Token Selector Button
export const TokenSelector = ({ token, onClick, label }) => {
  return (
    <div>
      {label && (
        <label className="block text-xs text-zinc-500 uppercase tracking-widest mb-2">
          {label}
        </label>
      )}
      <button
        onClick={onClick}
        className="flex items-center gap-2 bg-[#1f1f22] hover:bg-[#252528] border border-white/10 hover:border-[#D4A017]/30 px-3 py-2 transition-all"
        data-testid="token-selector"
      >
        {token?.logo && (
          <img src={token.logo} alt={token.symbol} className="w-6 h-6 rounded-full" />
        )}
        <span className="font-display text-lg">{token?.symbol || 'Select'}</span>
        <CaretDown size={16} className="text-zinc-400" />
      </button>
    </div>
  );
};

// Token Modal
export const TokenModal = ({ isOpen, onClose, tokens, onSelect, excludeToken }) => {
  if (!isOpen) return null;
  
  const filteredTokens = tokens.filter(t => t.symbol !== excludeToken);
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="font-display text-xl text-[#D4A017]">Select Token</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-2 max-h-[400px] overflow-y-auto">
          {filteredTokens.map((token) => (
            <button
              key={token.symbol}
              onClick={() => { onSelect(token); onClose(); }}
              className="w-full flex items-center gap-3 p-3 hover:bg-[#1f1f22] transition-colors"
              data-testid={`select-token-${token.symbol}`}
            >
              <img src={token.logo} alt={token.symbol} className="w-10 h-10 rounded-full" />
              <div className="text-left">
                <p className="font-display text-lg">{token.symbol}</p>
                <p className="text-sm text-zinc-500">{token.name}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-sm font-mono">${token.price_usd.toFixed(token.price_usd < 0.01 ? 8 : 4)}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Swap Arrow Button
export const SwapArrowButton = ({ onClick }) => {
  return (
    <div className="flex justify-center -my-2 relative z-10">
      <button
        onClick={onClick}
        className="bg-[#151515] border border-white/10 hover:border-[#D4A017] p-3 transition-all hover:bg-[#1f1f22] group"
        data-testid="swap-direction-btn"
      >
        <ArrowsDownUp size={20} className="text-[#D4A017] group-hover:rotate-180 transition-transform" />
      </button>
    </div>
  );
};

// Stats Card
export const StatsCard = ({ label, value, subValue, trend }) => {
  return (
    <div className="bg-[#151515] border border-white/5 p-4 card-hover">
      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="font-display text-2xl text-white">{value}</p>
      {subValue && (
        <p className={`text-sm mt-1 ${trend === 'up' ? 'text-[#27AE60]' : trend === 'down' ? 'text-[#E74C3C]' : 'text-zinc-500'}`}>
          {subValue}
        </p>
      )}
    </div>
  );
};

// Toast Container
export const ToastContainer = () => {
  const { toasts, removeToast } = useToastStore();
  
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type}`}>
          {toast.type === 'success' && <Check size={20} className="text-[#27AE60]" />}
          {toast.type === 'error' && <Warning size={20} className="text-[#E74C3C]" />}
          <span className="text-sm">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="ml-2 text-zinc-400 hover:text-white">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

// Loading Spinner
export const LoadingSpinner = ({ size = 24 }) => {
  return (
    <div className="flex justify-center items-center">
      <div 
        className="animate-spin rounded-full border-2 border-[#D4A017] border-t-transparent"
        style={{ width: size, height: size }}
      />
    </div>
  );
};

// Card Component
export const Card = ({ children, className = '', glow = false }) => {
  return (
    <div className={`bg-[#151515] border border-white/5 ${glow ? 'glow-gold' : ''} ${className}`}>
      {children}
    </div>
  );
};

// Input with Max Button
export const TokenInput = ({ value, onChange, token, balance, onMax, placeholder = "0.0", label }) => {
  const usdValue = token && value ? (parseFloat(value) * token.price_usd).toFixed(2) : '0.00';
  
  return (
    <div className="bg-[#0f0f10] border border-white/10 p-4">
      {label && (
        <div className="flex justify-between mb-2">
          <span className="text-xs text-zinc-500 uppercase tracking-widest">{label}</span>
          {balance !== undefined && (
            <span className="text-xs text-zinc-500">
              Balance: <span className="text-[#D4A017]">{balance?.toLocaleString() || '0'}</span>
            </span>
          )}
        </div>
      )}
      <div className="flex items-center gap-3">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-2xl font-mono text-white outline-none"
          data-testid="token-input-amount"
        />
        {onMax && (
          <button
            onClick={onMax}
            className="text-xs text-[#D4A017] hover:text-[#F4C430] uppercase tracking-widest font-bold transition-colors"
            data-testid="max-btn"
          >
            MAX
          </button>
        )}
      </div>
      <p className="text-sm text-zinc-500 mt-2">≈ ${usdValue}</p>
    </div>
  );
};
