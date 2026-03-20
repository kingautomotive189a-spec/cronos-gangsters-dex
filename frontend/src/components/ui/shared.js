import React, { useState } from 'react';
import { Wallet, X, Check, Warning, Skull, CaretDown, ArrowsDownUp, Copy, SignOut, Plus } from '@phosphor-icons/react';
import { useWeb3Store, useTokenStore, useToastStore } from '../../stores';

// Header Component
export const Header = ({ currentPage, setCurrentPage }) => {
  const { isConnected, address, connect, disconnect, isConnecting } = useWeb3Store();
  const [showWalletModal, setShowWalletModal] = useState(false);
  
  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };
  
  const handleConnect = async (walletType) => {
    try {
      await connect(walletType);
      setShowWalletModal(false);
    } catch (error) {
      useToastStore.getState().addToast(error.message, 'error');
    }
  };
  
  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    useToastStore.getState().addToast('Address copied!', 'success');
  };
  
  return (
    <>
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
              {['swap', 'liquidity', 'farms', 'staking', 'roadmap'].map((page) => (
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
                  <p className="text-xs text-zinc-500 uppercase tracking-widest">Cronos</p>
                  <p className="text-sm text-[#D4A017] font-mono">{formatAddress(address)}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={copyAddress}
                    className="bg-[#151515] border border-white/10 p-3 hover:border-[#D4A017]/50 transition-colors"
                    title="Copy Address"
                  >
                    <Copy size={18} className="text-zinc-400" />
                  </button>
                  <button
                    onClick={disconnect}
                    className="btn-secondary !py-3 !px-4 text-sm flex items-center gap-2"
                    data-testid="disconnect-wallet-btn"
                  >
                    <SignOut size={18} />
                    <span className="hidden sm:inline">Disconnect</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowWalletModal(true)}
                disabled={isConnecting}
                className="btn-primary !py-3 !px-6 flex items-center gap-2"
                data-testid="connect-wallet-btn"
              >
                {isConnecting ? (
                  <LoadingSpinner size={18} />
                ) : (
                  <Wallet size={18} />
                )}
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
          
          {/* Mobile Navigation */}
          <nav className="md:hidden flex items-center gap-1 pb-4 overflow-x-auto">
            {['swap', 'liquidity', 'farms', 'staking', 'roadmap'].map((page) => (
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
      
      {/* Wallet Connection Modal */}
      {showWalletModal && (
        <WalletModal 
          onClose={() => setShowWalletModal(false)} 
          onConnect={handleConnect}
        />
      )}
    </>
  );
};

// Wallet Connection Modal
export const WalletModal = ({ onClose, onConnect }) => {
  const wallets = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
      description: 'Connect using MetaMask',
    },
    {
      id: 'cryptocom',
      name: 'Crypto.com DeFi Wallet',
      icon: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3635.png',
      description: 'Connect using Crypto.com',
    },
    {
      id: 'walletconnect',
      name: 'WalletConnect',
      icon: 'https://walletconnect.com/images/favicon-32x32.png',
      description: 'Scan with mobile wallet',
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: 'https://www.coinbase.com/favicon.ico',
      description: 'Connect using Coinbase',
    },
  ];
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="font-display text-2xl text-[#D4A017]">CONNECT WALLET</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-3">
          {wallets.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => onConnect(wallet.id)}
              className="w-full flex items-center gap-4 p-4 bg-[#0f0f10] border border-white/10 hover:border-[#D4A017]/50 transition-all group"
              data-testid={`wallet-${wallet.id}`}
            >
              <img src={wallet.icon} alt={wallet.name} className="w-10 h-10 rounded-lg" />
              <div className="text-left">
                <p className="font-display text-lg group-hover:text-[#D4A017] transition-colors">
                  {wallet.name}
                </p>
                <p className="text-sm text-zinc-500">{wallet.description}</p>
              </div>
            </button>
          ))}
        </div>
        
        <div className="p-6 pt-0">
          <p className="text-xs text-zinc-500 text-center">
            By connecting, you agree to the Terms of Service
          </p>
        </div>
      </div>
    </div>
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
        {token?.logo ? (
          <img 
            src={token.logo} 
            alt={token.symbol} 
            className="w-6 h-6 rounded-full"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/24?text=' + token.symbol[0]; }}
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-[#D4A017]/20 flex items-center justify-center text-xs text-[#D4A017]">
            ?
          </div>
        )}
        <span className="font-display text-lg">{token?.symbol || 'Select'}</span>
        <CaretDown size={16} className="text-zinc-400" />
      </button>
    </div>
  );
};

