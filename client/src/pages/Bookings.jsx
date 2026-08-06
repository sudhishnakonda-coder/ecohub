import React, { useState, useEffect } from 'react';
import { BookOpenCheck, Tractor, Warehouse, XCircle, Clock, DollarSign, Calendar } from 'lucide-react';
import api from '../services/api';

export default function Bookings() {
  const [machineBookings, setMachineBookings] = useState([]);
  const [storageBookings, setStorageBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('machinery'); // 'machinery' | 'storage'
  const [loading, setLoading] = useState(true);

  const fetchBookings = () => {
    setLoading(true);
    Promise.all([
      api.get('/machines/bookings'),
      api.get('/cold-storage/bookings')
    ])
      .then(([mRes, sRes]) => {
        if (mRes.data && mRes.data.bookings) setMachineBookings(mRes.data.bookings);
        if (sRes.data && sRes.data.bookings) setStorageBookings(sRes.data.bookings);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelMachineBooking = async (id) => {
    if (!window.confirm('Cancel this machinery booking?')) return;
    try {
      await api.delete(`/machines/book/${id}`);
      // Remove from local state immediately so it disappears
      setMachineBookings(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      alert('Failed to cancel booking.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <BookOpenCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Reservations & Orders Portal</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white mt-1">My Bookings</h1>
          <p className="text-xs lg:text-sm text-slate-400">
            Track active machinery sharing rentals and cold warehouse space reservations.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 bg-slate-900/80 p-1 rounded-2xl border border-emerald-900/30">
          <button
            onClick={() => setActiveTab('machinery')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'machinery'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tractor className="h-4 w-4" />
            <span>Machinery ({machineBookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeTab === 'storage'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Warehouse className="h-4 w-4" />
            <span>Cold Storage ({storageBookings.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'machinery' ? (
        /* Machinery Bookings List */
        <div className="space-y-4">
          {machineBookings.length > 0 ? (
            machineBookings.map((b) => (
              <div key={b.id} className="glass-panel p-5 rounded-3xl border border-emerald-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-2xl bg-slate-900 overflow-hidden shrink-0">
                    <img src={b.image_url || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=300&q=80'} alt={b.machine_name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      b.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {b.status}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">{b.machine_name}</h3>
                    <p className="text-xs text-slate-400">Owner: {b.owner} &bull; Location: {b.location}</p>
                    <div className="flex items-center space-x-3 text-xs text-slate-300 mt-1">
                      <span className="flex items-center space-x-1"><Calendar className="h-3.5 w-3.5 text-emerald-400" /><span>Date: {b.booking_date}</span></span>
                      <span>Total: <strong className="text-emerald-400">${b.total_price}</strong></span>
                    </div>
                  </div>
                </div>

                {b.status !== 'cancelled' && (
                  <button
                    onClick={() => handleCancelMachineBooking(b.id)}
                    className="px-3.5 py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-300 text-xs font-bold flex items-center space-x-1.5 self-start md:self-auto"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Cancel Reservation</span>
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm glass-panel rounded-3xl">
              No machinery bookings recorded yet.
            </div>
          )}
        </div>
      ) : (
        /* Cold Storage Bookings List */
        <div className="space-y-4">
          {storageBookings.length > 0 ? (
            storageBookings.map((b) => (
              <div key={b.id} className="glass-panel p-5 rounded-3xl border border-teal-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-2xl bg-slate-900 overflow-hidden shrink-0">
                    <img src={b.image_url || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=300&q=80'} alt={b.storage_name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-teal-500/20 text-teal-400">
                      {b.status}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">{b.storage_name}</h3>
                    <p className="text-xs text-slate-400">Location: {b.location}</p>
                    <div className="flex items-center space-x-4 text-xs text-slate-300 mt-1">
                      <span>Reserved: <strong className="text-white">{b.quantity_tons} Tons</strong></span>
                      <span>Duration: <strong className="text-white">{b.duration_days} Days</strong></span>
                      <span>Total: <strong className="text-teal-400">${b.total_price}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm glass-panel rounded-3xl">
              No cold storage reservations recorded yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
