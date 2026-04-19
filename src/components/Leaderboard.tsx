import React from 'react';
import { motion } from 'motion/react';
import { Users, Building2, RefreshCcw } from 'lucide-react';
import { Player, CountryState, User } from '../types';
import { CLUB_IMAGES } from '../constants';

interface Props {
  clubPoints: { club_name: string; remaining_evangelism_points: number; remaining_speech_points: number; }[];
  players: Player[];
  countries: Record<string, CountryState>;
  isSyncing: boolean;
  onRefresh: () => void;
  onReset: () => void;
  onResetManual: () => void;
  currentUser: User | null;
}

export default function Leaderboard({ clubPoints, players, countries, isSyncing, onRefresh, onReset, onResetManual, currentUser }: Props) {
  return (
    <div className="panel flex flex-col h-full" style={{ background: 'var(--surface)' }}>
      <div className="panel-header">
        <h2 className="panel-title">동아리 현황</h2>
        <button onClick={onRefresh} disabled={isSyncing} className="refresh-btn" style={isSyncing ? { animation: 'spin 1s linear infinite' } : {}}>
          <RefreshCcw style={{ width: 14, height: 14 }} />
        </button>
      </div>

      <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {clubPoints.length === 0 && !isSyncing && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)', fontSize: 12 }}>
            데이터를 불러올 수 없습니다.
          </div>
        )}

        {clubPoints.map((club, idx) => {
          const player = players.find(p => p.name === club.club_name);
          const ownedCount = player ? (Object.values(countries) as CountryState[]).filter(c => c.ownerId === player.id).length : 0;
          const totalBuildings = player ? (Object.values(countries) as CountryState[]).filter(c => c.ownerId === player.id).reduce((s, c) => s + c.buildings, 0) : 0;

          return (
            <motion.div
              key={club.club_name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`club-card ${ownedCount > 0 ? 'club-card-owned' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <img
                    src={CLUB_IMAGES?.[club.club_name] || player?.characterUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${club.club_name}`}
                    alt={club.club_name}
                    style={{
                      width: 40, height: 40, borderRadius: '50%',
                      border: `2px solid ${player?.color || 'var(--border2)'}`,
                      background: 'var(--bg)', padding: 2, objectFit: 'cover'
                    }}
                  />
                  <div style={{
                    position: 'absolute', bottom: -2, right: -2,
                    width: 12, height: 12, borderRadius: '50%',
                    background: player?.color || 'var(--border2)',
                    border: '2px solid var(--surface2)'
                  }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {club.club_name}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', marginTop: 1 }}>
                    {ownedCount > 0 ? `${ownedCount}개 점령 · ${totalBuildings}개 센터` : '미점령'}
                  </div>
                </div>
                {ownedCount > 0 && (
                  <div style={{
                    padding: '3px 8px', borderRadius: 99,
                    background: 'rgba(79,125,255,0.12)',
                    border: '1px solid rgba(79,125,255,0.2)',
                    fontSize: 10, fontWeight: 700, color: 'var(--accent2)',
                    flexShrink: 0
                  }}>
                    {ownedCount}🏳️
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <div className="stat-pill stat-pill-gold">
                  <div className="stat-label stat-label-gold" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Users style={{ width: 8, height: 8 }} /> Evangelism
                  </div>
                  <div className="stat-value stat-value-gold">
                    {(player?.gold ?? club.remaining_evangelism_points).toLocaleString()}
                    <span className="stat-unit">P</span>
                  </div>
                </div>
                <div className="stat-pill stat-pill-blue">
                  <div className="stat-label stat-label-blue" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Building2 style={{ width: 8, height: 8 }} /> Speech
                  </div>
                  <div className="stat-value stat-value-blue">
                    {(player?.buildingPower ?? club.remaining_speech_points).toLocaleString()}
                    <span className="stat-unit">P</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {currentUser?.role === 'admin' && (
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button className="btn-ghost" onClick={onResetManual} style={{ color: 'var(--text3)' }}>
            수동 추가 점수 초기화
          </button>
          <button className="btn-ghost" onClick={onReset}>
            게임 지표 전체 초기화
          </button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
