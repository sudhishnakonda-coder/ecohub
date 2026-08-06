import React, { useState, useEffect } from 'react';
import { Sparkles, Droplet, Sprout, ShieldAlert, Calendar, Lightbulb, History, Check, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function AIAdvisor() {
  const [crop, setCrop] = useState('Wheat');
  const [location, setLocation] = useState('GreenValley Farm');
  const [soilType, setSoilType] = useState('Loamy Soil');
  const [cropStage, setCropStage] = useState('Vegetative Stage');
  const [autoSchedule, setAutoSchedule] = useState(true);

  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('advisor'); // 'advisor' | 'history'
  const [error, setError] = useState(null);

  const presets = [
    { crop: 'Wheat', soil: 'Loamy Soil', stage: 'Vegetative Stage' },
    { crop: 'Rice / Paddy', soil: 'Clay Loam', stage: 'Tillering Stage' },
    { crop: 'Cotton', soil: 'Black Cotton Soil', stage: 'Flowering & Boll Stage' },
    { crop: 'Tomato', soil: 'Sandy Loam', stage: 'Fruiting Stage' },
    { crop: 'Maize / Corn', soil: 'Silt Loam', stage: 'Knee-High Growth' }
  ];

  const fetchHistory = () => {
    api.get('/advisor')
      .then((res) => {
        if (res.data && res.data.recommendations) {
          setHistory(res.data.recommendations);
        }
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/advisor', {
        crop,
        location,
        soil_type: soilType,
        crop_stage: cropStage,
        auto_schedule: autoSchedule
      });
      setRecommendation(res.data.ai_response);
      fetchHistory();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to generate recommendation. Please try again.';
      setError(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-spin-slow" />
            <span>AI Agronomist Engine</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white mt-1">AI Crop Advisor</h1>
          <p className="text-xs lg:text-sm text-slate-400">
            Generate customized irrigation, fertilizer, pest control, and harvest plans powered by Gemini AI.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900/80 p-1 rounded-2xl border border-emerald-900/30">
          <button
            onClick={() => setActiveTab('advisor')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'advisor'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Advisor Engine
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>Past Prescriptions ({history.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'advisor' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Parameters Form */}
          <div className="lg:col-span-5 glass-panel p-6 rounded-3xl space-y-5 border border-emerald-900/30">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>Farm Parameters</span>
            </h3>

            {/* Quick Presets */}
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">Quick Presets</span>
              <div className="flex flex-wrap gap-2">
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCrop(p.crop);
                      setSoilType(p.soil);
                      setCropStage(p.stage);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-emerald-950/60 border border-emerald-900/40 text-[11px] font-semibold text-emerald-300 transition-colors"
                  >
                    {p.crop}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Crop Name</label>
                <input
                  type="text"
                  required
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-emerald-800/40 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Wheat, Rice, Cotton, Tomato"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Farm Location / City</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-emerald-800/40 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. GreenValley Farm, Punjab"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Soil Type</label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-emerald-800/40 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Loamy Soil">Loamy Soil (Ideal Balance)</option>
                  <option value="Clay Soil">Clay Soil (High Moisture Retention)</option>
                  <option value="Sandy Loam">Sandy Loam (Quick Drainage)</option>
                  <option value="Black Cotton Soil">Black Cotton Soil (Nutrient Rich)</option>
                  <option value="Alluvial Soil">Alluvial Soil (Fertile River Basin)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Growth / Crop Stage</label>
                <select
                  value={cropStage}
                  onChange={(e) => setCropStage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-emerald-800/40 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Sowing & Germination">Sowing & Germination (0-15 Days)</option>
                  <option value="Vegetative Stage">Vegetative Stage (15-45 Days)</option>
                  <option value="Flowering & Panicle Stage">Flowering & Panicle Stage (45-75 Days)</option>
                  <option value="Fruiting & Grain Filling">Fruiting & Grain Filling (75-100 Days)</option>
                  <option value="Maturity & Pre-Harvest">Maturity & Pre-Harvest (100+ Days)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="autoSchedule"
                  checked={autoSchedule}
                  onChange={(e) => setAutoSchedule(e.target.checked)}
                  className="h-4 w-4 rounded border-emerald-800 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="autoSchedule" className="text-xs text-slate-300 cursor-pointer">
                  Auto-sync activities directly to Smart Calendar
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-950 flex items-center justify-center space-x-2 transform hover:scale-[1.02] transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Analyzing Farm & Weather...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    <span>Generate AI Recommendation</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* AI Output Display Panel */}
          <div className="lg:col-span-7 space-y-4">
            {error && (
              <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs font-medium animate-fade-in">
                ⚠️ {error}
              </div>
            )}
            {recommendation ? (
              <div className="space-y-4 animate-fade-in">
                {/* Header Summary */}
                <div className="glass-panel p-5 rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">AI Agronomy Prescription</span>
                      <h2 className="text-xl font-extrabold text-white mt-1">{crop} &bull; {location}</h2>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center space-x-1">
                      <Check className="h-3.5 w-3.5" />
                      <span>Sync'd to Calendar</span>
                    </span>
                  </div>
                </div>

                {/* Recommendation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Irrigation Card */}
                  <div className="glass-panel p-5 rounded-3xl border border-blue-500/30 space-y-2">
                    <div className="flex items-center space-x-2 text-blue-400 font-bold text-sm">
                      <Droplet className="h-5 w-5" />
                      <span>Irrigation Schedule</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed pt-1">
                      {recommendation.irrigation}
                    </p>
                  </div>

                  {/* Fertilizer Card */}
                  <div className="glass-panel p-5 rounded-3xl border border-amber-500/30 space-y-2">
                    <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                      <Sprout className="h-5 w-5" />
                      <span>Fertilizer & Bio-Nutrients</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed pt-1">
                      {recommendation.fertilizer}
                    </p>
                  </div>

                  {/* Pest Control Card */}
                  <div className="glass-panel p-5 rounded-3xl border border-red-500/30 space-y-2">
                    <div className="flex items-center space-x-2 text-red-400 font-bold text-sm">
                      <ShieldAlert className="h-5 w-5" />
                      <span>Pest Prevention & Control</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed pt-1">
                      {recommendation.pest_control}
                    </p>
                  </div>

                  {/* Harvest Recommendation */}
                  <div className="glass-panel p-5 rounded-3xl border border-teal-500/30 space-y-2">
                    <div className="flex items-center space-x-2 text-teal-400 font-bold text-sm">
                      <Calendar className="h-5 w-5" />
                      <span>Harvest Window & Strategy</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed pt-1">
                      {recommendation.harvest}
                    </p>
                  </div>
                </div>

                {/* Sustainability Tips */}
                {recommendation.tips && recommendation.tips.length > 0 && (
                  <div className="glass-panel p-5 rounded-3xl border border-emerald-500/30 space-y-3">
                    <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                      <Lightbulb className="h-5 w-5" />
                      <span>Sustainability & Cost-Saving Tips</span>
                    </div>
                    <ul className="space-y-2 pt-1">
                      {recommendation.tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full min-h-[400px] glass-panel rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4 border border-emerald-900/30">
                <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-white">AI Agronomist Ready</h3>
                <p className="text-xs text-slate-400 max-w-md">
                  Select your crop and growth parameters on the left to generate customized irrigation, pest management, and yield optimization advice.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* History Tab */
        <div className="space-y-4">
          {history.length > 0 ? (
            history.map((rec) => (
              <div key={rec.id} className="glass-panel p-6 rounded-3xl border border-emerald-900/30 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-900/30">
                  <div>
                    <h3 className="text-base font-bold text-white">{rec.crop} &bull; {rec.location}</h3>
                    <p className="text-xs text-slate-400">Stage: {rec.crop_stage} | Soil: {rec.soil_type} | Generated: {new Date(rec.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900/60 p-3 rounded-xl">
                    <span className="font-bold text-blue-400 block mb-1">💧 Irrigation</span>
                    <p className="text-slate-300">{rec.ai_response?.irrigation}</p>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded-xl">
                    <span className="font-bold text-amber-400 block mb-1">🌱 Fertilizer</span>
                    <p className="text-slate-300">{rec.ai_response?.fertilizer}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-slate-400 text-sm">
              No historical AI recommendations found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
