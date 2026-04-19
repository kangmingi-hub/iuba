import React from 'react';
import { motion } from 'motion/react';
import { Building2, Users, Flag } from 'lucide-react';
import { GameLog } from '../types';

interface Props {
  logs: GameLog[];
}

export default function LogsPanel({ logs }: Props) {
  return (
    <motion.div
      key="logs"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="panel"
      style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      <div className="panel-header">
        <h2 className="panel-title">활동 기록</h2>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text3)' }}>{logs.length}건</span>
      </div>

      <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {logs.map(log => {
          const isConstruction = log.type === 'construction';
          const isEvangelism = log.type === 'evangelism';

          const iconBg = isConstruction
            ? 'rgba(79,125,255,0.12)'
            : isEvangelism
            ? 'rgba(245,166,35,0.12)'
            : 'rgba(34,211,160,0.12)';

          const iconColor = isConstruction
            ? 'var(--accent2)'
            : isEvangelism
            ? 'var(--gold)'
            : 'var(--success)';

          return (
            <div key={log.id} className="log-item">
              <div className="log-icon" style={{ background: iconBg }}>
                {isConstruction ? (
                  <Building2 style={{ width: 14, height: 14, color: iconColor }} />
                ) : isEvangelism ? (
                  <Users style={{ width: 14, height: 14, color: iconColor }} />
                ) : (
                  <Flag style={{ width: 14, height: 14, color: iconColor }} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)', lineHeight: 1.4 }}>{log.message}</p>
                <p style={{ fontSize: 10, fontWeight: 500, color: 'var(--text3)', marginTop: 4 }}>
                  {new Date(log.timestamp).toLocaleString('ko-KR')}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
