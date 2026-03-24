"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Lock, Loader2, LayoutGrid } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { register } from '@/app/actions/auth';
import { cn } from '@/lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const email = formData.get('email') as string;

    try {
      if (mode === 'register') {
        const regFormData = new FormData();
        regFormData.append('username', username);
        regFormData.append('email', email);
        regFormData.append('password', password);
        
        const result = await register(regFormData);
        if (result.error) {
          setError(result.error);
          setLoading(false);
          return;
        }
      }

      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials');
      } else {
        onClose();
      }
    } catch (err: any) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
          {/* Darker backdrop as seen in the dark navy theme */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0a0f1e]/90 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="w-full max-w-[460px] max-h-[90vh] bg-[#1a233b] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10 flex flex-col rounded-[2rem] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button Top Right */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-white/20 hover:text-white hover:bg-white/5 rounded-full transition-all z-20"
            >
              <X size={20} />
            </button>

            <div className="px-10 py-12 flex flex-col overflow-y-auto scrollbar-hide">
              {/* Reference Pattern Header: Grid Icon + MINDPEAK */}
              <div className="flex items-center gap-3 mb-10">
                <div className="w-10 h-10 bg-[#7c5bf0] rounded-xl flex items-center justify-center shadow-lg shadow-[#7c5bf0]/30 transition-transform hover:rotate-6">
                  <LayoutGrid className="text-white" size={24} />
                </div>
                <h3 className="text-2xl font-black text-white tracking-widest uppercase text-shadow-sm">
                  LoricaMaris
                </h3>
              </div>

              {/* Tab Switcher - Reference Theme */}
              <div className="flex bg-[#252d48] p-1.5 rounded-2xl mb-10 border border-white/5">
                <button
                  onClick={() => setMode('login')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    mode === 'login' ? "bg-[#714ef2] text-white shadow-xl" : "text-white/30 hover:text-white/50"
                  )}
                >
                  Login
                </button>
                <button
                  onClick={() => setMode('register')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    mode === 'register' ? "bg-[#714ef2] text-white shadow-xl" : "text-white/30 hover:text-white/50"
                  )}
                >
                  Register
                </button>
              </div>

              {/* Form Fields - Reference Theme */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                  <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                    <input
                      name="username"
                      type="text"
                      placeholder="Username or Email"
                      required
                      className="w-full pl-16 pr-6 py-5 bg-[#252d48]/50 border border-white/10 rounded-2xl outline-none transition-all font-bold text-white placeholder:text-white/20 focus:border-[#7c5bf0] focus:bg-[#252d48]"
                    />
                  </div>

                  {mode === 'register' && (
                    <div className="relative group">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                      <input
                        name="email"
                        type="email"
                        placeholder="Email Address"
                        required
                        className="w-full pl-16 pr-6 py-5 bg-[#252d48]/50 border border-white/10 rounded-2xl outline-none transition-all font-bold text-white placeholder:text-white/20 focus:border-[#7c5bf0] focus:bg-[#252d48]"
                      />
                    </div>
                  )}

                  <div className="relative group">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                    <input
                      name="password"
                      type="password"
                      placeholder="Password"
                      required
                      className="w-full pl-16 pr-6 py-5 bg-[#252d48]/50 border border-white/10 rounded-2xl outline-none transition-all font-bold text-white placeholder:text-white/20 focus:border-[#7c5bf0] focus:bg-[#252d48]"
                    />
                  </div>
                </div>

                {error && (
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-rose-400 text-[10px] font-black uppercase tracking-widest text-center"
                  >
                    {error}
                  </motion.p>
                )}

                <div className="pt-6">
                  {/* Gradient Button from Reference */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={cn(
                      "w-full py-5 rounded-2xl text-white font-black text-sm uppercase tracking-[0.4rem] shadow-2xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 bg-gradient-to-r from-[#7c5bf0] to-[#5b8def] hover:opacity-90 shadow-indigo-500/30"
                    )}
                  >
                    {loading && <Loader2 className="animate-spin" size={20} />}
                    {mode === 'login' ? 'AUTHENTICATE' : 'INITIALIZE ACCESS'}
                  </button>
                  
                  <p 
                    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                    className="text-center mt-8 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] cursor-pointer hover:text-[#7c5bf0] transition-colors"
                  >
                    {mode === 'login' ? "New Operative? Protocol Register" : "Existing Operative? Protocol Login"}
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
