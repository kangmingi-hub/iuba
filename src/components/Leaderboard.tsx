import React from 'react';
import { motion } from 'motion/react';
import { Users, Building2, RefreshCcw } from 'lucide-react';
import { Player, CountryState } from '../types';
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
}

export default function Leaderboard({ clubPoints, players, countries, isSyncing, onRefresh, onReset }: Props) {
  return (
    <div className="sleek-card flex flex-col h-full overflow-hidden">
      <div className="sleek-panel-header flex justify-between items-center">
        <h2 className="sleek-panel-title">동아리 포인트 현황</h2>
        <button onClick={onRefresh} disabled={isSyncing}
          className={cn("p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-400", isSyncing && "animate-spin")}>
          <RefreshCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="team-list p-4 space-y-3 custom-scrollbar overflow-y-auto max-h-[calc(100vh-320px)]">
        {clubPoints.length === 0 && !isSyncing && (
          <div className="text-center py-10 text-slate-400">
            <p className="text-xs">데이터를 불러올 수 없습니다.</p>
          </div>
        )}

        {clubPoints.map((club, idx) => {
          const player = players.find(p => p.name === club.club_name);
          const ownedCount = player ? (Object.values(countries) as CountryState[]).filter(c => c.ownerId === player.id).length : 0;
          const totalBuildings = player ? (Object.values(countries) as CountryState[])
            .filter(c => c.ownerId === player.id)
            .reduce((sum, c) => sum + c.buildings, 0) : 0;

          return (
            <motion.div
              key={club.club_name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={cn(
                "flex flex-col gap-2 p-3.5 rounded-2xl border border-[#E2E8F0] bg-white transition-all group hover:shadow-md hover:border-blue-100",
                ownedCount > 0 ? "border-blue-200 bg-blue-50/10" : ""
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={CLUB_IMAGES[club.club_name] || player?.characterUrl || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${club.club_name}`}
                      alt={club.club_name}
                      className="w-9 h-9 rounded-full border-2 p-0.5 bg-white shadow-sm"
                      style={{ borderColor: player?.color || '#CBD5E1' }}
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: player?.color || '#CBD5E1' }} />
                  </div>
                  <div>
                    <h3 className="font-black text-[#1E293B] text-sm uppercase tracking-tight">{club.club_name}</h3>
                    <p className="text-[9px] font-bold text-slate-400">{ownedCount} Territories • {totalBuildings} Centers</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100/50">
                <div className="flex-1 flex flex-col gap-1 bg-amber-50/50 p-2 rounded-xl border border-amber-100/50">
                  <div className="flex items-center gap-1.5 opacity-70">
                    <Users className="w-2.5 h-2.5 text-amber-500" />
                    <span className="text-[8px] font-black text-amber-600 uppercase tracking-tighter">Evangelism</span>
                  </div>
                  <div className="text-sm font-black text-amber-700 flex items-center gap-1">
                    {(player?.gold ?? club.remaining_evangelism_points).toLocaleString()}
                    <span className="text-[9px] font-bold opacity-60">P</span>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-1 bg-blue-50/50 p-2 rounded-xl border border-blue-100/50">
                  <div className="flex items-center gap-1.5 opacity-70">
                    <Building2 className="w-2.5 h-2.5 text-blue-500" />
                    <span className="text-[8px] font-black text-blue-600 uppercase tracking-tighter">Speech</span>
                  </div>
                  <div className="text-sm font-black text-blue-700 flex items-center gap-1">
                    {(player?.buildingPower ?? club.remaining_speech_points).toLocaleString()}
                    <span className="text-[9px] font-bold opacity-60">P</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-auto p-4 border-t border-[#E2E8F0] bg-slate-50/50">
        <button onClick={onReset}
          className="w-full py-2.5 text-[9px] font-black text-[#64748B] hover:text-red-500 transition-colors uppercase tracking-[0.2em] bg-white border border-[#E2E8F0] rounded-xl shadow-sm">
          게임 지표 초기화
        </button>
      </div>
    </div>
  );
}
