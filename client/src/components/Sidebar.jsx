import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Sparkles, 
  CalendarDays, 
  Tractor, 
  Warehouse, 
  BookOpenCheck, 
  Bell, 
  Leaf, 
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { logout, user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Advisor', path: '/advisor', icon: Sparkles, highlight: true },
    { name: 'Smart Calendar', path: '/calendar', icon: CalendarDays },
    { name: 'Machinery Hub', path: '/machinery', icon: Tractor },
    { name: 'Cold Storage', path: '/cold-storage', icon: Warehouse },
    { name: 'My Bookings', path: '/bookings', icon: BookOpenCheck },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Sustainability', path: '/sustainability', icon: Leaf },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <aside 
      className={`fixed top-0 left-0 z-40 h-screen w-64 glass-panel border-r border-emerald-900/30 transition-transform duration-300 ease-in-out flex flex-col justify-between ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div>
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center px-6 border-b border-emerald-900/30 justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/50">
              <Leaf className="h-6 w-6 text-slate-950 font-bold" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-wider text-white">Eco<span className="text-emerald-400">Hub</span></span>
              <span className="block text-[10px] uppercase font-semibold text-emerald-400/70 tracking-widest">Sustainable Farm AI</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen && setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-900/40 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-emerald-950/40'
                  }`
                }
              >
                <Icon className={`h-5 w-5 ${item.highlight ? 'text-amber-300 animate-pulse' : ''}`} />
                <span>{item.name}</span>
                {item.highlight && (
                  <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    AI
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Footer Card */}
      <div className="p-4 border-t border-emerald-900/30 bg-emerald-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="h-9 w-9 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'Farmer User'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || 'farmer@ecohub.com'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
