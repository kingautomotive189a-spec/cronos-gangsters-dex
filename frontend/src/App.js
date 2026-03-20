import React, { useState, useEffect } from 'react';
import "@/App.css";
import { Header, ToastContainer } from './components/ui/shared';
import SwapPage from './pages/SwapPage';
import FarmsPage from './pages/FarmsPage';
import StakingPage from './pages/StakingPage';
import { useTokensStore, useDexStatsStore, useWalletStore } from './stores';
import { TrendUp, TrendDown, Coins, Users, ChartLine, Skull } from '@phosphor-icons/react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Hero Stats Component
const HeroStats = () => {
  const { stats, fetchStats, loading } = useDexStatsStore();
  
  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);
  
  if (loading || !stats) return null;
  
  return (
    <div className="bg-gradient-to-r from-[#0f0f10] via-[#151515] to-[#0f0f10] border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* GANG Price */}
          <div className="flex items-center gap-3">
            <div className="bg-[#D4A017]/20 p-2 rounded-full">
              <Skull size={20} weight="fill" className="text-[#D4A017]" />
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-widest">$GANG Price</p>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl text-white">
                  ${stats.gang_price?.toFixed(8) || '0.00001306'}
                </span>
                <span className={`text-sm flex items-center gap-1 ${stats.gang_24h_change >= 0 ? 'text-[#27AE60]' : 'text-[#E74C3C]'}`}>
                  {stats.gang_24h_change >= 0 ? <TrendUp size={14} /> : <TrendDown size={14} />}
                  {Math.abs(stats.gang_24h_change || 0).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          
          {/* Market Cap */}
          <div className="hidden sm:block">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Market Cap</p>
            <p className="font-display text-lg text-white">${(stats.gang_market_cap || 13000).toLocaleString()}</p>
          </div>
          
          {/* Liquidity */}
          <div className="hidden md:block">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Liquidity</p>
            <p className="font-display text-lg text-white">${(stats.gang_liquidity || 1300).toLocaleString()}</p>
          </div>
          
          {/* 24h Volume */}
          <div className="hidden lg:block">
            <p className="text-xs text-zinc-500 uppercase tracking-widest">24h Volume</p>
            <p className="font-display text-lg text-white">${(stats.volume_24h || 0).toLocaleString()}</p>
          </div>
          
          {/* Total TVL */}
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest">Total TVL</p>
            <p className="font-display text-lg text-[#27AE60]">${(stats.total_tvl || 215000).toLocaleString()}</p>
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
              The premier decentralized exchange on Cronos chain. Swap, farm, and stake with the gangsters.
            </p>
          </div>
          
          {/* Links */}
          <div>
            <h4 className="font-display text-sm text-[#D4A017] mb-4 tracking-widest">PRODUCTS</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><a href="#" className="hover:text-[#D4A017] transition-colors">Swap</a></li>
              <li><a href="#" className="hover:text-[#D4A017] transition-colors">LP Farms</a></li>
              <li><a href="#" className="hover:text-[#D4A017] transition-colors">Staking Vault</a></li>
              <li><a href="#" className="hover:text-[#D4A017] transition-colors">Analytics</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-display text-sm text-[#D4A017] mb-4 tracking-widest">COMMUNITY</h4>
            <ul className="space-y-2 text-sm text-zinc-500">
              <li><a href="#" className="hover:text-[#D4A017] transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-[#D4A017] transition-colors">Telegram</a></li>
              <li><a href="#" className="hover:text-[#D4A017] transition-colors">Discord</a></li>
              <li><a href="#" className="hover:text-[#D4A017] transition-colors">Docs</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/5 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-zinc-600">
            © 2024 Cronos Gangsters. All rights reserved.
          </p>
          <p className="text-xs text-zinc-600">
            Built on Cronos Chain
          </p>
        </div>
      </div>
    </footer>
  );
};

function App() {
  const [currentPage, setCurrentPage] = useState('swap');
  
  const renderPage = () => {
    switch (currentPage) {
      case 'swap':
        return <SwapPage />;
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
