import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, LogIn } from 'lucide-react';

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
        <motion.div
          className="login-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="login-card"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <div className="login-icon">
              <Globe style={{ width: 32, height: 32, color: 'white' }} />
            </div>

            <h2 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: 8 }}>
              Mission Entry
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 36, fontStyle: 'italic', lineHeight: 1.6 }}>
              "선교의 첫걸음은 참여로부터 시작됩니다."
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
              <div>
                <label className="input-label">동아리 이름 또는 관리자 ID</label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="이름을 입력하세요"
                  className="input"
                  style={{ fontSize: 16, padding: '14px 20px' }}
                  autoFocus
                />
                <p style={{ marginTop: 8, fontSize: 11, color: 'var(--text3)' }}>
                  관리자 ID: <span style={{ color: 'var(--accent2)', fontWeight: 700 }}>admin</span>
                </p>
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '16px', fontSize: 14, borderRadius: 14, letterSpacing: '0.5px' }}>
                <LogIn style={{ width: 18, height: 18 }} />
                원정대 함선 탑승
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
