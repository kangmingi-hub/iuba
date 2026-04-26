import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserPlus, Trash2 } from 'lucide-react';
import { Player, TEAM_COLORS } from '../types';

interface Props {
  players: Player[];
  onAdd: (name: string) => void;
  onDelete: (playerId: string) => void;
  onColorChange: (playerId: string, color: string) => void;
}

export default function MembersPanel({ players, onAdd, onDelete, onColorChange }: Props) {
  const [newMemberName, setNewMemberName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    onAdd(newMemberName);
    setNewMemberName('');
  };

  return (
    <motion.div
        key="members"
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
          <h2 className="text-sm font-bold text-slate-700 tracking-wide">멤버 관리 시스템</h2>
        </div>
      
        <div className="p-8">
          <div className="max-w-md mx-auto mb-10">
            <p className="text-[10px] font-extrabold text-slate-500 mb-6 uppercase tracking-widest text-center">새로운 선교대원 등록</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 mb-2 uppercase tracking-widest ml-1">이름</label>
                <input
                  type="text"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="새 대원 이름 입력"
                  className="w-full rounded-xl px-6 py-4 text-lg font-bold focus:ring-4 focus:ring-blue-400/20 outline-none transition-all text-slate-700 placeholder:text-slate-300"
                  style={{
                    background: 'rgba(255,255,255,0.55)',
                    border: '1px solid rgba(255,255,255,0.75)',
                    backdropFilter: 'blur(8px)',
                  }}
                />
              </div>
              <button type="submit"
                className="w-full bg-blue-500 hover:bg-blue-400 py-4 rounded-xl font-black text-white shadow-lg shadow-blue-400/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
                <UserPlus className="w-5 h-5" /> 대원 등록하기
              </button>
            </form>
          </div>
      
          <div className="pt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.5)' }}>
            <h3 className="text-[10px] font-extrabold text-slate-500 mb-6 uppercase tracking-widest text-center">등록된 대원 목록 ({players.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.map(player => (
                <div key={player.id} className="p-4 rounded-2xl flex items-center justify-between transition-all hover:scale-[1.01]"
                  style={{
                    background: 'rgba(255,255,255,0.55)',
                    border: `2px solid ${player.color}`,
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <img src={player.characterUrl} className="w-10 h-10 rounded-full bg-white/50 p-1 border border-white/60" />
                    <div>
                      <p className="text-sm font-black text-slate-700 uppercase tracking-tight">{player.name}</p>
                      {/* 색깔 선택 */}
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {TEAM_COLORS.map(color => (
                          <button
                            key={color}
                            onClick={() => onColorChange(player.id, color)}
                            className="w-4 h-4 rounded-full border-2 transition-all"
                            style={{
                              backgroundColor: color,
                              borderColor: player.color === color ? '#1e293b' : 'transparent',
                              transform: player.color === color ? 'scale(1.3)' : 'scale(1)',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => onDelete(player.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50/70 rounded-lg transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
  );
}
