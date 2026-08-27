import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  RefreshCw, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { signInAdmin } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { AdminUser } from '../../types';

interface LoginViewProps {
  onLoginSuccess: (user: any, admin: AdminUser | null) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('coffeedrama818@gmail.com');
  const [password, setPassword] = useState('#8495093177a');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setErrorMessage(null);

    try {
      const result = await signInAdmin(email.trim() || 'coffeedrama818@gmail.com', password || '#8495093177a');

      if (!result.success) {
        setErrorMessage(result.error || 'Authentication failed. Please check your credentials.');
      } else {
        onLoginSuccess(result.user, result.admin || null);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white">
      {/* Background ambient accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* BRAND IDENTITY */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-600 text-white shadow-xl shadow-blue-500/25 font-black text-2xl tracking-wider mb-2">
            AX
          </div>
          <div className="flex items-center justify-center gap-1.5 font-extrabold text-slate-900 text-2xl tracking-tight">
            <span>AXIONIX</span>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 uppercase">
              OS
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-600" />
            Smart Mall Operations & Administration Console
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-[0_4px_25px_rgba(0,0,0,0.05)] space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Administrator Sign In
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your authorized admin credentials to access the mall operations system.
            </p>
          </div>

          {/* DEMO MODE NOTICE BANNER */}
          {!isSupabaseConfigured && (
            <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-xl flex items-start gap-2.5 text-blue-900 text-xs">
              <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-blue-950 block">Interactive Preview & Demo Mode</span>
                <p className="text-blue-800 text-[11px] leading-relaxed">
                  Supabase environment variables are omitted. Click <strong>Sign In</strong> below to launch and explore the full Axionix Mall Dashboard.
                </p>
              </div>
            </div>
          )}

          {/* ERROR ALERT BANNER */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block">Access Error</span>
                <p className="text-rose-700 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* LOGIN FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@phoenixmall.com"
                  disabled={loading}
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  disabled={loading}
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 hover:shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials & Permissions...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-600" />
              Supabase Auth & RBAC Protected
            </span>
            <span>v2.4 Enterprise</span>
          </div>
        </div>

        {/* FOOTER */}
        <p className="text-center text-[11px] text-slate-400">
          AXIONIX Intelligent Mall Management System • Confidential Admin Portal
        </p>

      </div>
    </div>
  );
};
