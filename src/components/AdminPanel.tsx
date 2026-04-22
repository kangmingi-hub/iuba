import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Building2 } from 'lucide-react';
import { Player } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

interface Props {
  players: Player[];
  onSubmit: (playerId: string, value: number, type: 'evangelism' | 'speech') => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  onRefresh: (date?: string) => void;
}

export default function AdminPanel({ players, onSubmit, startDate, onStartDateChange, onRefresh }: Props) {
  const [adminPlayerId, setAdminPlayerId] = useState(players[0]?.id || '');
  const [adminValue, setAdminValue] = useState<number>(0);
  const [adminType, setAdminType] = useState<'evangelism' | 'speech'>('evangelism');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(adminPlayerId, adminValue, adminType);
    setAdminValue(0);
  };

  return (
    <motion.div
      key="admin"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="sleek-card flex flex-col"
    >
      <div className="sleek-panel-header">
        <h2 className="sleek-panel-title">선교 실적 입력 센터</h2>
      </div>
     <div className="p-8 max-w-md mx-auto w-full overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-extrabold text-[#64748B] mb-2 uppercase tracking-widest">대원 선택</label>
            <select
              value={adminPlayerId}
              onChange={(e) => setAdminPlayerId(e.target.value)}
              className="w-full bg-[#FAFBFF] border border-[#E2E8F0] rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
            >
              {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-[#64748B] mb-2 uppercase tracking-widest">활동 항목</label>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => setAdminType('evangelism')}
                className={cn("py-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
                  adminType === 'evangelism' ? "bg-amber-50 border-amber-500 text-amber-700 shadow-sm" : "border-[#E2E8F0] text-[#64748B] hover:border-slate-300"
                )}>
                <Users className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wide">전도 (GOLD)</span>
              </button>
              <button type="button" onClick={() => setAdminType('speech')}
                className={cn("py-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
                  adminType === 'speech' ? "bg-blue-50 border-blue-500 text-blue-700 shadow-sm" : "border-[#E2E8F0] text-[#64748B] hover:border-slate-300"
                )}>
                <Building2 className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wide">발표 (POWER)</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-[#64748B] mb-2 uppercase tracking-widest">실적 점수</label>
            <input
              type="number"
              value={adminValue || ''}
              onChange={(e) => setAdminValue(parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-full bg-[#FAFBFF] border border-[#E2E8F0] rounded-xl px-4 py-4 text-3xl font-mono text-center focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-300"
            />
          </div>

          <button type="submit" disabled={adminValue <= 0}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 py-4 rounded-xl font-bold text-white shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]">
            실적 등록하기
          </button>
          <div className="border-t border-[#E2E8F0] pt-6">
  <label className="block text-[10px] font-extrabold text-[#64748B] mb-2 uppercase tracking-widest">
    점수 집계 시작 날짜
  </label>
  <div className="flex gap-3">
    <input
      type="date"
      value={startDate}
      onChange={(e) => onStartDateChange(e.target.value)}
      className="flex-1 bg-[#FAFBFF] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
    />
    <button
      type="button"
      onClick={() => onRefresh(startDate)}
      className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all"
    >
      적용
    </button>
  </div>
  <p className="mt-2 text-[10px] text-[#64748B]">
    이 날짜 이후 활동만 점수에 반영됩니다.
  </p>
</div>
          
        </form>
      </div>
    </motion.div>
  );
}
