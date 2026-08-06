import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Calendar, 
  Tractor, 
  Warehouse, 
  TrendingUp, 
  Droplet, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  Leaf
} from 'lucide-react';
import api from '../services/api';
import WeatherWidget from '../components/WeatherWidget';

export default function Dashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => setDashboard(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const farm = dashboard?.farm || { crop: 'Wheat', location: 'GreenValley Farm', soil_type: 'Loamy Soil', crop_stage: 'Vegetative Stage' };
  const latestRec = dashboard?.latestRecommendation;
  const upcomingEvents = dashboard?.upcomingEvents || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner & Farm Profile Header */}
      <div className="glass-panel p-6 rounded-3xl relative overflow-hidden bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/40 border border-emerald-800/40">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Leaf className="h-3.5 w-3.5" />
              <span>Active Farm Profile</span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-white">
              Welcome back to <span className="text-emerald-400">{farm.location}</span>
            </h1>
            <p className="text-xs lg:text-sm text-slate-300">
              Primary Crop: <strong className="text-emerald-300 font-bold">{farm.crop}</strong> &bull; Soil: {farm.soil_type} &bull; Stage: <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-semibold">{farm.crop_stage}</span>
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => navigate('/advisor')}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-950 flex items-center space-x-2 transform hover:scale-105 transition-all"
            >
              <Sparkles className="h-4 w-4" />
              <span>Get AI Recommendation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid Row 1: Weather + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <WeatherWidget location={farm.location} />
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between border border-emerald-900/30">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="text-xs font-semibold">Eco Score</span>
              <TrendingUp className="h-4 w-4" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-white">{dashboard?.sustainabilityScore || 88}</span>
              <span className="text-xs text-slate-400">/100</span>
            </div>
            <p className="text-[10px] text-emerald-400 mt-1 font-medium">+12% from last month</p>
          </div>

          <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between border border-emerald-900/30">
            <div className="flex items-center justify-between text-blue-400">
              <span className="text-xs font-semibold">Water Saved</span>
              <Droplet className="h-4 w-4" />
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-white">23.5k</span>
              <span className="text-xs text-slate-400"> L</span>
            </div>
            <p className="text-[10px] text-blue-400 mt-1 font-medium">Smart drip scheduled</p>
          </div>

          <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between border border-emerald-900/30">
            <div className="flex items-center justify-between text-amber-400">
              <span className="text-xs font-semibold">Machinery</span>
              <Tractor className="h-4 w-4" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-white">{dashboard?.activeBookings?.machinery || 1}</span>
              <span className="text-xs text-slate-400"> Booked</span>
            </div>
            <p className="text-[10px] text-amber-400 mt-1 font-medium">Harvester ready</p>
          </div>

          <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between border border-emerald-900/30">
            <div className="flex items-center justify-between text-teal-400">
              <span className="text-xs font-semibold">Cold Storage</span>
              <Warehouse className="h-4 w-4" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-white">{dashboard?.activeBookings?.storage || 1}</span>
              <span className="text-xs text-slate-400"> Facility</span>
            </div>
            <p className="text-[10px] text-teal-400 mt-1 font-medium">FrostShield Unit</p>
          </div>
        </div>
      </div>

      {/* Grid Row 2: Latest AI Recommendation Card + Smart Calendar Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Recommendation Highlight */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl space-y-4 border border-emerald-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Latest AI Agronomist Prescription</h3>
                <p className="text-xs text-slate-400">Tailored for {farm.crop} in {farm.soil_type}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/advisor')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
            >
              <span>View Full Advice</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {latestRec ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-900/40 space-y-1">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">💧 Irrigation Strategy</span>
                <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed">{latestRec.irrigation}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-900/40 space-y-1">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">🌱 Fertilizer Dosage</span>
                <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed">{latestRec.fertilizer}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-900/40 space-y-1">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider">🛡️ Pest Control</span>
                <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed">{latestRec.pest_control}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-900/40 space-y-1">
                <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">🌾 Harvest Target</span>
                <p className="text-xs text-slate-200 line-clamp-3 leading-relaxed">{latestRec.harvest}</p>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-900/50 text-center space-y-3">
              <p className="text-xs text-slate-400">No recent AI prescription generated yet.</p>
              <button
                onClick={() => navigate('/advisor')}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-500"
              >
                Generate AI Advice Now
              </button>
            </div>
          )}
        </div>

        {/* Smart Calendar Preview */}
        <div className="lg:col-span-1 glass-panel p-6 rounded-3xl flex flex-col justify-between border border-emerald-900/30">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-emerald-900/30">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Upcoming Schedule</h3>
              </div>
              <button
                onClick={() => navigate('/calendar')}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Calendar
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((evt) => (
                  <div key={evt.id} className="p-3 rounded-xl bg-slate-900/70 border border-emerald-900/20 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{evt.title}</h4>
                      <p className="text-[11px] text-slate-400">{evt.date} &bull; <span className="text-emerald-400 font-semibold">{evt.type}</span></p>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  No upcoming activities scheduled.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate('/calendar')}
            className="w-full mt-4 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-950/60 border border-emerald-800/40 text-xs font-semibold text-emerald-300 flex items-center justify-center space-x-1"
          >
            <span>Open Full Interactive Calendar</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
