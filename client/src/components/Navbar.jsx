import React, { useState, useEffect } from 'react';
import { Menu, Bell, Sparkles, MapPin, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onToggleSidebar }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api.get('/notifications')
      .then((res) => {
        if (res.data && res.data.notifications) {
          const unread = res.data.notifications.filter(n => !n.is_read).length;
          setUnreadCount(unread);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="h-16 glass-panel sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between border-b border-emerald-900/30">
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-300 hover:bg-emerald-900/30"
          aria-label="Toggle Navigation"
        >
          <Menu className="h-6 w-6" />
        </button>

        <div className="hidden sm:flex items-center space-x-2 bg-slate-900/80 px-3 py-1.5 rounded-full border border-emerald-800/40 text-xs font-medium text-emerald-300">
          <MapPin className="h-3.5 w-3.5 text-emerald-400" />
          <span>GreenValley Sector 4</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* AI Quick Advisor Button */}
        <button
          onClick={() => navigate('/advisor')}
          className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-medium text-xs shadow-md shadow-emerald-950/50 transition-all transform hover:scale-105"
        >
          <Sparkles className="h-4 w-4 text-amber-300 animate-spin-slow" />
          <span>Ask AI Advisor</span>
        </button>

        {/* Notifications Icon */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-xl bg-slate-900/80 text-slate-300 hover:text-emerald-400 hover:bg-emerald-950/40 border border-emerald-800/30 transition-colors"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-extrabold flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Pill */}
        <div 
          onClick={() => navigate('/profile')}
          className="flex items-center space-x-2 cursor-pointer pl-2 pr-3 py-1 rounded-full bg-slate-900/80 border border-emerald-800/30 hover:border-emerald-500/50 transition-all"
        >
          <div className="h-7 w-7 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'F'}
          </div>
          <span className="text-xs font-semibold text-slate-200 hidden md:inline">{user?.name || 'Farmer'}</span>
        </div>
      </div>
    </header>
  );
}
