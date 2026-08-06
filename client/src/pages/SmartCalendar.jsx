import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  Edit3, 
  Filter, 
  CheckCircle2, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  X
} from 'lucide-react';
import api from '../services/api';

export default function SmartCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Irrigation',
    status: 'pending',
    description: ''
  });

  const fetchEvents = () => {
    setLoading(true);
    api.get('/calendar')
      .then((res) => {
        if (res.data && res.data.events) {
          setEvents(res.data.events);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const categories = ['All', 'Irrigation', 'Fertilizer', 'Pest Inspection', 'Harvest', 'Machinery Booking', 'Cold Storage'];

  const filteredEvents = selectedCategory === 'All'
    ? events
    : events.filter(e => e.type.toLowerCase() === selectedCategory.toLowerCase());

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await api.put(`/calendar/${editingEvent.id}`, formData);
      } else {
        await api.post('/calendar', formData);
      }
      setShowAddModal(false);
      setEditingEvent(null);
      setFormData({
        title: '',
        date: new Date().toISOString().split('T')[0],
        type: 'Irrigation',
        status: 'pending',
        description: ''
      });
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm('Delete this calendar event?')) return;
    try {
      await api.delete(`/calendar/${id}`);
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (evt) => {
    setEditingEvent(evt);
    setFormData({
      title: evt.title,
      date: evt.date,
      type: evt.type,
      status: evt.status || 'pending',
      description: evt.description || ''
    });
    setShowAddModal(true);
  };

  // Calendar Days calculation
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay, monthName: date.toLocaleString('default', { month: 'long' }), year };
  };

  const { days, firstDay, monthName, year } = getDaysInMonth(currentMonth);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <CalendarIcon className="h-3.5 w-3.5 text-emerald-400" />
            <span>Automated Schedule Engine</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white mt-1">Smart Calendar</h1>
          <p className="text-xs lg:text-sm text-slate-400">
            Organize irrigation routines, fertilizer cycles, pest checks, and resource reservations.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingEvent(null);
            setFormData({
              title: '',
              date: new Date().toISOString().split('T')[0],
              type: 'Irrigation',
              status: 'pending',
              description: ''
            });
            setShowAddModal(true);
          }}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950 flex items-center space-x-2 transform hover:scale-105 transition-all self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Custom Event</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-bold text-slate-400 flex items-center space-x-1 shrink-0 pr-2">
          <Filter className="h-3.5 w-3.5 text-emerald-400" />
          <span>Filter:</span>
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-emerald-900/30'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid: Calendar View + Activity List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Calendar View */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-3xl space-y-4 border border-emerald-900/30">
          <div className="flex items-center justify-between pb-4 border-b border-emerald-900/30">
            <h2 className="text-lg font-bold text-white">{monthName} {year}</h2>
            <div className="flex items-center space-x-2">
              <button 
                onClick={prevMonth}
                className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-emerald-400 hover:bg-emerald-950/40 border border-emerald-900/30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button 
                onClick={nextMonth}
                className="p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-emerald-400 hover:bg-emerald-950/40 border border-emerald-900/30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-emerald-400 uppercase tracking-wider">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>

          {/* Calendar Days Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty slots for firstDay offset */}
            {Array.from({ length: firstDay }).map((_, idx) => (
              <div key={`empty-${idx}`} className="h-20 sm:h-24 rounded-2xl bg-slate-950/20 border border-transparent"></div>
            ))}

            {/* Days of Month */}
            {Array.from({ length: days }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${year}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayEvents = filteredEvents.filter(e => e.date === dateStr);
              const isToday = dayNum === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth() && year === new Date().getFullYear();

              return (
                <div 
                  key={`day-${dayNum}`}
                  className={`h-20 sm:h-24 p-1.5 rounded-2xl border transition-all flex flex-col justify-between overflow-hidden ${
                    isToday
                      ? 'bg-emerald-950/40 border-emerald-500/50 shadow-md shadow-emerald-950'
                      : 'bg-slate-900/40 border-emerald-900/20 hover:border-emerald-700/40'
                  }`}
                >
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md self-start ${isToday ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}>
                    {dayNum}
                  </span>

                  <div className="space-y-1 overflow-y-auto max-h-14">
                    {dayEvents.map((evt) => (
                      <div 
                        key={evt.id}
                        onClick={() => openEditModal(evt)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold truncate cursor-pointer ${
                          evt.type === 'Irrigation' ? 'bg-blue-900/60 text-blue-300 border border-blue-500/30' :
                          evt.type === 'Fertilizer' ? 'bg-amber-900/60 text-amber-300 border border-amber-500/30' :
                          evt.type === 'Harvest' ? 'bg-teal-900/60 text-teal-300 border border-teal-500/30' :
                          'bg-emerald-900/60 text-emerald-300 border border-emerald-500/30'
                        }`}
                        title={evt.title}
                      >
                        {evt.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Feed Sidebar */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-3xl space-y-4 border border-emerald-900/30 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white pb-3 border-b border-emerald-900/30">
              Scheduled Farm Activities ({filteredEvents.length})
            </h3>

            <div className="mt-4 space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((evt) => (
                  <div key={evt.id} className="p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-900/30 space-y-2 group hover:border-emerald-500/40 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          evt.type === 'Irrigation' ? 'bg-blue-500/20 text-blue-400' :
                          evt.type === 'Fertilizer' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {evt.type}
                        </span>
                        <h4 className="text-xs font-bold text-white mt-1">{evt.title}</h4>
                      </div>

                      <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100">
                        <button onClick={() => openEditModal(evt)} className="p-1 text-slate-400 hover:text-emerald-400">
                          <Edit3 className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDeleteEvent(evt.id)} className="p-1 text-slate-400 hover:text-red-400">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2">{evt.description || 'Scheduled agricultural task.'}</p>

                    <div className="pt-2 border-t border-emerald-900/20 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Date: <strong className="text-slate-200">{evt.date}</strong></span>
                      <span className="capitalize font-semibold text-emerald-400">{evt.status}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No events found for this filter.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl max-w-md w-full border border-emerald-500/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/30">
              <h3 className="text-lg font-bold text-white">
                {editingEvent ? 'Edit Calendar Event' : 'Add Custom Activity'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-emerald-800/40 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Drip Irrigation Field 2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-emerald-800/40 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-emerald-800/40 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Irrigation">Irrigation</option>
                    <option value="Fertilizer">Fertilizer</option>
                    <option value="Pest Inspection">Pest Inspection</option>
                    <option value="Harvest">Harvest</option>
                    <option value="Machinery Booking">Machinery Booking</option>
                    <option value="Cold Storage">Cold Storage</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-emerald-800/40 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Instructions or notes..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs shadow-lg"
              >
                {editingEvent ? 'Save Changes' : 'Create Activity'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
