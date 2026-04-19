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
    fetchClubPoints, handleLogin, handleLogout,
    handleAddMember, handleDeleteMember, handleAdminSubmit,
    handleCancelOccupation, healGhostData, buyCountry, buildInCountry, resetGame,
    cancelBuilding
  } = useGameState();

  const [selectedCountry, setSelectedCountry] = useState<{ id: string; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'admin' | 'logs' | 'members' | 'territories'>('map');

  const occupiedCountries = Object.values(gameState.countries as Record<string, CountryState>).filter(c => c.ownerId);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans p-4 md:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-white border border-[#E2E8F0] p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-md">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#1E293B]">
              📍 IUBA경상대 <span className="text-blue-600 font-normal">센터 땅따먹기</span>
            </h1>
            <p className="text-[#64748B] text-[10px] font-bold uppercase tracking-widest">하나님 나라의 확장과 선교 미션</p>
          </div>
        </div>

        <div className="flex bg-[#F8FAFC] border border-[#E2E8F0] p-1 rounded-xl flex-wrap gap-1">
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
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-semibold",
                activeTab === tab.key
                  ? "bg-white shadow-sm border border-[#E2E8F0] " + (tab.key === 'territories' ? 'text-red-500' : 'text-blue-600')
                  : "text-[#64748B] hover:text-[#1E293B]"
              )}
            >
              {tab.icon} {tab.label}
              {'badge' in tab && tab.badge > 0 && (
                <span className="ml-1 bg-red-500 text-white text-[9px] font-black rounded-full px-1.5 py-0.5 leading-none">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-3 pl-4 border-l border-[#E2E8F0]">
              <div className="text-right hidden md:block">
                <p className="text-[10px] font-extrabold text-[#64748B] uppercase tracking-widest leading-none mb-1">Authenticated</p>
                <p className="text-sm font-black text-[#1E293B]">{currentUser.username}</p>
              </div>
              <button onClick={handleLogout}
                className="p-3 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-100 transition-colors" title="로그아웃">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button onClick={() => setActiveTab('map')}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all active:scale-[0.98]">
              <LogIn className="w-4 h-4" /> 로그인하여 참여
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Leaderboard */}
        <section className="lg:col-span-4 space-y-6">
          <Leaderboard
            clubPoints={clubPoints}
            players={gameState.players}
            countries={gameState.countries}
            isSyncing={isSyncing}
            onRefresh={fetchClubPoints}
            onReset={resetGame}
            onResetManual={resetManualPoints} 
          />
        </section>

        {/* Right: Main View */}
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
              <AdminPanel players={gameState.players} onSubmit={handleAdminSubmit} />
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
              <MembersPanel players={gameState.players} onAdd={handleAddMember} onDelete={handleDeleteMember} />
            )}
            {activeTab === 'logs' && (
              <LogsPanel logs={gameState.logs} />
            )}
          </AnimatePresence>
        </section>
      </main>

      {/* Login Overlay */}
      <LoginOverlay isVisible={!currentUser} onLogin={handleLogin} />

      {/* Country Modal */}
      <CountryModal
        selectedCountry={selectedCountry}
        countries={gameState.countries}
        players={gameState.players}
        onClose={() => setSelectedCountry(null)}
        onBuy={buyCountry}
        onBuild={buildInCountry}
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
