import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { KeyRound, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { checkAdminRole } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        toast.success('Authenticated with Supabase.');
        const isAdmin = await checkAdminRole();
        if (!isAdmin) {
          // Toast inside checkAdminRole will display
        } else {
          toast.success('Welcome Back, Administrator.');
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
      toast.error(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-emerald-dark px-4 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-marble opacity-5 pointer-events-none mix-blend-overlay"></div>
      
      {/* Decorative Gold Blurs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-gold/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-gold/15 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-brand-gold/30 shadow-lg shadow-black/40 mb-4 select-none bg-brand-emerald-dark shrink-0 inline-flex items-center justify-center">
            <img 
              src="/logo.webp" 
              alt="Luxury Scent Decants Logo" 
              className="w-full h-full object-cover" 
            />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-wide text-brand-cream select-none">
            LUXURY SCENT
          </h1>
          <p className="text-xs uppercase tracking-[0.25em] text-brand-gold font-sans font-semibold mt-1">
            Admin Portal
          </p>
        </div>

        {/* Glassmorphic Card */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-xl p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle light leak at top border */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent"></div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-brand-gold uppercase tracking-wider mb-2" htmlFor="email">
                Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-gold/60">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="admin@luxuryscentdecants.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-black/40 border border-brand-gold/20 rounded-sm text-brand-cream placeholder-brand-cream/30 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition duration-200 text-sm font-sans"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold text-brand-gold uppercase tracking-wider" htmlFor="password">
                  Security Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-gold/60">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-black/40 border border-brand-gold/20 rounded-sm text-brand-cream placeholder-brand-cream/30 focus:outline-none focus:border-brand-gold focus:ring-1 focus:ring-brand-gold transition duration-200 text-sm font-sans"
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-brand-gold-dark via-brand-gold to-brand-gold-light hover:brightness-110 active:brightness-95 disabled:opacity-50 disabled:pointer-events-none text-brand-emerald-dark font-sans font-bold text-sm tracking-widest uppercase rounded-sm shadow-xl shadow-brand-gold/10 flex items-center justify-center gap-2 cursor-pointer transition duration-300"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-brand-emerald-dark border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying Session...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4.5 h-4.5" />
                  <span>Access Terminal</span>
                  <ArrowRight className="w-4.5 h-4.5 transition-transform duration-200 group-hover:translate-x-1" />
                </>
              )}
            </motion.button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-brand-cream/40 text-[11px] uppercase tracking-widest select-none">
          Secured with Supabase Cryptography & JWT Keys
        </div>
      </motion.div>
    </div>
  );
};
