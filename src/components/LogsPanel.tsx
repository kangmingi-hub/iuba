import React from 'react';
import { motion } from 'motion/react';
import { Building2, Users, Flag, Database, ChevronRight } from 'lucide-react';
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
      <div className="sleek-panel-header flex items-center gap-2">
        <Database className="w-4 h-4 text-cyan-400" />
        <h2 className="sleek-panel-title">ACTIVITY LOG</h2>
      </div>
      <div className="p-6 overflow-y-auto custom-scrollbar max-h-[calc(100vh-280px)] space-y-3">
        {logs.length === 0 && (
          <div className="text-center py-10 font-mono" style={{ color: 'rgba(0, 255, 255, 0.4)' }}>
            <Database className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="text-xs">// NO LOGS RECORDED //</p>
          </div>
        )}
        {logs.map((log, idx) => (
          <motion.div 
            key={log.id} 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.02 }}
            className="flex items-start gap-3 p-3 rounded-xl relative overflow-hidden"
            style={{
              background: 'rgba(15, 25, 45, 0.6)',
              border: '1px solid rgba(0, 255, 255, 0.15)'
            }}
          >
            {/* Type indicator line */}
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
              style={{
                background: log.type === 'construction' 
                  ? '#00c8ff' 
                  : log.type === 'evangelism' 
                  ? '#ffc832' 
                  : '#00ff88'
              }} />
            
            <div className="mt-0.5 ml-2 p-2 rounded-lg"
              style={{
                background: log.type === 'construction' 
                  ? 'rgba(0, 200, 255, 0.15)' 
                  : log.type === 'evangelism' 
                  ? 'rgba(255, 200, 50, 0.15)' 
                  : 'rgba(0, 255, 136, 0.15)'
              }}>
              {log.type === 'construction' ? (
                <Building2 className="w-4 h-4" style={{ color: '#00c8ff' }} />
              ) : log.type === 'evangelism' ? (
                <Users className="w-4 h-4" style={{ color: '#ffc832' }} />
              ) : (
                <Flag className="w-4 h-4" style={{ color: '#00ff88' }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <ChevronRight className="w-3 h-3" style={{ color: 'rgba(0, 255, 255, 0.4)' }} />
                <p className="text-sm font-medium" style={{ color: '#e0ffff' }}>{log.message}</p>
              </div>
              <p className="text-[10px] font-mono" style={{ color: 'rgba(0, 255, 255, 0.4)' }}>
                {new Date(log.timestamp).toLocaleString('ko-KR')}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
