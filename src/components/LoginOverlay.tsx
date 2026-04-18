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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#F8FAFC]/90 backdrop-blur-xl"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white border border-[#E2E8F0] rounded-[2.5rem] p-10 shadow-2xl text-center"
          >
            <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-500/20">
              <Sword className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-black text-[#1E293B] mb-2 uppercase tracking-tight">Mission Entry</h2>
            <p className="text-slate-500 text-sm font-medium mb-10 italic">"선교의 첫걸음은 참여로부터 시작됩니다."</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-left">
                <label className="block text-[10px] font-extrabold text-[#64748B] mb-2 uppercase tracking-widest ml-4">사용자 식별자 (ID)</label>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="성함 혹은 관리자 아이디"
                  className="w-full bg-[#FAFBFF] border border-[#E2E8F0] rounded-2xl px-6 py-4 text-lg font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:text-slate-300"
                />
                <p className="mt-3 text-[10px] text-slate-400 font-medium ml-4">기본 관리자 ID: <span className="text-blue-500 font-bold">admin</span></p>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 py-5 rounded-2xl font-black text-white shadow-xl shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest"
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
