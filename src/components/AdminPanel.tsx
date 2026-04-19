import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Building2 } from 'lucide-react';
import { Player } from '../types';

interface Props {
  players: Player[];
  onSubmit: (playerId: string, value: number, type: 'evangelism' | 'speech') => void;
}

export default function AdminPanel({ players, onSubmit }: Props) {
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="panel"
      style={{ flex: 1 }}
    >
      <div className="panel-header">
        <h2 className="panel-title">선교 실적 입력</h2>
      </div>

      <div style={{ padding: '32px', maxWidth: 480, margin: '0 auto' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <label className="input-label">동아리 선택</label>
            <select
              value={adminPlayerId}
              onChange={(e) => setAdminPlayerId(e.target.value)}
              className="select"
            >
              {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className="input-label">활동 항목</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button
                type="button"
                onClick={() => setAdminType('evangelism')}
                className={`type-btn ${adminType === 'evangelism' ? 'type-btn-gold' : ''}`}
              >
                <Users style={{ width: 20, height: 20 }} />
                전도 (GOLD)
              </button>
              <button
                type="button"
                onClick={() => setAdminType('speech')}
                className={`type-btn ${adminType === 'speech' ? 'type-btn-blue' : ''}`}
              >
                <Building2 style={{ width: 20, height: 20 }} />
                발표 (POWER)
              </button>
            </div>
          </div>

          <div>
            <label className="input-label">점수</label>
            <input
              type="number"
              value={adminValue || ''}
              onChange={(e) => setAdminValue(parseInt(e.target.value) || 0)}
              placeholder="0"
              className="input-large"
            />
          </div>

          <button type="submit" disabled={adminValue <= 0} className="btn-primary">
            실적 등록하기
          </button>
        </form>
      </div>
    </motion.div>
  );
}