// Token Modal with Import Feature
export const TokenModal = ({ isOpen, onClose, onSelect, excludeToken }) => {
  const { getAllTokens, addToken } = useTokenStore();
  const { addToast } = useToastStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [importAddress, setImportAddress] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [showImport, setShowImport] = useState(false);
  
  if (!isOpen) return null;
  
  const tokens = getAllTokens();
  const filteredTokens = tokens.filter(t => 
    t.symbol !== excludeToken &&
    (t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
     t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     t.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const handleImport = async () => {
    if (!importAddress || !importAddress.startsWith('0x')) {
      addToast('Please enter a valid contract address', 'error');
      return;
    }
    
    setIsImporting(true);
    try {
      const token = await addToken(importAddress);
      addToast(`${token.symbol} imported successfully!`, 'success');
      setImportAddress('');
      setShowImport(false);
    } catch (error) {
      addToast(error.message, 'error');
    }
    setIsImporting(false);
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="font-display text-xl text-[#D4A017]">Select Token</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        {/* Search */}
        <div className="p-4 border-b border-white/10">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or paste address"
            className="w-full bg-[#0f0f10] border border-white/10 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-[#D4A017]"
            data-testid="token-search-input"
          />
        </div>
        
        {/* Token List */}
        <div className="max-h-[300px] overflow-y-auto">
          {filteredTokens.map((token) => (
            <button
              key={token.address}
              onClick={() => { onSelect(token); onClose(); }}
              className="w-full flex items-center gap-3 p-4 hover:bg-[#1f1f22] transition-colors border-b border-white/5"
              data-testid={`select-token-${token.symbol}`}
            >
              <img 
                src={token.logo} 
                alt={token.symbol} 
                className="w-10 h-10 rounded-full"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/40?text=' + token.symbol[0]; }}
              />
              <div className="text-left flex-1">
                <p className="font-display text-lg">{token.symbol}</p>
                <p className="text-sm text-zinc-500">{token.name}</p>
              </div>
              {token.imported && (
                <span className="text-xs text-[#D4A017] bg-[#D4A017]/10 px-2 py-1">IMPORTED</span>
              )}
            </button>
          ))}
        </div>
        
        {/* Import Token */}
        <div className="p-4 border-t border-white/10">
          {showImport ? (
            <div className="space-y-3">
              <input
                type="text"
                value={importAddress}
                onChange={(e) => setImportAddress(e.target.value)}
                placeholder="Paste token contract address (0x...)"
                className="w-full bg-[#0f0f10] border border-white/10 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:border-[#D4A017] font-mono text-sm"
                data-testid="import-token-input"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowImport(false)}
                  className="btn-secondary flex-1 !py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={isImporting}
                  className="btn-primary flex-1 !py-2 text-sm"
                  data-testid="import-token-btn"
                >
                  {isImporting ? <LoadingSpinner size={16} /> : 'Import'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowImport(true)}
              className="w-full flex items-center justify-center gap-2 text-[#D4A017] hover:text-[#F4C430] transition-colors py-2"
            >
              <Plus size={18} />
              <span className="font-display">Import Custom Token</span>
            </button>
          )}
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

// Input with Token Logo and Balance
export const TokenInput = ({ value, onChange, token, balance, onMax, placeholder = "0.0", label, readOnly = false }) => {
  return (
    <div className="bg-[#0f0f10] border border-white/10 p-4">
      {label && (
        <div className="flex justify-between mb-2">
          <span className="text-xs text-zinc-500 uppercase tracking-widest">{label}</span>
          {balance !== undefined && (
            <span className="text-xs text-zinc-500">
              Balance: <span className="text-[#D4A017]">{parseFloat(balance || 0).toFixed(6)}</span>
            </span>
          )}
        </div>
      )}
      <div className="flex items-center gap-3">
        {token?.logo && (
          <img 
            src={token.logo} 
            alt={token.symbol} 
            className="w-8 h-8 rounded-full"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/32?text=' + token?.symbol?.[0]; }}
          />
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          className={`flex-1 bg-transparent text-2xl font-mono text-white outline-none ${readOnly ? 'cursor-not-allowed' : ''}`}
          data-testid="token-input-amount"
        />
        {onMax && !readOnly && (
          <button
            onClick={onMax}
            className="text-xs text-[#D4A017] hover:text-[#F4C430] uppercase tracking-widest font-bold transition-colors"
            data-testid="max-btn"
          >
            MAX
          </button>
        )}
      </div>
    </div>
  );
};
