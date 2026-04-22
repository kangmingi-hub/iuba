import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sword, LogIn, Shield } from 'lucide-react';

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
          {/* Holographic background with grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(0, 20, 40, 0.95) 0%, rgba(5, 10, 20, 0.98) 100%)',
              backdropFilter: 'blur(20px)'
            }}
          />
          
          {/* Animated grid lines */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0" style={{
              backgroundImage: `
                linear-gradient(rgba(0, 255, 255, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 255, 255, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }} />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md p-10 text-center overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(10, 25, 50, 0.95) 0%, rgba(15, 30, 60, 0.9) 100%)',
              border: '1px solid rgba(0, 255, 255, 0.3)',
              borderRadius: '2rem',
              boxShadow: '0 0 60px rgba(0, 255, 255, 0.2), inset 0 0 40px rgba(0, 255, 255, 0.05)'
            }}
          >
            {/* Holographic corner accents */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-cyan-400/60 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-cyan-400/60 rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-cyan-400/60 rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-cyan-400/60 rounded-br-2xl" />

            {/* Scan line animation */}
            <motion.div
              className="absolute left-0 right-0 h-[2px]"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.6), transparent)'
              }}
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />

            <div className="relative z-10">
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 bg-cyan-400 rounded-2xl blur-2xl opacity-40 animate-pulse" />
                <div className="relative w-full h-full flex items-center justify-center rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 200, 255, 0.3) 0%, rgba(0, 255, 255, 0.2) 100%)',
                    border: '2px solid rgba(0, 255, 255, 0.5)',
                    boxShadow: '0 0 40px rgba(0, 255, 255, 0.4), inset 0 0 30px rgba(0, 255, 255, 0.1)'
                  }}>
                  <Shield className="w-12 h-12 text-cyan-300 drop-shadow-[0_0_15px_rgba(0,255,255,0.8)]" />
                </div>
              </div>

              <h2 className="text-3xl font-black mb-2 uppercase tracking-wider"
                style={{ 
                  fontFamily: 'Orbitron, sans-serif',
                  color: '#00ffff',
                  textShadow: '0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.3)'
                }}>
                SYSTEM ACCESS
              </h2>
              <p className="text-sm font-medium mb-10 font-mono" style={{ color: 'rgba(0, 255, 255, 0.5)' }}>
                // 선교의 첫걸음은 참여로부터 시작됩니다 //
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-left">
                  <label className="block text-[10px] font-bold mb-2 uppercase tracking-[0.2em] ml-4"
                    style={{ color: 'rgba(0, 255, 255, 0.6)', fontFamily: 'Share Tech Mono, monospace' }}>
                    &lt;USER_ID/&gt;
                  </label>
                  <input
                    type="text"
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="성함 혹은 관리자 아이디"
                    className="holo-input text-lg font-bold rounded-xl"
                    style={{
                      background: 'rgba(0, 20, 40, 0.8)',
                      border: '1px solid rgba(0, 255, 255, 0.3)',
                      color: '#e0ffff',
                      boxShadow: 'inset 0 0 20px rgba(0, 255, 255, 0.05)'
                    }}
                  />
                  <p className="mt-3 text-[10px] font-medium ml-4 font-mono" style={{ color: 'rgba(0, 255, 255, 0.4)' }}>
                    기본 관리자 ID: <span style={{ color: '#00ffff' }}>admin</span>
                  </p>
                </div>
                <button
                  type="submit"
                  className="w-full py-5 rounded-xl font-black flex items-center justify-center gap-3 uppercase tracking-widest transition-all active:scale-[0.98] overflow-hidden relative group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.2) 0%, rgba(0, 168, 255, 0.3) 100%)',
                    border: '2px solid rgba(0, 255, 255, 0.5)',
                    color: '#00ffff',
                    boxShadow: '0 0 40px rgba(0, 255, 255, 0.3), inset 0 0 30px rgba(0, 255, 255, 0.1)',
                    textShadow: '0 0 15px rgba(0, 255, 255, 0.5)',
                    fontFamily: 'Orbitron, sans-serif'
                  }}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <span className="relative z-10 flex items-center gap-3">
                    원정대 함선 탑승 <LogIn className="w-5 h-5" />
                  </span>
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
