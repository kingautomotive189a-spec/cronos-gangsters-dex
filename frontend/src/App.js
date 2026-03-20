import React, { useState, useEffect } from 'react';
import "@/App.css";
import { Header, ToastContainer } from './components/ui/shared';
import SwapPage from './pages/SwapPage';
import LiquidityPage from './pages/LiquidityPage';
import FarmsPage from './pages/FarmsPage';
import StakingPage from './pages/StakingPage';
import { useWeb3Store, useTokenStore } from './stores';
import { TrendUp, TrendDown, Skull } from '@phosphor-icons/react';

// Hero Stats Component
const HeroStats = () => {
  const { isConnected } = useWeb3Store();
  
  return (
    <div className="bg-gradient-to-r from-[#0f0f10] via-[#151515] to-[#0f0f10] border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* GANG Price */}
          <div className="flex items-center gap-3">
            <img 
              src="https://dd.dexscreener.com/ds-data/tokens/cronos/0x34be5b8c30ee4fde069dc878989686abe9884470.png"
              alt="GANG"
              className="w-10 h-10 rounded-full"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/40?text=G'; }}
            />
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest">$GANG Price</p>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl text-white">$0.00001306</span>
                <span className="text-sm flex items-center gap-1 text-[#E74C3C]">
                  <TrendDown size={14} />
                  0.15%
                </span>
              </div>
            </div>
          </div>
          
          {/* Market Cap */}
          <div className="hidden sm:block">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Market Cap</p>
            <p className="font-display text-lg text-white">$13,000</p>
          </div>
          
          {/* Liquidity */}
          <div className="hidden md:block">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Liquidity</p>
            <p className="font-display text-lg text-white">$1,300</p>
          </div>
          
          {/* Chain */}
          <div className="hidden lg:block">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Chain</p>
            <div className="flex items-center gap-2">
              <img 
                src="https://s2.coinmarketcap.com/static/img/coins/64x64/3635.png"
                alt="CRO"
                className="w-5 h-5 rounded-full"
              />
              <p className="font-display text-lg text-white">Cronos</p>
            </div>
          </div>
          
          {/* Connection Status */}
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Status</p>
            <p className={`font-display text-lg ${isConnected ? 'text-[#27AE60]' : 'text-zinc-400'}`}>
              {isConnected ? 'Connected' : 'Not Connected'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-[#0a0a0b] border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Skull size={32} weight="fill" className="text-[#D4A017]" />
              <div>
                <h3 className="font-display text-xl text-[#D4A017]">CRONOS GANGSTERS</h3>
                <p className="text-xs text-zinc-500 tracking-widest">THE MOST RUTHLESS DEX</p>
              </div>
            </div>
            <p className="text-sm text-zinc-500 max-w-md">
              The premier decentralized exchange on Cronos chain. Swap, provide liquidity, farm, and stake with the gangsters.
            </p>
            <p className="text-xs text-zinc-600 mt-4">
              Powered by VVS Finance Router
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="font-display text-sm text-[#D4A017] mb-4 tracking-widest">PRODUCTS</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><a href="#" className="hover:text-[#D4A017] transition-colors">Swap</a></li>
              <li><a href="#" className="hover:text-[#D4A017] transition-colors">Add Liquidity</a></li>
              <li><a href="#" className="hover:text-[#D4A017] transition-colors">LP Farms</a></li>
              <li><a href="#" className="hover:text-[#D4A017] transition-colors">Staking Vault</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-display text-sm text-[#D4A017] mb-4 tracking-widest">RESOURCES</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li>
                <a 
                  href="https://dexscreener.com/cronos/0x34be5b8c30ee4fde069dc878989686abe9884470" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-[#D4A017] transition-colors"
                >
                  DexScreener
                </a>
              </li>
              <li>
                <a 
                  href="https://explorer.cronos.org/token/0x34be5b8c30ee4fde069dc878989686abe9884470" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-[#D4A017] transition-colors"
                >
                  Cronos Explorer
                </a>
              </li>
              <li>
                <a 
                  href="https://vvs.finance" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-[#D4A017] transition-colors"
                >
                  VVS Finance
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-600">
            © 2024 Cronos Gangsters. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <img 
              src="https://s2.coinmarketcap.com/static/img/coins/64x64/3635.png"
              alt="Cronos"
              className="w-6 h-6 rounded-full"
            />
            <p className="text-xs text-zinc-600">
              Built on Cronos Chain
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

function App() {
  const [currentPage, setCurrentPage] = useState('swap');
  const { fetchAllBalances } = useTokenStore();
  
  const renderPage = () => {
    switch (currentPage) {
      case 'swap':
        return <SwapPage />;
      case 'liquidity':
        return <LiquidityPage />;
      case 'farms':
        return <FarmsPage />;
      case 'staking':
        return <StakingPage />;
      default:
        return <SwapPage />;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f10]">
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <HeroStats />
      
      <main className="flex-1">
        {renderPage()}
      </main>
      
      <Footer />
      <ToastContainer />
    </div>
  );
}

export default App;
