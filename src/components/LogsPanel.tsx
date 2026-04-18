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
      className="sleek-card flex flex-col"
    >
      <div className="sleek-panel-header">
        <h2 className="sleek-panel-title">활동 기록</h2>
      </div>
      <div className="p-6 overflow-y-auto custom-scrollbar max-h-[calc(100vh-280px)] space-y-3">
        {logs.map(log => (
          <div key={log.id} className="flex items-start gap-3 p-3 bg-white rounded-xl border border-[#E2E8F0]">
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
              <p className="text-sm font-medium text-[#1E293B]">{log.message}</p>
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
