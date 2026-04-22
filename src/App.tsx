/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Map as MapIcon, PlusCircle, History, UserPlus, LogIn, LogOut, MapPin, Flag } from 'lucide-react';

import WorldMap from './components/WorldMap';
import LoginOverlay from './components/LoginOverlay';
import CountryModal from './components/CountryModal';
import AdminPanel from './components/AdminPanel';
import MembersPanel from './components/MembersPanel';
import TerritoriesPanel from './components/TerritoriesPanel';
import LogsPanel from './components/LogsPanel';
import Leaderboard from './components/Leaderboard';
import { useGameState } from './hooks/useGameState';
import { CountryState } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export default function App() {
  const {
    gameState, currentUser, clubPoints, isSyncing,
    startDate, setStartDate,
    fetchClubPoints, handleLogin, handleLogout,
    handleAddMember, handleDeleteMember, handleAdminSubmit,
    handleCancelOccupation, healGhostData, buyCountry, buildInCountry, resetGame,
    cancelBuilding, resetManualPoints
  } = useGameState();

  const [selectedCountry, setSelectedCountry] = useState<{ id: string; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'admin' | 'logs' | 'members' | 'territories'>('map');

  const occupiedCountries = Object.values(gameState.countries as Record<string, CountryState>).filter(c => c.ownerId);

  return (
    <div className="relative min-h-screen text-cyan-100 font-sans p-4 md:p-8 z-10">
      {/* Floating particles background effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>
      
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
        }
      `}</style>

      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4 p-6 rounded-2xl relative overflow-hidden holo-flicker"
        style={{
          background: 'linear-gradient(135deg, rgba(10, 20, 40, 0.9) 0%, rgba(15, 25, 50, 0.85) 100%)',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          boxShadow: '0 0 40px rgba(0, 255, 255, 0.15), inset 0 0 30px rgba(0, 255, 255, 0.03)'
        }}>
        {/* Holographic corner accents */}
        <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-cyan-400/50 rounded-tl-2xl" />
        <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-cyan-400/50 rounded-tr-2xl" />
        <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-cyan-400/50 rounded-bl-2xl" />
        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-cyan-400/50 rounded-br-2xl" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-400 rounded-2xl blur-xl opacity-30 animate-pulse" />
            <div className="relative bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-2xl border border-cyan-400/50"
              style={{ boxShadow: '0 0 30px rgba(0, 255, 255, 0.4), inset 0 0 20px rgba(255, 255, 255, 0.1)' }}>
              <MapPin className="w-8 h-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              <span className="text-cyan-400 glow-text">IUBA</span>
              <span className="text-white">경상대</span>
              <span className="text-cyan-300 font-normal ml-2 text-xl">센터 땅따먹기</span>
            </h1>
            <p className="text-cyan-500/70 text-[10px] font-bold uppercase tracking-[0.3em]" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
              // MISSION: EXPAND THE KINGDOM //
            </p>
          </div>
        </div>

        <div className="flex p-1 rounded-xl flex-wrap gap-1 relative z-10"
          style={{ background: 'rgba(0, 20, 40, 0.5)', border: '1px solid rgba(0, 255, 255, 0.2)' }}>
          {[
            { key: 'map', icon: <MapIcon className="w-4 h-4" />, label: '지도' },
            ...(currentUser?.role === 'admin' ? [
              { key: 'admin', icon: <PlusCircle className="w-4 h-4" />, label: '입력' },
              { key: 'territories', icon: <Flag className="w-4 h-4" />, label: '점령관리', badge: occupiedCountries.length },
              { key: 'members', icon: <UserPlus className="w-4 h-4" />, label: '멤버' },
            ] : []),
            { key: 'logs', icon: <History className="w-4 h-4" />, label: '기록' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-bold uppercase tracking-wider",
                activeTab === tab.key
                  ? "text-cyan-300 border"
                  : "text-cyan-600 hover:text-cyan-400"
              )}
              style={activeTab === tab.key ? {
                background: 'rgba(0, 255, 255, 0.1)',
                borderColor: tab.key === 'territories' ? 'rgba(255, 100, 100, 0.5)' : 'rgba(0, 255, 255, 0.4)',
                boxShadow: tab.key === 'territories' ? '0 0 15px rgba(255, 100, 100, 0.3)' : '0 0 15px rgba(0, 255, 255, 0.3)',
                color: tab.key === 'territories' ? '#ff6b6b' : undefined
              } : {}}
            >
              {tab.icon} {tab.label}
              {'badge' in tab && tab.badge > 0 && (
                <span className="ml-1 text-[9px] font-black rounded-full px-1.5 py-0.5 leading-none"
                  style={{ background: 'rgba(255, 100, 100, 0.8)', color: 'white', boxShadow: '0 0 10px rgba(255, 100, 100, 0.5)' }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 relative z-10">
          {currentUser ? (
            <div className="flex items-center gap-3 pl-4 border-l border-cyan-500/30">
              <div className="text-right hidden md:block">
                <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest leading-none mb-1" style={{ fontFamily: 'Share Tech Mono, monospace' }}>
                  &lt;AUTHENTICATED/&gt;
                </p>
                <p className="text-sm font-black text-cyan-300 glow-text">{currentUser.username}</p>
              </div>
              <button onClick={handleLogout}
                className="p-3 rounded-xl transition-all hover:scale-105" 
                style={{ 
                  background: 'rgba(255, 100, 100, 0.1)', 
                  border: '1px solid rgba(255, 100, 100, 0.4)',
                  boxShadow: '0 0 15px rgba(255, 100, 100, 0.2)'
                }}
                title="로그아웃">
                <LogOut className="w-5 h-5 text-red-400" />
              </button>
            </div>
          ) : (
            <button onClick={() => setActiveTab('map')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all active:scale-[0.98] uppercase tracking-wider"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(0, 168, 255, 0.3) 100%)',
                border: '1px solid rgba(0, 255, 255, 0.5)',
                color: '#00ffff',
                boxShadow: '0 0 30px rgba(0, 255, 255, 0.3), inset 0 0 20px rgba(0, 255, 255, 0.1)',
                textShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
              }}>
              <LogIn className="w-4 h-4" /> 로그인하여 참여
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        <section className="lg:col-span-4 space-y-6">
          <Leaderboard
            clubPoints={clubPoints}
            players={gameState.players}
            countries={gameState.countries}
            isSyncing={isSyncing}
            onRefresh={fetchClubPoints}
            onReset={resetGame}
            onResetManual={resetManualPoints}
            currentUser={currentUser}
          />
        </section>

        <section className="lg:col-span-8 min-h-[600px] flex flex-col">
          <AnimatePresence mode="wait">
            {activeTab === 'map' && (
              <div className="flex-1">
                <WorldMap
                  countries={gameState.countries}
                  players={gameState.players}
                  onCountryClick={(id, name) => setSelectedCountry({ id, name })}
                />
              </div>
            )}
            {activeTab === 'admin' && currentUser?.role === 'admin' && (
              <AdminPanel
                players={gameState.players}
                onSubmit={handleAdminSubmit}
                startDate={startDate}
                onStartDateChange={setStartDate}
                onRefresh={fetchClubPoints}
              />
            )}
            {activeTab === 'territories' && currentUser?.role === 'admin' && (
              <TerritoriesPanel
                players={gameState.players}
                countries={gameState.countries}
                onCancel={handleCancelOccupation}
                onCancelBuilding={cancelBuilding}
                onHealGhosts={healGhostData}
              />
            )}
            {activeTab === 'members' && currentUser?.role === 'admin' && (
              <MembersPanel
                players={gameState.players}
                onAdd={handleAddMember}
                onDelete={handleDeleteMember}
              />
            )}
            {activeTab === 'logs' && (
              <LogsPanel logs={gameState.logs} />
            )}
          </AnimatePresence>
        </section>
      </main>

      <LoginOverlay isVisible={!currentUser} onLogin={handleLogin} />

      <CountryModal
        selectedCountry={selectedCountry}
        countries={gameState.countries}
        players={gameState.players}
        onClose={() => setSelectedCountry(null)}
        onBuy={buyCountry}
        onBuild={buildInCountry}
        currentUser={currentUser}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 255, 255, 0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 255, 255, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 255, 255, 0.4); }
      `}</style>
    </div>
  );
}
