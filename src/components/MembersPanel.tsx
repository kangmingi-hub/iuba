import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserPlus, Trash2, Users, User } from 'lucide-react';
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
      <div className="sleek-panel-header flex items-center gap-2">
        <Users className="w-4 h-4 text-cyan-400" />
        <h2 className="sleek-panel-title">CREW MANAGEMENT</h2>
      </div>
      <div className="p-8">
        <div className="max-w-md mx-auto mb-10">
          <p className="text-[10px] font-bold mb-6 uppercase tracking-[0.2em] text-center"
            style={{ color: 'rgba(0, 255, 255, 0.5)', fontFamily: 'Share Tech Mono' }}>
            // 새로운 선교대원 등록 //
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[9px] font-bold mb-2 uppercase tracking-widest ml-1"
                style={{ color: 'rgba(0, 255, 255, 0.5)', fontFamily: 'Share Tech Mono' }}>
                &lt;AGENT_NAME/&gt;
              </label>
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="새 대원 이름 입력"
                className="w-full rounded-xl px-6 py-4 text-lg font-bold outline-none transition-all"
                style={{
                  background: 'rgba(0, 20, 40, 0.8)',
                  border: '1px solid rgba(0, 255, 255, 0.3)',
                  color: '#e0ffff',
                  boxShadow: 'inset 0 0 20px rgba(0, 255, 255, 0.05)'
                }}
              />
            </div>
            <button type="submit"
              className="w-full py-4 rounded-xl font-black flex items-center justify-center gap-2 uppercase tracking-widest text-sm transition-all relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 200, 100, 0.3) 100%)',
                border: '2px solid rgba(0, 255, 136, 0.5)',
                color: '#00ff88',
                boxShadow: '0 0 25px rgba(0, 255, 136, 0.2)',
                fontFamily: 'Orbitron, sans-serif',
                textShadow: '0 0 10px rgba(0, 255, 136, 0.5)'
              }}>
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-green-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <UserPlus className="w-5 h-5" />
              <span className="relative z-10">대원 등록하기</span>
            </button>
          </form>
        </div>

        <div className="pt-8" style={{ borderTop: '1px solid rgba(0, 255, 255, 0.15)' }}>
          <h3 className="text-[10px] font-bold mb-6 uppercase tracking-[0.2em] text-center"
            style={{ color: 'rgba(0, 255, 255, 0.5)', fontFamily: 'Share Tech Mono' }}>
            // ACTIVE CREW: {players.length} AGENTS //
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((player, idx) => (
              <motion.div 
                key={player.id} 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="p-4 rounded-xl flex items-center justify-between transition-all group"
                style={{
                  background: 'rgba(15, 25, 45, 0.6)',
                  border: '1px solid rgba(0, 255, 255, 0.2)',
                  boxShadow: '0 0 15px rgba(0, 255, 255, 0.05)'
                }}>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full blur-md opacity-40"
                      style={{ backgroundColor: player.color }} />
                    <img src={player.characterUrl} 
                      className="relative w-10 h-10 rounded-full p-1 border-2"
                      style={{ 
                        borderColor: player.color,
                        backgroundColor: '#0a1428',
                        boxShadow: `0 0 10px ${player.color}40`
                      }} />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight"
                      style={{ color: '#e0ffff', fontFamily: 'Orbitron, sans-serif' }}>
                      {player.name}
                    </p>
                    <p className="text-[9px] font-bold uppercase tracking-widest font-mono"
                      style={{ color: '#00ff88' }}>
                      ACTIVE
                    </p>
                  </div>
                </div>
                <button onClick={() => onDelete(player.id)}
                  className="p-2 rounded-lg transition-all opacity-50 group-hover:opacity-100"
                  style={{
                    color: '#ff6b6b'
                  }}
                  title="대원 삭제">
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
