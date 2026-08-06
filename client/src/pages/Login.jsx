import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, Lock, Mail, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await login('farmer@ecohub.com', 'password123');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Guest login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center items-center space-x-3">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-xl shadow-emerald-950">
            <Leaf className="h-7 w-7 text-slate-950 font-bold" />
          </div>
          <span className="font-extrabold text-3xl tracking-wider text-white">Eco<span className="text-emerald-400">Hub</span></span>
        </div>
        <h2 className="mt-4 text-center text-2xl font-bold tracking-tight text-white">
          Sign in to your Farm Dashboard
        </h2>
        <p className="mt-2 text-center text-xs text-slate-400">
          AI Sustainable Agriculture Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="glass-panel py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-emerald-900/40">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Guest Login Button — Prominent for Hackathon Demo */}
          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full flex justify-center items-center space-x-2 py-3.5 px-4 mb-6 rounded-xl text-sm font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-300 hover:from-amber-300 hover:to-orange-200 shadow-lg shadow-amber-950/50 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all transform hover:scale-[1.02] animate-pulse hover:animate-none"
          >
            <Zap className="h-5 w-5" />
            <span>🚀 Quick Demo Login (Guest)</span>
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-emerald-900/40"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-slate-900 text-slate-400 font-medium">or sign in with email</span>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Email Address</label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-emerald-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/90 border border-emerald-800/40 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="farmer@ecohub.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-emerald-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-900/90 border border-emerald-800/40 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center space-x-2 py-3 px-4 rounded-xl text-sm font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 shadow-lg shadow-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all transform hover:scale-[1.02]"
            >
              {loading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <span>Access EcoHub</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials Info */}
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-center">
            <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest mb-1">Demo Credentials</p>
            <p className="text-xs text-slate-300">Email: <strong className="text-white">farmer@ecohub.com</strong></p>
            <p className="text-xs text-slate-300">Password: <strong className="text-white">password123</strong></p>
          </div>

          <div className="mt-6 pt-6 border-t border-emerald-900/30 text-center">
            <p className="text-xs text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
                Register a new farm
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
