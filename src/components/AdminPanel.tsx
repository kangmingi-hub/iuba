import React, { useState } from 'react';
import { motion } from 'motion/react';
// 👇 Users 대신 Coins 아이콘을 불러옵니다.
import { Coins, Building2 } from 'lucide-react';
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
        className="flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(255,255,255,0.38)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(255,255,255,0.75)',
          boxShadow: '0 4px 32px rgba(120,150,190,0.15), inset 0 1px 0 rgba(255,255,255,0.85)',
        }}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-white/30">
          <h2 className="text-sm font-bold text-slate-700 tracking-wide">선교 실적 입력 센터</h2>
        </div>
        
        <div className="p-8 max-w-md mx-auto w-full overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 mb-2 uppercase tracking-widest">대원 선택</label>
              <select
                value={adminPlayerId}
                onChange={(e) => setAdminPlayerId(e.target.value)}
                className="w-full rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-400 outline-none transition-all text-sm font-medium text-slate-700"
                style={{
                  background: 'rgba(255,255,255,0.55)',
                  border: '1px solid rgba(255,255,255,0.75)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
        
            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 mb-2 uppercase tracking-widest">활동 항목</label>
              <div className="grid grid-cols-2 gap-4">
                <button type="button" onClick={() => setAdminType('evangelism')}
                  className={cn("py-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
                    adminType === 'evangelism'
                      ? "bg-amber-50 border-amber-400 text-amber-700 shadow-sm"
                      : "text-slate-500 hover:border-slate-300"
                  )}
                  style={adminType !== 'evangelism' ? {
                    background: 'rgba(255,255,255,0.45)',
                    border: '1px solid rgba(255,255,255,0.6)',
                  } : {}}
                >
                  {/* 👇 아이콘 교체 및 텍스트를 MINERAL로 변경 */}
                  <Coins className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-wide">전도 (MINERAL)</span>
                </button>
                <button type="button" onClick={() => setAdminType('speech')}
                  className={cn("py-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
                    adminType === 'speech'
                      ? "bg-blue-50 border-blue-400 text-blue-700 shadow-sm"
                      : "text-slate-500 hover:border-slate-300"
                  )}
                  style={adminType !== 'speech' ? {
                    background: 'rgba(255,255,255,0.45)',
                    border: '1px solid rgba(255,255,255,0.6)',
                  } : {}}
                >
                  {/* 👇 텍스트를 GAS로 변경 */}
                  <Building2 className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-wide">발표 (GAS)</span>
                </button>
              </div>
            </div>
        
            <div>
              <label className="block text-[10px] font-extrabold text-slate-500 mb-2 uppercase tracking-widest">실적 점수</label>
              <input
                type="number"
                value={adminValue || ''}
                onChange={(e) => setAdminValue(parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-full rounded-xl px-4 py-4 text-3xl font-mono text-center focus:ring-2 focus:ring-blue-400 outline-none transition-all placeholder:text-slate-300 text-slate-700"
                style={{
                  background: 'rgba(255,255,255,0.55)',
                  border: '1px solid rgba(255,255,255,0.75)',
                  backdropFilter: 'blur(8px)',
                }}
              />
            </div>
        
            <button type="submit" disabled={adminValue <= 0}
              className="w-full bg-blue-500 hover:bg-blue-400 disabled:opacity-50 py-4 rounded-xl font-bold text-white shadow-lg shadow-blue-400/20 transition-all active:scale-[0.98]">
              실적 등록하기
            </button>
        
            <div className="pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.5)' }}>
              <label className="block text-[10px] font-extrabold text-slate-500 mb-2 uppercase tracking-widest">
                점수 집계 시작 날짜
              </label>
              <div className="flex gap-3">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onStartDateChange(e.target.value)}
                  className="flex-1 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-400 outline-none text-slate-700"
                  style={{
                    background: 'rgba(255,255,255,0.55)',
                    border: '1px solid rgba(255,255,255,0.75)',
                    backdropFilter: 'blur(8px)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => onRefresh(startDate)}
                  className="px-5 py-3 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-bold text-sm transition-all">
                  적용
                </button>
              </div>
              <p className="mt-2 text-[10px] text-slate-400">이 날짜 이후 활동만 점수에 반영됩니다.</p>
            </div>
          </form>
        </div>
      </motion.div>
      );
    }
