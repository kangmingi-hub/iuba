/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Map as MapIcon, PlusCircle, History, UserPlus, LogIn, LogOut, Globe, Flag } from 'lucide-react';

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

type Tab = 'map' | 'admin' | 'logs' | 'members' | 'territories';

export default function App() {
  const {
    gameState, currentUser, clubPoints, isSyncing,
    fetchClubPoints, handleLogin, handleLogout,
    handleAddMember, handleDeleteMember, handleAdminSubmit,
    handleCancelOccupation, healGhostData, buyCountry, buildInCountry, resetGame,
    cancelBuilding, resetManualPoints
  } = useGameState();

  const [selectedCountry, setSelectedCountry] = useState<{ id: string; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('map');

  const occupiedCountries = Object.values(gameState.countries as Record<string, CountryState>).filter(c => c.ownerId);

  const tabs = [
    { key: 'map' as Tab, icon: <MapIcon className="w-4 h-4" />, label: '지도' },
    ...(currentUser?.role === 'admin' ? [
      { key: 'admin' as Tab, icon: <PlusCircle className="w-4 h-4" />, label: '점수 입력' },
      { key: 'territories' as Tab, icon: <Flag className="w-4 h-4" />, label: '점령 관리', badge: occupiedCountries.length },
      { key: 'members' as Tab, icon: <UserPlus className="w-4 h-4" />, label: '멤버' },
    ] : []),
    { key: 'logs' as Tab, icon: <History className="w-4 h-4" />, label: '기록' },
  ];

  return (
    <div className="app-root">
      {/* 배경 장식 */}
      <div className="bg-decoration" />

      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          {/* 로고 */}
          <div className="logo-area">
            <div className="logo-icon">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h1 className="logo-title">IUBA 경상대</h1>
              <p className="logo-sub">센터 땅따먹기 · 선교 미션</p>
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <nav className="tab-nav">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn('tab-btn', activeTab === tab.key && 'tab-btn-active')}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {'badge' in tab && tab.badge > 0 && (
                  <span className="tab-badge">{tab.badge}</span>
                )}
                {activeTab === tab.key && (
                  <motion.div layoutId="tab-indicator" className="tab-indicator" />
                )}
              </button>
            ))}
          </nav>

          {/* 유저 영역 */}
          <div className="user-area">
            {currentUser ? (
              <div className="user-info">
                <div className="user-avatar">
                  {currentUser.username.charAt(0).toUpperCase()}
                </div>
                <div className="user-text">
                  <span className="user-role">{currentUser.role === 'admin' ? 'Admin' : 'Member'}</span>
                  <span className="user-name">{currentUser.username}</span>
                </div>
                <button onClick={handleLogout} className="logout-btn" title="로그아웃">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button className="login-btn">
                <LogIn className="w-4 h-4" />
                <span>로그인</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="app-main">
        {/* 왼쪽: 리더보드 */}
        <aside className="sidebar">
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
        </aside>

        {/* 오른쪽: 메인 뷰 */}
        <section className="main-content">
          <AnimatePresence mode="wait">
            {activeTab === 'map' && (
              <motion.div
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="panel h-full"
              >
                <WorldMap
                  countries={gameState.countries}
                  players={gameState.players}
                  onCountryClick={(id, name) => setSelectedCountry({ id, name })}
                />
              </motion.div>
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

      {/* 로그인 오버레이 */}
      <LoginOverlay isVisible={!currentUser} onLogin={handleLogin} />

      {/* 나라 모달 */}
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
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');

        :root {
  --bg: #020b18;
  --bg2: #041020;
  --bg3: #061528;
  --surface: #071830;
  --surface2: #0a1f3a;
  --border: rgba(0, 212, 255, 0.12);
  --border2: rgba(0, 212, 255, 0.28);
  --accent: #00d4ff;
  --accent2: #40e8ff;
  --accent-glow: rgba(0, 212, 255, 0.35);
  --gold: #ffa500;
  --gold2: #ffcc44;
  --text: #c8f0ff;
  --text2: #6ab8d4;
  --text3: #2e6a82;
  --success: #00ffcc;
  --danger: #ff4466;
  --radius: 16px;
  --radius-lg: 24px;
}

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'Outfit', sans-serif;
          min-height: 100vh;
        }

        .app-root {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        .bg-decoration {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background:
            radial-gradient(ellipse 80% 50% at 20% 0%, rgba(79,125,255,0.08) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 100%, rgba(124,159,255,0.06) 0%, transparent 50%);
        }

        /* ── Header ── */
        .app-header {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(10, 15, 30, 0.85);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }

        .header-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
          height: 64px;
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .logo-area {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--accent), #6366f1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 0 20px var(--accent-glow);
        }

        .logo-title {
          font-size: 16px;
          font-weight: 800;
          color: var(--text);
          letter-spacing: -0.5px;
          line-height: 1.2;
        }

        .logo-sub {
          font-size: 10px;
          font-weight: 500;
          color: var(--text3);
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }

        /* ── Tab Nav ── */
        .tab-nav {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
        }

        .tab-btn {
          position: relative;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border: none;
          background: none;
          color: var(--text3);
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 600;
          border-radius: 10px;
          cursor: pointer;
          transition: color 0.2s, background 0.2s;
          white-space: nowrap;
        }

        .tab-btn:hover { color: var(--text2); background: rgba(255,255,255,0.04); }
        .tab-btn-active { color: var(--accent2) !important; }

        .tab-indicator {
          position: absolute;
          inset: 0;
          border-radius: 10px;
          background: rgba(79, 125, 255, 0.12);
          border: 1px solid rgba(79, 125, 255, 0.25);
          z-index: -1;
        }

        .tab-badge {
          background: var(--danger);
          color: white;
          font-size: 9px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 99px;
          line-height: 1.2;
        }

        /* ── User Area ── */
        .user-area { flex-shrink: 0; margin-left: auto; }

        .user-info {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 6px 6px 12px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 99px;
        }

        .user-avatar {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, var(--accent), #6366f1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          color: white;
        }

        .user-text { display: flex; flex-direction: column; }
        .user-role { font-size: 9px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.5px; line-height: 1; }
        .user-name { font-size: 13px; font-weight: 700; color: var(--text); line-height: 1.3; }

        .logout-btn {
          width: 32px;
          height: 32px;
          border: none;
          background: rgba(255, 90, 110, 0.1);
          color: var(--danger);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }
        .logout-btn:hover { background: rgba(255, 90, 110, 0.2); }

        .login-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 99px;
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s, box-shadow 0.2s;
          box-shadow: 0 0 20px var(--accent-glow);
        }
        .login-btn:hover { background: var(--accent2); box-shadow: 0 0 30px var(--accent-glow); }

        /* ── Main Layout ── */
        .app-main {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 20px;
          min-height: calc(100vh - 64px);
          position: relative;
          z-index: 1;
        }

        @media (max-width: 1024px) {
          .app-main { grid-template-columns: 1fr; }
        }

        .sidebar { display: flex; flex-direction: column; }

        .main-content {
          min-height: 600px;
          display: flex;
          flex-direction: column;
        }

        /* ── Panel (공통 카드) ── */
       .panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 0 30px rgba(0, 212, 255, 0.06), inset 0 1px 0 rgba(0, 212, 255, 0.08);
}

        .panel-header {
          padding: 20px 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .panel-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.3px;
        }

        /* ── Leaderboard 카드 ── */
       .club-card {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 14px;
  transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
  cursor: default;
  box-shadow: 0 0 0 transparent;
}
.club-card:hover {
  border-color: var(--border2);
  transform: translateY(-1px);
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.1);
}
.club-card-owned {
  border-color: rgba(0, 212, 255, 0.35);
  background: rgba(0, 212, 255, 0.04);
  box-shadow: 0 0 15px rgba(0, 212, 255, 0.08);
}

        .stat-pill {
          flex: 1;
          padding: 10px 12px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .stat-pill-gold { background: rgba(245, 166, 35, 0.08); border: 1px solid rgba(245, 166, 35, 0.15); }
        .stat-pill-blue { background: rgba(79, 125, 255, 0.08); border: 1px solid rgba(79, 125, 255, 0.15); }

        .stat-label {
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
          opacity: 0.6;
        }
        .stat-label-gold { color: var(--gold); }
        .stat-label-blue { color: var(--accent2); }

        .stat-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 15px;
          font-weight: 700;
          display: flex;
          align-items: baseline;
          gap: 3px;
        }
        .stat-value-gold { color: var(--gold2); }
        .stat-value-blue { color: var(--accent2); }
        .stat-unit { font-size: 9px; opacity: 0.5; }

        /* ── 버튼 ── */
        .btn-primary {
          width: 100%;
          padding: 14px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 12px;
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s, box-shadow 0.2s;
          box-shadow: 0 0 20px var(--accent-glow);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          letter-spacing: 0.3px;
        }
        .btn-primary:hover { background: var(--accent2); box-shadow: 0 0 30px var(--accent-glow); }
        .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }

        .btn-ghost {
          width: 100%;
          padding: 10px;
          background: transparent;
          color: var(--text3);
          border: 1px solid var(--border);
          border-radius: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
          transition: color 0.2s, border-color 0.2s;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .btn-ghost:hover { color: var(--danger); border-color: rgba(255, 90, 110, 0.3); }

        .btn-danger {
          padding: 8px 16px;
          background: rgba(255, 90, 110, 0.1);
          color: var(--danger);
          border: 1px solid rgba(255, 90, 110, 0.2);
          border-radius: 8px;
          font-family: 'Outfit', sans-serif;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .btn-danger:hover { background: rgba(255, 90, 110, 0.2); }

        .btn-confirm {
          padding: 8px 14px;
          background: var(--danger);
          color: white;
          border: none;
          border-radius: 8px;
          font-family: 'Outfit', sans-serif;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-cancel {
          padding: 8px 14px;
          background: var(--surface2);
          color: var(--text2);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-family: 'Outfit', sans-serif;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        /* ── Input ── */
        .input {
          width: 100%;
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 12px 16px;
          color: var(--text);
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 500;
          outline: none;
          transition: border-color 0.2s;
        }
        .input:focus { border-color: var(--accent); }
        .input::placeholder { color: var(--text3); }

        .input-large {
          width: 100%;
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px;
          color: var(--text);
          font-family: 'JetBrains Mono', monospace;
          font-size: 32px;
          font-weight: 700;
          text-align: center;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-large:focus { border-color: var(--accent); }
        .input-large::placeholder { color: var(--text3); }

        .select {
          width: 100%;
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 12px 16px;
          color: var(--text);
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 500;
          outline: none;
          cursor: pointer;
          appearance: none;
        }

        .input-label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          color: var(--text3);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }

        /* ── Login Overlay ── */
        .login-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(10, 15, 30, 0.95);
          backdrop-filter: blur(20px);
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          background: var(--surface);
          border: 1px solid var(--border2);
          border-radius: 32px;
          padding: 48px;
          text-align: center;
          box-shadow: 0 0 80px rgba(79, 125, 255, 0.15);
        }

        .login-icon {
          width: 72px;
          height: 72px;
          background: linear-gradient(135deg, var(--accent), #6366f1);
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 28px;
          box-shadow: 0 0 40px var(--accent-glow);
        }

        /* ── Country Modal ── */
        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
        }

        .modal-card {
          width: 100%;
          max-width: 520px;
          background: var(--surface);
          border: 1px solid var(--border2);
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 0 60px rgba(0, 0, 0, 0.5);
        }

        .modal-header {
          padding: 24px 28px;
          border-bottom: 1px solid var(--border);
          background: var(--bg2);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .country-player-btn {
          padding: 12px 8px;
          border-radius: 14px;
          border: 1px solid;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          background: transparent;
          font-family: 'Outfit', sans-serif;
        }
        .country-player-btn:hover:not(:disabled) { transform: translateY(-2px); }
        .country-player-btn:disabled { opacity: 0.25; cursor: not-allowed; }

        /* ── Log items ── */
        .log-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 12px;
          background: var(--surface2);
          border: 1px solid var(--border);
        }

        .log-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* ── Member card ── */
        .member-card {
          padding: 14px 16px;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: border-color 0.2s;
        }
        .member-card:hover { border-color: var(--border2); }

        /* ── Territory row ── */
        .territory-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          border-bottom: 1px solid var(--border);
          transition: background 0.15s;
        }
        .territory-row:hover { background: rgba(255,255,255,0.02); }
        .territory-row:last-child { border-bottom: none; }

        /* ── Admin type btn ── */
        .type-btn {
          flex: 1;
          padding: 16px;
          border-radius: 14px;
          border: 1px solid var(--border);
          background: transparent;
          color: var(--text3);
          font-family: 'Outfit', sans-serif;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .type-btn:hover { border-color: var(--border2); color: var(--text2); }
        .type-btn-gold { border-color: rgba(245,166,35,0.4) !important; background: rgba(245,166,35,0.08) !important; color: var(--gold2) !important; }
        .type-btn-blue { border-color: rgba(79,125,255,0.4) !important; background: rgba(79,125,255,0.08) !important; color: var(--accent2) !important; }

        /* ── Scrollbar ── */
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 4px; }

        /* ── Refresh btn ── */
        .refresh-btn {
          width: 30px;
          height: 30px;
          border: none;
          background: rgba(255,255,255,0.05);
          color: var(--text3);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: color 0.2s, background 0.2s;
        }
        .refresh-btn:hover { color: var(--text2); background: rgba(255,255,255,0.08); }

        /* ── Close btn ── */
        .close-btn {
          width: 36px;
          height: 36px;
          border: none;
          background: rgba(255,255,255,0.05);
          color: var(--text3);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: color 0.2s, background 0.2s;
        }
        .close-btn:hover { color: var(--text); background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
}
