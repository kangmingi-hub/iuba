import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KeyRound, X } from 'lucide-react';

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onChangePassword: (oldPassword: string, newPassword: string) => boolean;
}

export default function ChangePasswordModal({ isVisible, onClose, onChangePassword }: Props) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    if (newPassword.length < 4) {
      alert('비밀번호는 4자리 이상이어야 합니다.');
      return;
    }
    const success = onChangePassword(oldPassword, newPassword);
    if (success) {
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm rounded-[2rem] p-8"
            style={{
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(28px)',
              border: '1px solid rgba(255,255,255,0.75)',
              boxShadow: '0 4px 32px rgba(120,150,190,0.25)',
            }}
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all">
              <X className="w-5 h-5" />
            </button>

            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(59,130,246,0.85)', boxShadow: '0 8px 32px rgba(59,130,246,0.3)' }}
            >
              <KeyRound className="w-7 h-7 text-white" />
            </div>

            <h2 className="text-xl font-black text-slate-700 mb-1 text-center uppercase tracking-tight">비밀번호 변경</h2>
            <p className="text-slate-400 text-xs text-center mb-6">초기 비밀번호는 1234입니다</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 mb-2 uppercase tracking-widest">현재 비밀번호</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="현재 비밀번호"
                  className="w-full rounded-xl px-4 py-3 font-bold focus:ring-4 focus:ring-blue-400/20 outline-none transition-all text-slate-700 placeholder:text-slate-300 border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 mb-2 uppercase tracking-widest">새 비밀번호</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="새 비밀번호"
                  className="w-full rounded-xl px-4 py-3 font-bold focus:ring-4 focus:ring-blue-400/20 outline-none transition-all text-slate-700 placeholder:text-slate-300 border border-slate-200"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 mb-2 uppercase tracking-widest">새 비밀번호 확인</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="새 비밀번호 확인"
                  className="w-full rounded-xl px-4 py-3 font-bold focus:ring-4 focus:ring-blue-400/20 outline-none transition-all text-slate-700 placeholder:text-slate-300 border border-slate-200"
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 rounded-xl font-black text-white transition-all active:scale-[0.98] bg-blue-500 hover:bg-blue-400 mt-2"
              >
                변경하기
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
