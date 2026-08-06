import React, { useState, useEffect } from 'react';
import { Warehouse, MapPin, Plus, Calendar, ShieldCheck, X } from 'lucide-react';
import api from '../services/api';
import BookingCard from '../components/BookingCard';
import MapView from '../components/MapView';
import SuccessModal from '../components/SuccessModal';

export default function ColdStorage() {
  const [storages, setStorages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLocation, setSearchLocation] = useState('');

  // Booking Modal State
  const [bookingStorage, setBookingStorage] = useState(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [durationDays, setDurationDays] = useState(7);
  const [quantityTons, setQuantityTons] = useState(5.0);

  // Success Notification Popup State
  const [successData, setSuccessData] = useState(null);

  // Add Storage Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStorage, setNewStorage] = useState({
    name: '',
    location: 'GreenValley Agro Hub',
    capacity: 500,
    price: 15,
    image_url: ''
  });

  const fetchStorages = () => {
    setLoading(true);
    let url = '/cold-storage';
    if (searchLocation) url += `?location=${encodeURIComponent(searchLocation)}`;

    api.get(url)
      .then((res) => {
        if (res.data && res.data.cold_storages) {
          setStorages(res.data.cold_storages);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStorages();
  }, [searchLocation]);

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!bookingStorage) return;
    const totalPrice = (bookingStorage.price * durationDays * quantityTons).toFixed(2);
    try {
      await api.post('/cold-storage/book', {
        storage_id: bookingStorage.id,
        booking_date: bookingDate,
        duration_days: parseInt(durationDays),
        quantity_tons: parseFloat(quantityTons)
      });

      // Show Popup Notification
      setSuccessData({
        title: "Cold Storage Reserved! ❄️",
        message: `Successfully reserved ${quantityTons} Tons of space at ${bookingStorage.name} for ${durationDays} days starting ${bookingDate}.`,
        details: {
          item: bookingStorage.name,
          date: `${quantityTons} Tons (${durationDays} Days)`,
          price: totalPrice
        }
      });

      setBookingStorage(null);
      fetchStorages();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reserve cold storage space.');
    }
  };

  const handleCreateStorage = async (e) => {
    e.preventDefault();
    try {
      await api.post('/cold-storage', newStorage);
      setShowAddModal(false);

      // Show Popup Notification for storage creation
      setSuccessData({
        title: "Cold Storage Facility Listed! 🏬",
        message: `${newStorage.name} has been published with ${newStorage.capacity} Tons capacity.`,
        details: {
          item: newStorage.name,
          date: "Now Live",
          price: newStorage.price
        }
      });

      setNewStorage({
        name: '',
        location: 'GreenValley Agro Hub',
        capacity: 500,
        price: 15,
        image_url: ''
      });
      fetchStorages();
    } catch (err) {
      alert('Failed to add cold storage facility.');
    }
  };

  const handleDeleteStorage = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from Cold Storage Network?`)) return;
    try {
      await api.delete(`/cold-storage/${id}`);
      setStorages((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert('Failed to delete cold storage facility.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Warehouse className="h-3.5 w-3.5 text-teal-400" />
            <span>Climate-Controlled Post-Harvest Storage</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white mt-1">Cold Storage Network</h1>
          <p className="text-xs lg:text-sm text-slate-400">
            Book climate-controlled cold warehouse space to prevent post-harvest spoilage and protect market value.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950 flex items-center space-x-2 transform hover:scale-105 transition-all self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Storage Facility</span>
        </button>
      </div>

      {/* Interactive Map */}
      <div className="glass-panel p-4 rounded-3xl space-y-3 border border-emerald-900/30">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">Cold Chain Hub Locations</span>
          <span className="text-xs text-slate-400">{storages.length} Warehouses Listed</span>
        </div>
        <MapView items={storages} onSelect={(item) => setBookingStorage(item)} />
      </div>

      {/* Location Search Bar */}
      <div className="flex items-center justify-between glass-panel p-4 rounded-2xl border border-emerald-900/30">
        <span className="text-xs font-bold text-white">Find Nearby Facilities</span>
        <div className="relative w-64">
          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-teal-400" />
          <input
            type="text"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            placeholder="Search location..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-emerald-800/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Storage Facility Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {storages.length > 0 ? (
          storages.map((storage) => (
            <BookingCard
              key={storage.id}
              title={storage.name}
              subtitle={`Total Capacity: ${storage.capacity} Tons | Available: ${storage.available_capacity ?? storage.capacity} Tons`}
              location={storage.location}
              price={storage.price}
              priceUnit="/ton-day"
              type="Cold Chain"
              imageUrl={storage.image_url}
              availability={Number(storage.available_capacity ?? storage.capacity) > 0}
              onBook={() => setBookingStorage(storage)}
              onDelete={() => handleDeleteStorage(storage.id, storage.name)}
              buttonText="Reserve Space"
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm">
            No cold storage facilities found in this location.
          </div>
        )}
      </div>

      {/* Reservation Modal */}
      {bookingStorage && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl max-w-md w-full border border-teal-500/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/30">
              <div>
                <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">Reserve Cold Storage Space</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{bookingStorage.name}</h3>
              </div>
              <button onClick={() => setBookingStorage(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-4">
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-emerald-900/30 space-y-1 text-xs">
                <p className="text-slate-300">Location: <strong className="text-white">{bookingStorage.location}</strong></p>
                <p className="text-teal-400 font-bold text-sm">Price: ${bookingStorage.price} / Ton / Day</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Reservation Date</label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-emerald-800/40 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity (Tons)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={quantityTons}
                    onChange={(e) => setQuantityTons(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-emerald-800/40 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-emerald-800/40 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-teal-950/40 border border-teal-500/30 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">Estimated Total:</span>
                <span className="text-base font-extrabold text-teal-300">
                  ${(bookingStorage.price * durationDays * quantityTons).toFixed(2)}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 text-slate-950 font-bold text-xs shadow-lg"
              >
                Confirm Storage Reservation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Storage Facility Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl max-w-md w-full border border-teal-500/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/30">
              <h3 className="text-lg font-bold text-white">Add Cold Storage Facility</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateStorage} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Facility Name</label>
                <input
                  type="text"
                  required
                  value={newStorage.name}
                  onChange={(e) => setNewStorage({ ...newStorage, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-emerald-800/40 rounded-xl text-xs text-white"
                  placeholder="FrostShield Cold Storage"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={newStorage.location}
                  onChange={(e) => setNewStorage({ ...newStorage, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-emerald-800/40 rounded-xl text-xs text-white"
                  placeholder="GreenValley Agro Hub"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Total Capacity (Tons)</label>
                  <input
                    type="number"
                    required
                    value={newStorage.capacity}
                    onChange={(e) => setNewStorage({ ...newStorage, capacity: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-emerald-800/40 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Price ($/ton-day)</label>
                  <input
                    type="number"
                    required
                    value={newStorage.price}
                    onChange={(e) => setNewStorage({ ...newStorage, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-emerald-800/40 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 font-bold text-white text-xs shadow-lg"
              >
                Publish Storage Facility
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Notification Popup */}
      <SuccessModal
        isOpen={Boolean(successData)}
        onClose={() => setSuccessData(null)}
        title={successData?.title}
        message={successData?.message}
        details={successData?.details}
      />
    </div>
  );
}
