import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Building2, Terminal, Upload } from 'lucide-react';
import { Player } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

interface Props {
  players: Player[];
  onSubmit: (playerId: string, value: number, type: 'evangelism' | 'speech') => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  onRefresh: () => void;
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
      <div className="sleek-panel-header flex items-center gap-2">
        <Terminal className="w-4 h-4 text-cyan-400" />
        <h2 className="sleek-panel-title">MISSION CONTROL CENTER</h2>
      </div>
      <div className="p-8 max-w-md mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold mb-2 uppercase tracking-[0.2em]"
              style={{ color: 'rgba(0, 255, 255, 0.6)', fontFamily: 'Share Tech Mono, monospace' }}>
              &lt;SELECT_AGENT/&gt;
            </label>
            <select
              value={adminPlayerId}
              onChange={(e) => setAdminPlayerId(e.target.value)}
              className="w-full rounded-xl px-4 py-3 outline-none transition-all text-sm font-medium"
              style={{
                background: 'rgba(0, 20, 40, 0.8)',
                border: '1px solid rgba(0, 255, 255, 0.3)',
                color: '#e0ffff',
                boxShadow: 'inset 0 0 15px rgba(0, 255, 255, 0.05)'
              }}
            >
              {players.map(p => <option key={p.id} value={p.id} style={{ background: '#0a1428' }}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold mb-2 uppercase tracking-[0.2em]"
              style={{ color: 'rgba(0, 255, 255, 0.6)', fontFamily: 'Share Tech Mono, monospace' }}>
              &lt;ACTIVITY_TYPE/&gt;
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button type="button" onClick={() => setAdminType('evangelism')}
                className={cn("py-4 rounded-xl flex flex-col items-center gap-2 transition-all")}
                style={adminType === 'evangelism' ? {
                  background: 'rgba(255, 200, 50, 0.15)',
                  border: '2px solid rgba(255, 200, 50, 0.5)',
                  color: '#ffc832',
                  boxShadow: '0 0 25px rgba(255, 200, 50, 0.2), inset 0 0 15px rgba(255, 200, 50, 0.05)'
                } : {
                  background: 'rgba(0, 20, 40, 0.5)',
                  border: '1px solid rgba(0, 255, 255, 0.2)',
                  color: 'rgba(0, 255, 255, 0.5)'
                }}>
                <Users className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  전도 (GOLD)
                </span>
              </button>
              <button type="button" onClick={() => setAdminType('speech')}
                className={cn("py-4 rounded-xl flex flex-col items-center gap-2 transition-all")}
                style={adminType === 'speech' ? {
                  background: 'rgba(0, 200, 255, 0.15)',
                  border: '2px solid rgba(0, 200, 255, 0.5)',
                  color: '#00c8ff',
                  boxShadow: '0 0 25px rgba(0, 200, 255, 0.2), inset 0 0 15px rgba(0, 200, 255, 0.05)'
                } : {
                  background: 'rgba(0, 20, 40, 0.5)',
                  border: '1px solid rgba(0, 255, 255, 0.2)',
                  color: 'rgba(0, 255, 255, 0.5)'
                }}>
                <Building2 className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-wide" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  발표 (POWER)
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold mb-2 uppercase tracking-[0.2em]"
              style={{ color: 'rgba(0, 255, 255, 0.6)', fontFamily: 'Share Tech Mono, monospace' }}>
              &lt;SCORE_VALUE/&gt;
            </label>
            <input
              type="number"
              value={adminValue || ''}
              onChange={(e) => setAdminValue(parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-full rounded-xl px-4 py-4 text-3xl text-center outline-none transition-all"
              style={{
                background: 'rgba(0, 20, 40, 0.8)',
                border: '1px solid rgba(0, 255, 255, 0.3)',
                color: '#00ffff',
                fontFamily: 'Share Tech Mono, monospace',
                boxShadow: 'inset 0 0 20px rgba(0, 255, 255, 0.05)',
                textShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
              }}
            />
          </div>

          <button type="submit" disabled={adminValue <= 0}
            className="w-full py-4 rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-2 uppercase tracking-wider relative overflow-hidden group"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(0, 168, 255, 0.3) 100%)',
              border: '2px solid rgba(0, 255, 255, 0.5)',
              color: '#00ffff',
              boxShadow: '0 0 30px rgba(0, 255, 255, 0.2)',
              fontFamily: 'Orbitron, sans-serif',
              textShadow: '0 0 10px rgba(0, 255, 255, 0.5)'
            }}>
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <Upload className="w-4 h-4" />
            <span className="relative z-10">실적 등록하기</span>
          </button>

          <div className="pt-6" style={{ borderTop: '1px solid rgba(0, 255, 255, 0.15)' }}>
            <label className="block text-[10px] font-bold mb-2 uppercase tracking-[0.2em]"
              style={{ color: 'rgba(0, 255, 255, 0.6)', fontFamily: 'Share Tech Mono, monospace' }}>
              &lt;START_DATE/&gt;
            </label>
            <div className="flex gap-3">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  onStartDateChange(e.target.value);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('start_date', e.target.value);
                  }
                }}
                className="flex-1 rounded-xl px-4 py-3 text-sm font-medium outline-none"
                style={{
                  background: 'rgba(0, 20, 40, 0.8)',
                  border: '1px solid rgba(0, 255, 255, 0.3)',
                  color: '#e0ffff',
                  colorScheme: 'dark'
                }}
              />
              <button
                type="button"
                onClick={() => onRefresh()}
                className="px-5 py-3 rounded-xl font-bold text-sm transition-all uppercase tracking-wider"
                style={{
                  background: 'rgba(0, 255, 136, 0.2)',
                  border: '1px solid rgba(0, 255, 136, 0.4)',
                  color: '#00ff88',
                  fontFamily: 'Orbitron, sans-serif'
                }}
              >
                적용
              </button>
            </div>
            <p className="mt-2 text-[10px] font-mono" style={{ color: 'rgba(0, 255, 255, 0.4)' }}>
              // 이 날짜 이후 활동만 점수에 반영됩니다 //
            </p>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
