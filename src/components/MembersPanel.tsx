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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="panel"
      style={{ flex: 1 }}
    >
      <div className="panel-header">
        <h2 className="panel-title">멤버 관리</h2>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)' }}>{players.length}명</span>
      </div>

      <div style={{ padding: '24px 28px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
          <input
            type="text"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            placeholder="새 대원 이름 입력"
            className="input"
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '12px 20px', borderRadius: 12, flexShrink: 0 }}>
            <UserPlus style={{ width: 16, height: 16 }} />
            추가
          </button>
        </form>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {players.map(player => (
            <div key={player.id} className="member-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img
                  src={player.characterUrl}
                  alt={player.name}
                  style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg)', padding: 3, border: '1px solid var(--border)' }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{player.name}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active</div>
                </div>
              </div>
              <button
                onClick={() => onDelete(player.id)}
                style={{
                  width: 30, height: 30, border: 'none', background: 'transparent',
                  color: 'var(--text3)', cursor: 'pointer', borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'color 0.2s, background 0.2s'
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--danger)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,90,110,0.1)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text3)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <Trash2 style={{ width: 14, height: 14 }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
