import React, { useState, useEffect } from 'react';
import { User, Sprout, MapPin, Phone, Mail, Plus, Check } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();
  const [farms, setFarms] = useState([]);
  const [showAddFarm, setShowAddFarm] = useState(false);
  const [newFarm, setNewFarm] = useState({
    crop: '',
    location: '',
    soil_type: 'Loamy Soil',
    crop_stage: 'Vegetative Stage',
    size_acres: 10
  });

  const fetchFarms = () => {
    api.get('/farms')
      .then((res) => {
        if (res.data && res.data.farms) setFarms(res.data.farms);
      })
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const handleAddFarm = async (e) => {
    e.preventDefault();
    try {
      await api.post('/farms', newFarm);
      setShowAddFarm(false);
      setNewFarm({
        crop: '',
        location: '',
        soil_type: 'Loamy Soil',
        crop_stage: 'Vegetative Stage',
        size_acres: 10
      });
      fetchFarms();
    } catch (err) {
      alert('Failed to create farm profile.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <User className="h-3.5 w-3.5 text-emerald-400" />
          <span>Account & Farm Management</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold text-white mt-1">Farmer Profile</h1>
        <p className="text-xs lg:text-sm text-slate-400">
          Manage your personal credentials, farm locations, crop cycles, and system settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Personal Info Card */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-3xl space-y-5 border border-emerald-900/30">
          <div className="flex flex-col items-center text-center space-y-3 pb-4 border-b border-emerald-900/30">
            <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 text-3xl font-black shadow-xl shadow-emerald-950">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'F'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user?.name || 'Farmer User'}</h2>
              <p className="text-xs text-emerald-400 font-semibold">Certified Eco-Farmer</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center space-x-3 text-slate-300">
              <Mail className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="truncate">{user?.email || 'farmer@ecohub.com'}</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-300">
              <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{user?.phone || '+91 98765 43210'}</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-300">
              <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>GreenValley Agro Hub, Sector 4</span>
            </div>
          </div>
        </div>

        {/* Farm Profiles List & Manager */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-3xl space-y-4 border border-emerald-900/30">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-900/30">
            <div className="flex items-center space-x-2">
              <Sprout className="h-5 w-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Registered Farms ({farms.length})</h3>
            </div>

            <button
              onClick={() => setShowAddFarm(!showAddFarm)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Add Farm</span>
            </button>
          </div>

          {/* Add Farm Form */}
          {showAddFarm && (
            <form onSubmit={handleAddFarm} className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/40 space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Register New Farm Plot</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Crop Name</label>
                  <input
                    type="text"
                    required
                    value={newFarm.crop}
                    onChange={(e) => setNewFarm({ ...newFarm, crop: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-emerald-800/40 rounded-xl text-white"
                    placeholder="e.g. Rice, Wheat, Cotton"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Location</label>
                  <input
                    type="text"
                    required
                    value={newFarm.location}
                    onChange={(e) => setNewFarm({ ...newFarm, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-emerald-800/40 rounded-xl text-white"
                    placeholder="e.g. Sector 7, GreenValley"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Soil Type</label>
                  <input
                    type="text"
                    required
                    value={newFarm.soil_type}
                    onChange={(e) => setNewFarm({ ...newFarm, soil_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-emerald-800/40 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Crop Stage</label>
                  <input
                    type="text"
                    required
                    value={newFarm.crop_stage}
                    onChange={(e) => setNewFarm({ ...newFarm, crop_stage: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-emerald-800/40 rounded-xl text-white"
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-500 font-bold text-slate-950 text-xs">
                Save Farm Profile
              </button>
            </form>
          )}

          {/* Farms List */}
          <div className="space-y-3">
            {farms.length > 0 ? (
              farms.map((f) => (
                <div key={f.id} className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-900/20 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{f.location}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Crop: <strong className="text-emerald-400">{f.crop}</strong> &bull; Soil: {f.soil_type} &bull; Stage: {f.crop_stage}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    Active Plot
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                No farms registered yet. Click Add Farm above.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
