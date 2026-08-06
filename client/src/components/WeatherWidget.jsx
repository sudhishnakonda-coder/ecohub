import React, { useState, useEffect } from 'react';
import { CloudSun, Droplets, Wind, CloudRain, Thermometer, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function WeatherWidget({ location = 'GreenValley Farm' }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWeather = () => {
    setLoading(true);
    api.get(`/weather?location=${encodeURIComponent(location)}`)
      .then((res) => {
        setWeather(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWeather();
  }, [location]);

  if (loading && !weather) {
    return (
      <div className="glass-panel p-5 rounded-2xl animate-pulse flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-32 bg-slate-800 rounded"></div>
          <div className="h-8 w-20 bg-slate-800 rounded"></div>
        </div>
        <div className="h-10 w-10 bg-slate-800 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
      <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none"></div>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <CloudSun className="h-4 w-4 text-emerald-400" />
            <span>Farm Micro-Climate</span>
          </div>
          <h3 className="text-xl font-bold text-white mt-1">{weather?.location || location}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{weather?.description || 'Optimal growing conditions'}</p>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={fetchWeather}
            title="Refresh weather"
            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/40 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-600/30 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
            {weather?.rain_probability > 50 ? (
              <CloudRain className="h-7 w-7 text-blue-400 animate-bounce" />
            ) : (
              <CloudSun className="h-7 w-7 text-amber-400" />
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-emerald-900/30 grid grid-cols-3 gap-3">
        <div className="bg-slate-900/50 p-2.5 rounded-xl border border-emerald-900/20">
          <div className="flex items-center text-xs text-slate-400 space-x-1">
            <Thermometer className="h-3.5 w-3.5 text-amber-400" />
            <span>Temp</span>
          </div>
          <p className="text-lg font-bold text-white mt-1">{weather?.temp ?? 26}°C</p>
        </div>

        <div className="bg-slate-900/50 p-2.5 rounded-xl border border-emerald-900/20">
          <div className="flex items-center text-xs text-slate-400 space-x-1">
            <Droplets className="h-3.5 w-3.5 text-blue-400" />
            <span>Humidity</span>
          </div>
          <p className="text-lg font-bold text-white mt-1">{weather?.humidity ?? 62}%</p>
        </div>

        <div className="bg-slate-900/50 p-2.5 rounded-xl border border-emerald-900/20">
          <div className="flex items-center text-xs text-slate-400 space-x-1">
            <Wind className="h-3.5 w-3.5 text-teal-400" />
            <span>Wind</span>
          </div>
          <p className="text-lg font-bold text-white mt-1">{weather?.wind_speed ?? 14} km/h</p>
        </div>
      </div>
    </div>
  );
}
