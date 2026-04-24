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
        <h2 className="text-sm font-bold text-slate-700 tracking-wide">활동 기록</h2>
      </div>
    
      <div className="p-6 overflow-y-auto custom-scrollbar max-h-[calc(100vh-280px)] space-y-3">
        {logs.map(log => (
          <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl transition-all hover:scale-[1.005]"
            style={{
              background: 'rgba(255,255,255,0.55)',
              border: '1px solid rgba(255,255,255,0.75)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div className="mt-0.5">
              {log.type === 'construction' ? (
                <Building2 className="w-4 h-4 text-blue-400" />
              ) : log.type === 'evangelism' ? (
                <Users className="w-4 h-4 text-amber-400" />
              ) : (
                <Flag className="w-4 h-4 text-green-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700">{log.message}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {new Date(log.timestamp).toLocaleString('ko-KR')}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
