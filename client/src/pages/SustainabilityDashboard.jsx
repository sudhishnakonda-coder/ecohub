import React, { useState, useEffect } from 'react';
import { 
  Leaf, 
  Droplet, 
  Fuel, 
  Clock, 
  ShieldCheck, 
  DollarSign, 
  Award, 
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import api from '../services/api';

export default function SustainabilityDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/sustainability')
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const metrics = data?.metrics || {
    waterSavedLiters: 23500,
    fuelSavedLiters: 95,
    machineSharingHours: 48,
    cropLossPreventedKg: 1650,
    costSavings: 3840,
    sustainabilityScore: 88
  };

  const monthlyTrends = data?.monthlyTrends || [
    { month: 'Jan', waterSaved: 12000, fuelSaved: 30, savings: 850 },
    { month: 'Feb', waterSaved: 15500, fuelSaved: 42, savings: 1100 },
    { month: 'Mar', waterSaved: 19000, fuelSaved: 55, savings: 1420 },
    { month: 'Apr', waterSaved: 24000, fuelSaved: 68, savings: 1850 },
    { month: 'May', waterSaved: 28500, fuelSaved: 85, savings: 2200 },
    { month: 'Jun', waterSaved: 32000, fuelSaved: 95, savings: 2600 }
  ];

  const practiceBreakdown = data?.practiceBreakdown || [
    { name: 'Precision Drip Irrigation', percentage: 40, color: '#10b981' },
    { name: 'Machine Marketplace Sharing', percentage: 25, color: '#3b82f6' },
    { name: 'Cold Storage Spoilage Control', percentage: 20, color: '#8b5cf6' },
    { name: 'Targeted Bio-Fertilizer Schedule', percentage: 15, color: '#f59e0b' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Leaf className="h-3.5 w-3.5 text-emerald-400" />
            <span>Environmental Impact Analytics</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white mt-1">Sustainability Dashboard</h1>
          <p className="text-xs lg:text-sm text-slate-400">
            Real-time environmental metrics tracking water efficiency, carbon emissions reduced, and cost savings.
          </p>
        </div>

        {/* Eco Badge */}
        <div className="flex items-center space-x-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-950 to-teal-950 border border-emerald-500/40">
          <Award className="h-6 w-6 text-amber-400" />
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Farm Rating</span>
            <span className="text-sm font-extrabold text-white">Tier A+ Sustainable Farm</span>
          </div>
        </div>
      </div>

      {/* Top Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-emerald-900/30">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-xs font-semibold">Water Saved</span>
            <Droplet className="h-4 w-4" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{(metrics.waterSavedLiters / 1000).toFixed(1)}k</p>
          <span className="text-[10px] text-slate-400 font-medium">Liters</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-emerald-900/30">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-semibold">Fuel Saved</span>
            <Fuel className="h-4 w-4" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{metrics.fuelSavedLiters}</p>
          <span className="text-[10px] text-slate-400 font-medium">Liters Diesel</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-emerald-900/30">
          <div className="flex items-center justify-between text-teal-400">
            <span className="text-xs font-semibold">Sharing Hours</span>
            <Clock className="h-4 w-4" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{metrics.machineSharingHours}</p>
          <span className="text-[10px] text-slate-400 font-medium">Machine Hours</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-emerald-900/30">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-xs font-semibold">Loss Prevented</span>
            <ShieldCheck className="h-4 w-4" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">{metrics.cropLossPreventedKg}</p>
          <span className="text-[10px] text-slate-400 font-medium">Kg Yield</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-emerald-900/30">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-semibold">Financial Saved</span>
            <DollarSign className="h-4 w-4" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">${metrics.costSavings}</p>
          <span className="text-[10px] text-slate-400 font-medium">Cost Reduced</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/20">
          <div className="flex items-center justify-between text-emerald-300">
            <span className="text-xs font-semibold">Eco Score</span>
            <TrendingUp className="h-4 w-4" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-300 mt-2">{metrics.sustainabilityScore}/100</p>
          <span className="text-[10px] text-emerald-400 font-medium">+15% vs Region</span>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Water & Cost Savings Area Chart */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-3xl space-y-4 border border-emerald-900/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Water Savings Trend (Liters)</h3>
              <p className="text-xs text-slate-400">Impact of AI precision irrigation scheduling</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
              6-Month Progress
            </span>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends}>
                <defs>
                  <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#10b981', borderRadius: '0.75rem', color: '#fff' }}
                />
                <Area type="monotone" dataKey="waterSaved" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorWater)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Practice Breakdown Distribution Chart */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-3xl space-y-4 border border-emerald-900/30 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Sustainability Drivers</h3>
            <p className="text-xs text-slate-400">Contribution by smart farming practices</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={practiceBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="percentage"
                >
                  {practiceBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '0.75rem', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-2 border-t border-emerald-900/20">
            {practiceBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-300 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-white">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
