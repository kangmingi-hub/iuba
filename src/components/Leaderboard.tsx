import React from 'react';
import { motion } from 'motion/react';
import { Users, Building2, RefreshCcw } from 'lucide-react';
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
    <div className="flex flex-col h-full overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-xl shadow-blue-900/20">

      {/* 헤더 */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-white/15">
        <h2 className="text-sm font-bold text-white tracking-wide">지역별 포인트 현황</h2>
        <button
          onClick={onRefresh}
          disabled={isSyncing}
          className={cn(
            "p-1.5 rounded-lg transition-colors text-white/40 hover:text-white/80 hover:bg-white/10",
            isSyncing && "animate-spin"
          )}
        >
          <RefreshCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 리스트 */}
      <div className="p-3 space-y-2.5 custom-scrollbar overflow-y-auto max-h-[calc(100vh-320px)]">
        {clubPoints.length === 0 && !isSyncing && (
          <div className="text-center py-10">
            <p className="text-xs text-white/30">데이터를 불러올 수 없습니다.</p>
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
               className={cn(
                  "flex flex-col gap-2.5 p-3.5 rounded-2xl border transition-all",
                  ownedCount > 0
                    ? "border-blue-300/60 bg-white/80 hover:bg-white/90"
                    : "border-white/40 bg-white/75 hover:bg-white/85"
                )}
            >
              {/* 클럽 정보 */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={CLUB_IMAGES[club.club_name] || player?.characterUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${club.club_name}`}
                    alt={club.club_name}
                    className="w-10 h-10 rounded-full border-2 p-0.5 bg-white/10"
                    style={{ borderColor: player?.color || 'rgba(255,255,255,0.3)' }}
                  />
                  <div
                    className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white/20 shadow-sm"
                    style={{ backgroundColor: player?.color || 'rgba(255,255,255,0.3)' }}
                  />
                </div>
                <div>
                  <h3 className="font-black text-[#1E293B] text-sm uppercase tracking-tight">
                  <p className="text-[9px] font-bold text-slate-400">
                </div>
              </div>

              {/* 포인트 */}
              <div className="flex gap-2 pt-2 border-t border-white/10">
                <div className="flex-1 flex flex-col gap-1 bg-amber-400/15 p-2.5 rounded-xl border border-amber-300/20">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-2.5 h-2.5 text-amber-300/70" />
                    <span className="text-[8px] font-black text-amber-600 uppercase tracking-tighter">Evangelism</span>
                  </div>
                  <div className="text-sm font-black text-amber-700 flex items-center gap-1">
                    {(player?.gold ?? club.remaining_evangelism_points).toLocaleString()}
                    <span className="text-[9px] font-bold text-amber-300/50">P</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-1 bg-blue-400/15 p-2.5 rounded-xl border border-blue-300/20">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-2.5 h-2.5 text-blue-300/70" />
                    <span className="text-[8px] font-black text-blue-600 uppercase tracking-tighter">Speech</span>
                  </div>
                  <div className="text-sm font-black text-blue-700 flex items-center gap-1">
                    {(player?.buildingPower ?? club.remaining_speech_points).toLocaleString()}
                    <span className="text-[9px] font-bold text-blue-300/50">P</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 어드민 버튼 */}
      {currentUser?.role === 'admin' && (
        <div className="mt-auto p-3 border-t border-white/15 space-y-2">
          <button
            onClick={onResetManual}
            className="w-full py-2.5 text-[9px] font-black text-white/40 hover:text-amber-300 transition-colors uppercase tracking-[0.2em] bg-white/8 border border-white/15 rounded-xl hover:bg-amber-400/10 hover:border-amber-300/30"
          >
            수동 추가 점수 초기화
          </button>
          <button
            onClick={onReset}
            className="w-full py-2.5 text-[9px] font-black text-white/40 hover:text-red-300 transition-colors uppercase tracking-[0.2em] bg-white/8 border border-white/15 rounded-xl hover:bg-red-400/10 hover:border-red-300/30"
          >
            게임 지표 초기화
          </button>
        </div>
      )}
    </div>
  );
}
