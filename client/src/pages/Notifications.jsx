import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Info, CloudRain, Droplet, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../services/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  const fetchNotifications = () => {
    setLoading(true);
    api.get('/notifications')
      .then((res) => {
        if (res.data && res.data.notifications) {
          setNotifications(res.data.notifications);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotifs = filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Bell className="h-3.5 w-3.5 text-emerald-400" />
            <span>Farm Intelligence Feed</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white mt-1">Notifications & Alerts</h1>
          <p className="text-xs lg:text-sm text-slate-400">
            Real-time advisories for rain alerts, irrigation timings, fertilizer schedules, and booking updates.
          </p>
        </div>

        <button
          onClick={() => handleMarkRead('all')}
          className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-emerald-950/60 border border-emerald-800/40 text-xs font-semibold text-emerald-300 flex items-center space-x-2 transition-colors self-start md:self-auto"
        >
          <CheckCheck className="h-4 w-4 text-emerald-400" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-emerald-900/30 pb-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'all'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'unread'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Unread ({notifications.filter(n => !n.is_read).length})
        </button>
      </div>

      {/* Notifications Feed */}
      <div className="space-y-3">
        {filteredNotifs.length > 0 ? (
          filteredNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && handleMarkRead(n.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between space-x-4 ${
                !n.is_read
                  ? 'bg-slate-900/90 border-emerald-500/40 shadow-lg shadow-emerald-950/40'
                  : 'bg-slate-950/40 border-emerald-900/20 opacity-75'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  n.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' :
                  n.type === 'rain' ? 'bg-blue-500/20 text-blue-400' :
                  n.type === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-teal-500/20 text-teal-400'
                }`}>
                  {n.type === 'rain' ? <CloudRain className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-white">{n.title}</h3>
                    {!n.is_read && (
                      <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                  <span className="text-[10px] text-slate-500 mt-1.5 block">
                    {new Date(n.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {!n.is_read && (
                <span className="text-[10px] font-semibold text-emerald-400 hover:underline shrink-0">
                  Mark Read
                </span>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-slate-400 text-sm glass-panel rounded-3xl">
            No notifications available in this view.
          </div>
        )}
      </div>
    </div>
  );
}
