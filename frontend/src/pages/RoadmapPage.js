import React from 'react';
import { RocketLaunch, Target, Trophy, Crown, Fire, CheckCircle, Circle, Lock, Users, ChartLineUp, Globe, Shield, Coins, Lightning } from '@phosphor-icons/react';
import { Card } from '../components/ui/shared';

const RoadmapPage = () => {
  const phases = [
    {
      phase: 'Phase 1',
      title: 'THE FOUNDATION',
      subtitle: 'Building the Empire',
      status: 'completed',
      quarter: 'Q1 2024',
      icon: RocketLaunch,
      color: '#27AE60',
      items: [
        { text: '$GANG Token Launch on Cronos', done: true },
        { text: 'VVS Finance Liquidity Pool', done: true },
        { text: 'Website & Branding Launch', done: true },
        { text: 'Community Building (Telegram & Twitter)', done: true },
        { text: 'CoinGecko & CMC Listing Application', done: true },
        { text: 'Initial Marketing Campaign', done: true },
      ]
    },
    {
      phase: 'Phase 2',
      title: 'THE EXPANSION',
      subtitle: 'Growing the Family',
      status: 'in-progress',
      quarter: 'Q2 2024',
      icon: Target,
      color: '#D4A017',
      items: [
        { text: 'Cronos Gangsters DEX Launch', done: true },
        { text: 'Token Swap via VVS Router', done: true },
        { text: 'Add Liquidity Feature', done: true },
        { text: 'LP Farming Pools (4 Pools)', done: true },
        { text: '$GANG Staking Vault (Up to 300% APY)', done: true },
        { text: 'Multi-Wallet Support (MetaMask, Crypto.com)', done: true },
        { text: 'Import Custom Tokens Feature', done: false },
        { text: 'Partnership Announcements', done: false },
      ]
    },
    {
      phase: 'Phase 3',
      title: 'THE DOMINATION',
      subtitle: 'Taking Over',
      status: 'upcoming',
      quarter: 'Q3 2024',
      icon: Trophy,
      color: '#9B59B6',
      items: [
        { text: 'NFT Collection Launch (Gangster Avatars)', done: false },
        { text: 'NFT Staking for Boosted Rewards', done: false },
        { text: 'Governance Token Voting', done: false },
        { text: 'Cross-Chain Bridge (Ethereum, BSC)', done: false },
        { text: 'Mobile App (iOS & Android)', done: false },
        { text: 'CEX Listings Campaign', done: false },
      ]
    },
    {
      phase: 'Phase 4',
      title: 'THE LEGACY',
      subtitle: 'Building Forever',
      status: 'upcoming',
      quarter: 'Q4 2024',
      icon: Crown,
      color: '#E74C3C',
      items: [
        { text: 'Launchpad for New Cronos Projects', done: false },
        { text: 'Lending & Borrowing Protocol', done: false },
        { text: 'Limit Orders & Advanced Trading', done: false },
        { text: 'Revenue Sharing for $GANG Holders', done: false },
        { text: 'DAO Treasury Management', done: false },
        { text: 'Global Marketing Expansion', done: false },
      ]
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return (
          <span className="bg-[#27AE60]/20 text-[#27AE60] border border-[#27AE60]/30 px-3 py-1 text-xs uppercase tracking-widest font-bold">
            Completed
          </span>
        );
      case 'in-progress':
        return (
          <span className="bg-[#D4A017]/20 text-[#D4A017] border border-[#D4A017]/30 px-3 py-1 text-xs uppercase tracking-widest font-bold animate-pulse">
            In Progress
          </span>
        );
      default:
        return (
          <span className="bg-white/5 text-zinc-400 border border-white/10 px-3 py-1 text-xs uppercase tracking-widest">
            Upcoming
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="font-display text-5xl md:text-6xl text-[#D4A017] mb-4 flex items-center justify-center gap-4">
          <Fire size={48} weight="fill" className="animate-pulse" />
          ROADMAP
          <Fire size={48} weight="fill" className="animate-pulse" />
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
          The path to becoming the most ruthless DEX on Cronos. 
          Every phase brings us closer to domination.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <Card className="p-4 text-center">
          <CheckCircle size={32} weight="fill" className="text-[#27AE60] mx-auto mb-2" />
          <p className="font-display text-2xl text-white">12</p>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Completed</p>
        </Card>
        <Card className="p-4 text-center">
          <Lightning size={32} weight="fill" className="text-[#D4A017] mx-auto mb-2" />
          <p className="font-display text-2xl text-white">2</p>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">In Progress</p>
        </Card>
        <Card className="p-4 text-center">
          <Target size={32} weight="fill" className="text-zinc-400 mx-auto mb-2" />
          <p className="font-display text-2xl text-white">12</p>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Upcoming</p>
        </Card>
        <Card className="p-4 text-center">
          <Trophy size={32} weight="fill" className="text-[#9B59B6] mx-auto mb-2" />
          <p className="font-display text-2xl text-white">4</p>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">Phases</p>
        </Card>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#27AE60] via-[#D4A017] to-[#E74C3C] transform md:-translate-x-1/2" />

        {phases.map((phase, index) => {
          const Icon = phase.icon;
          const isLeft = index % 2 === 0;
          
          return (
            <div 
              key={phase.phase}
              className={`relative flex items-start gap-8 mb-12 ${
                isLeft ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Timeline Node */}
              <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 z-10">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center border-4"
                  style={{ 
                    backgroundColor: '#0f0f10',
                    borderColor: phase.color,
                    boxShadow: `0 0 20px ${phase.color}40`
                  }}
                >
                  <Icon size={28} weight="fill" style={{ color: phase.color }} />
                </div>
              </div>

              {/* Content Card */}
              <div className={`ml-24 md:ml-0 md:w-[calc(50%-3rem)] ${isLeft ? 'md:pr-8' : 'md:pl-8'}`}>
                <Card 
                  className={`p-6 ${phase.status === 'in-progress' ? 'glow-gold border-[#D4A017]/30' : ''}`}
                >
                  {/* Phase Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">{phase.quarter}</p>
                      <h3 className="font-display text-3xl" style={{ color: phase.color }}>
                        {phase.phase}
                      </h3>
                      <h4 className="font-display text-xl text-white">{phase.title}</h4>
                      <p className="text-sm text-zinc-500 italic">"{phase.subtitle}"</p>
                    </div>
                    {getStatusBadge(phase.status)}
                  </div>

                  {/* Items */}
                  <div className="space-y-3 mt-6">
                    {phase.items.map((item, itemIndex) => (
                      <div 
                        key={itemIndex}
                        className={`flex items-center gap-3 p-3 ${
                          item.done 
                            ? 'bg-[#27AE60]/10 border border-[#27AE60]/20' 
                            : 'bg-white/5 border border-white/5'
                        }`}
                      >
                        {item.done ? (
                          <CheckCircle size={20} weight="fill" className="text-[#27AE60] flex-shrink-0" />
                        ) : (
                          <Circle size={20} className="text-zinc-500 flex-shrink-0" />
                        )}
                        <span className={item.done ? 'text-white' : 'text-zinc-400'}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Progress */}
                  <div className="mt-6">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-zinc-500 uppercase tracking-widest">Progress</span>
                      <span style={{ color: phase.color }}>
                        {phase.items.filter(i => i.done).length}/{phase.items.length}
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${(phase.items.filter(i => i.done).length / phase.items.length) * 100}%`,
                          backgroundColor: phase.color
                        }}
                      />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Empty space for alternating layout */}
              <div className="hidden md:block md:w-[calc(50%-3rem)]" />
            </div>
          );
        })}
      </div>

      {/* Future Vision */}
      <Card className="mt-12 p-8 bg-gradient-to-br from-[#151515] to-[#1a1510] border-[#D4A017]/20">
        <div className="text-center">
          <Crown size={48} weight="fill" className="text-[#D4A017] mx-auto mb-4" />
          <h3 className="font-display text-3xl text-[#D4A017] mb-4">THE ULTIMATE VISION</h3>
          <p className="text-zinc-400 max-w-3xl mx-auto mb-8">
            Cronos Gangsters isn't just a DEX — it's a movement. We're building the most ruthless, 
            community-driven DeFi ecosystem on Cronos. Our vision extends beyond trading to create 
            a complete financial empire where every $GANG holder is part of the family.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="p-4">
              <Users size={36} weight="fill" className="text-[#D4A017] mx-auto mb-3" />
              <h4 className="font-display text-lg text-white mb-2">COMMUNITY FIRST</h4>
              <p className="text-sm text-zinc-500">
                Every decision made with the family in mind. Your voice matters.
              </p>
            </div>
            <div className="p-4">
              <Shield size={36} weight="fill" className="text-[#D4A017] mx-auto mb-3" />
              <h4 className="font-display text-lg text-white mb-2">SECURITY FOCUSED</h4>
              <p className="text-sm text-zinc-500">
                Built on battle-tested contracts. Your funds are safe with us.
              </p>
            </div>
            <div className="p-4">
              <ChartLineUp size={36} weight="fill" className="text-[#D4A017] mx-auto mb-3" />
              <h4 className="font-display text-lg text-white mb-2">CONTINUOUS GROWTH</h4>
              <p className="text-sm text-zinc-500">
                Always evolving, always improving. The grind never stops.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Call to Action */}
      <div className="text-center mt-12">
        <p className="text-zinc-400 mb-6">
          Ready to join the family? Get $GANG now and be part of history.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <a 
            href="https://vvs.finance/swap?outputCurrency=0x34be5b8c30ee4fde069dc878989686abe9884470"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary !py-3 !px-8"
          >
            BUY $GANG ON VVS
          </a>
          <a 
            href="https://dexscreener.com/cronos/0x34be5b8c30ee4fde069dc878989686abe9884470"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary !py-3 !px-8"
          >
            VIEW ON DEXSCREENER
          </a>
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;
