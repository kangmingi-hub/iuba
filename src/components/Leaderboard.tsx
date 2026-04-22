import React from 'react';
import { motion } from 'motion/react';
import { Users, Building2, RefreshCcw, Zap } from 'lucide-react';
import { Player, CountryState, User } from '../types';
import { CLUB_IMAGES } from '../constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

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
    <div className="sleek-card flex flex-col h-full overflow-hidden">
      <div className="sleek-panel-header flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <h2 className="sleek-panel-title">POWER RANKINGS</h2>
        </div>
        <button onClick={onRefresh} disabled={isSyncing}
          className={cn("p-1.5 rounded-lg transition-colors", isSyncing && "animate-spin")}
          style={{ color: 'rgba(0, 255, 255, 0.6)' }}>
          <RefreshCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="team-list p-4 space-y-3 custom-scrollbar overflow-y-auto max-h-[calc(100vh-320px)]">
        {clubPoints.length === 0 && !isSyncing && (
          <div className="text-center py-10" style={{ color: 'rgba(0, 255, 255, 0.4)' }}>
            <p className="text-xs font-mono">// NO DATA AVAILABLE //</p>
          </div>
        )}

        {clubPoints.map((club, idx) => {
          const player = players.find(p => p.name === club.club_name);
          const ownedCount = player
            ? (Object.values(countries) as CountryState[]).filter(c => c.ownerId === player.id).length
            : 0;
          const totalBuildings = player
            ? (Object.values(countries) as CountryState[])
                .filter(c => c.ownerId === player.id)
                .reduce((sum, c) => sum + c.buildings, 0)
            : 0;

          return (
            <motion.div
              key={club.club_name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={cn(
                "relative flex flex-col gap-2 p-3.5 rounded-xl transition-all group overflow-hidden"
              )}
              style={{
                background: ownedCount > 0 
                  ? 'linear-gradient(135deg, rgba(0, 255, 255, 0.08) 0%, rgba(0, 168, 255, 0.05) 100%)'
                  : 'rgba(15, 25, 45, 0.6)',
                border: ownedCount > 0 
                  ? '1px solid rgba(0, 255, 255, 0.3)' 
                  : '1px solid rgba(0, 255, 255, 0.1)',
                boxShadow: ownedCount > 0 ? '0 0 20px rgba(0, 255, 255, 0.1)' : 'none'
              }}
            >
              {/* Rank indicator */}
              <div className="absolute top-2 right-2 text-[10px] font-black font-mono"
                style={{ color: 'rgba(0, 255, 255, 0.3)' }}>
                #{String(idx + 1).padStart(2, '0')}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full blur-md opacity-50"
                      style={{ backgroundColor: player?.color || '#00ffff' }} />
                    <img
                      src={CLUB_IMAGES[club.club_name] || player?.characterUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${club.club_name}`}
                      alt={club.club_name}
                      className="relative w-10 h-10 rounded-full border-2 p-0.5"
                      style={{ 
                        borderColor: player?.color || '#00ffff',
                        backgroundColor: 'rgba(10, 20, 40, 0.9)',
                        boxShadow: `0 0 15px ${player?.color || '#00ffff'}40`
                      }}
                    />
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2"
                      style={{ 
                        backgroundColor: player?.color || '#00ffff',
                        borderColor: '#0a0e17',
                        boxShadow: `0 0 8px ${player?.color || '#00ffff'}`
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-tight"
                      style={{ color: '#e0ffff', fontFamily: 'Orbitron, sans-serif' }}>
                      {club.club_name}
                    </h3>
                    <p className="text-[9px] font-bold font-mono" style={{ color: 'rgba(0, 255, 255, 0.5)' }}>
                      {ownedCount} TERRITORIES | {totalBuildings} CENTERS
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2" style={{ borderTop: '1px solid rgba(0, 255, 255, 0.1)' }}>
                <div className="flex-1 flex flex-col gap-1 p-2 rounded-lg"
                  style={{ 
                    background: 'rgba(255, 200, 50, 0.08)',
                    border: '1px solid rgba(255, 200, 50, 0.2)'
                  }}>
                  <div className="flex items-center gap-1.5 opacity-80">
                    <Users className="w-2.5 h-2.5" style={{ color: '#ffc832' }} />
                    <span className="text-[8px] font-black uppercase tracking-tighter" 
                      style={{ color: '#ffc832', fontFamily: 'Share Tech Mono, monospace' }}>
                      GOLD
                    </span>
                  </div>
                  <div className="text-sm font-black flex items-center gap-1" style={{ color: '#ffd700' }}>
                    {(player?.gold ?? club.remaining_evangelism_points).toLocaleString()}
                    <span className="text-[9px] font-bold opacity-60">P</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-1 p-2 rounded-lg"
                  style={{ 
                    background: 'rgba(0, 200, 255, 0.08)',
                    border: '1px solid rgba(0, 200, 255, 0.2)'
                  }}>
                  <div className="flex items-center gap-1.5 opacity-80">
                    <Building2 className="w-2.5 h-2.5" style={{ color: '#00c8ff' }} />
                    <span className="text-[8px] font-black uppercase tracking-tighter"
                      style={{ color: '#00c8ff', fontFamily: 'Share Tech Mono, monospace' }}>
                      POWER
                    </span>
                  </div>
                  <div className="text-sm font-black flex items-center gap-1" style={{ color: '#00ffff' }}>
                    {(player?.buildingPower ?? club.remaining_speech_points).toLocaleString()}
                    <span className="text-[9px] font-bold opacity-60">P</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {currentUser?.role === 'admin' && (
        <div className="mt-auto p-4 space-y-2" style={{ borderTop: '1px solid rgba(0, 255, 255, 0.15)', background: 'rgba(0, 20, 40, 0.5)' }}>
          <button
            onClick={onResetManual}
            className="w-full py-2.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl transition-all hover:scale-[1.02]"
            style={{
              background: 'rgba(255, 200, 50, 0.1)',
              border: '1px solid rgba(255, 200, 50, 0.3)',
              color: '#ffc832'
            }}
          >
            수동 추가 점수 초기화
          </button>
          <button
            onClick={onReset}
            className="w-full py-2.5 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl transition-all hover:scale-[1.02]"
            style={{
              background: 'rgba(255, 100, 100, 0.1)',
              border: '1px solid rgba(255, 100, 100, 0.3)',
              color: '#ff6b6b'
            }}
          >
            게임 지표 초기화
          </button>
        </div>
      )}
    </div>
  );
}
