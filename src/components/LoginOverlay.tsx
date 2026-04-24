import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sword, LogIn } from 'lucide-react';

interface Props {
  isVisible: boolean;
  onLogin: (username: string) => boolean;
}

export default function LoginOverlay({ isVisible, onLogin }: Props) {
  const [loginUsername, setLoginUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(loginUsername);
    if (success) {
      setLoginUsername('');
    } else {
      alert('등록되지 않은 이름입니다. 관리자에게 문의하세요.');
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">

          {/* 배경 — 홀로그램 그라디언트 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #1a2a4a 0%, #2a3f6f 30%, #1e3a5f 60%, #0f1e3a 100%)',
            }}
          />

          {/* 홀로그램 데코 원 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none overflow-hidden"
          >
            {/* 큰 빛 번짐 */}
            <div className="absolute" style={{
              width: '600px', height: '600px',
              borderRadius: '50%',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(99,179,237,0.12) 0%, transparent 70%)',
            }} />
            {/* 상단 링 */}
            <div className="absolute" style={{
              width: '800px', height: '800px',
              borderRadius: '50%',
              top: '-200px', left: '50%',
              transform: 'translateX(-50%)',
              border: '1px solid rgba(99,179,237,0.08)',
            }} />
            {/* 하단 링 */}
            <div className="absolute" style={{
              width: '600px', height: '600px',
              borderRadius: '50%',
              bottom: '-150px', left: '50%',
              transform: 'translateX(-50%)',
              border: '1px solid rgba(139,92,246,0.07)',
            }} />
            {/* 격자 패턴 */}
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(99,179,237,0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(99,179,237,0.04) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }} />
          </motion.div>

          {/* 로그인 카드 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md rounded-[2.5rem] p-10 text-center"
            style={{
              background: 'rgba(255,255,255,0.38)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              border: '1px solid rgba(255,255,255,0.75)',
              boxShadow: '0 4px 32px rgba(120,150,190,0.15), inset 0 1px 0 rgba(255,255,255,0.85)',
            }}
          >
            {/* 아이콘 */}
            <div className="w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl"
              style={{
                background: 'rgba(59,130,246,0.85)',
                boxShadow: '0 8px 32px rgba(59,130,246,0.3)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Sword className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-3xl font-black text-slate-700 mb-2 uppercase tracking-tight">
              Mission Entry
            </h2>
            <p className="text-slate-500 text-sm font-medium mb-10 italic">
              "온 세계전도 경상대 IUBA 센터가 완료 하겠습니다!."
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-left">
                <label className="block text-[10px] font-extrabold text-slate-500 mb-2 uppercase tracking-widest ml-4">
                  사용자 식별자 (ID)
                </label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="성함 혹은 관리자 아이디"
                  className="w-full rounded-2xl px-6 py-4 text-lg font-bold focus:ring-4 focus:ring-blue-400/20 outline-none transition-all placeholder:text-slate-300 text-slate-700"
                  style={{
                    background: 'rgba(255,255,255,0.55)',
                    border: '1px solid rgba(255,255,255,0.75)',
                    backdropFilter: 'blur(8px)',
                  }}
                />
                <p className="mt-3 text-[10px] text-slate-400 font-medium ml-4">
                  기본 관리자 ID: <span className="text-blue-500 font-bold">admin</span>
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-5 rounded-2xl font-black text-white transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest"
                style={{
                  background: 'rgba(59,130,246,0.85)',
                  boxShadow: '0 4px 20px rgba(59,130,246,0.3)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(99,179,237,0.3)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.95)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.85)')}
              >
                원정대 함선 탑승 <LogIn className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
