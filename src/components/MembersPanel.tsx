import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserPlus, Trash2 } from 'lucide-react';
import { Player } from '../types';

interface Props {
  players: Player[];
  onAdd: (name: string) => void;
  onDelete: (playerId: string) => void;
}

export default function MembersPanel({ players, onAdd, onDelete }: Props) {
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
      className="sleek-card flex flex-col"
    >
      <div className="sleek-panel-header">
        <h2 className="sleek-panel-title">멤버 관리 시스템</h2>
      </div>
      <div className="p-8">
        <div className="max-w-md mx-auto mb-10">
          <p className="text-[10px] font-extrabold text-[#64748B] mb-6 uppercase tracking-widest text-center">새로운 선교대원 등록</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[9px] font-bold text-slate-400 mb-2 uppercase tracking-widest ml-1">이름</label>
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="새 대원 이름 입력"
                className="w-full bg-[#FAFBFF] border border-[#E2E8F0] rounded-xl px-6 py-4 text-lg font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              />
            </div>
            <button type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-black text-white shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-sm">
              <UserPlus className="w-5 h-5" /> 대원 등록하기
            </button>
          </form>
        </div>

        <div className="border-t border-[#E2E8F0] pt-8">
          <h3 className="text-[10px] font-extrabold text-[#64748B] mb-6 uppercase tracking-widest text-center">등록된 대원 목록 ({players.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map(player => (
              <div key={player.id} className="p-4 bg-white rounded-2xl border border-[#E2E8F0] flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <img src={player.characterUrl} className="w-10 h-10 rounded-full bg-slate-50 p-1 border border-slate-100" />
                  <div>
                    <p className="text-sm font-black text-[#1E293B] uppercase tracking-tight">{player.name}</p>
                    <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">Active Member</p>
                  </div>
                </div>
                <button onClick={() => onDelete(player.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="대원 삭제">
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
