import React, { useState, useEffect } from 'react';
import { Tractor, Search, Filter, MapPin, Plus, CheckCircle, X } from 'lucide-react';
import api from '../services/api';
import BookingCard from '../components/BookingCard';
import MapView from '../components/MapView';
import SuccessModal from '../components/SuccessModal';

export default function MachineryMarketplace() {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('All');
  const [searchLocation, setSearchLocation] = useState('');

  // Booking Modal State
  const [bookingMachine, setBookingMachine] = useState(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Success Notification Popup State
  const [successData, setSuccessData] = useState(null);

  // Add Machine Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMachine, setNewMachine] = useState({
    owner: '',
    machine_name: '',
    type: 'Tractor',
    location: 'GreenValley Agro Hub',
    rent: 40,
    image_url: '',
    description: ''
  });

  const fetchMachines = () => {
    setLoading(true);
    let url = '/machines';
    const params = new URLSearchParams();
    if (selectedType !== 'All') params.append('type', selectedType);
    if (searchLocation) params.append('location', searchLocation);
    if (params.toString()) url += `?${params.toString()}`;

    api.get(url)
      .then((res) => {
        if (res.data && res.data.machines) {
          setMachines(res.data.machines);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMachines();
  }, [selectedType, searchLocation]);

  const machineTypes = ['All', 'Tractor', 'Harvester', 'Rotavator', 'Sprayer', 'Seed Drill'];

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!bookingMachine) return;
    try {
      await api.post('/machines/book', {
        machine_id: bookingMachine.id,
        booking_date: bookingDate,
        end_date: endDate,
        total_price: bookingMachine.rent
      });

      // Show Popup Notification
      setSuccessData({
        title: "Machinery Booked Successfully! 🎉",
        message: `Your reservation for ${bookingMachine.machine_name} from ${bookingMachine.owner} has been confirmed and synced to your Smart Calendar.`,
        details: {
          item: bookingMachine.machine_name,
          date: `${bookingDate} to ${endDate}`,
          price: bookingMachine.rent
        }
      });

      setBookingMachine(null);
      fetchMachines();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to book machine.');
    }
  };

  const handleCreateMachine = async (e) => {
    e.preventDefault();
    try {
      await api.post('/machines', newMachine);
      setShowAddModal(false);

      // Show Popup Notification for machine creation
      setSuccessData({
        title: "Machine Listed Successfully! 🚜",
        message: `Your ${newMachine.machine_name} is now live on the EcoHub Marketplace for peer farmers to rent.`,
        details: {
          item: newMachine.machine_name,
          date: "Now Available",
          price: newMachine.rent
        }
      });

      setNewMachine({
        owner: '',
        machine_name: '',
        type: 'Tractor',
        location: 'GreenValley Agro Hub',
        rent: 40,
        image_url: '',
        description: ''
      });
      fetchMachines();
    } catch (err) {
      alert('Failed to add machine listing');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Tractor className="h-3.5 w-3.5 text-emerald-400" />
            <span>Peer-to-Peer Equipment Sharing</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white mt-1">Machinery Marketplace</h1>
          <p className="text-xs lg:text-sm text-slate-400">
            Rent nearby tractors, harvesters, rotavators, sprayers, and seed drills at affordable daily rates.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950 flex items-center space-x-2 transform hover:scale-105 transition-all self-start md:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>List Your Machine</span>
        </button>
      </div>

      {/* Interactive Leaflet Map */}
      <div className="glass-panel p-4 rounded-3xl space-y-3 border border-emerald-900/30">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Geospatial Machinery Radar</span>
          <span className="text-xs text-slate-400">{machines.length} Machines Nearby</span>
        </div>
        <MapView items={machines} onSelect={(item) => setBookingMachine(item)} />
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between glass-panel p-4 rounded-2xl border border-emerald-900/30">
        {/* Machine Types Filter */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto scrollbar-none">
          {machineTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                selectedType === type
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-emerald-900/30'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Location Search Input */}
        <div className="relative w-full sm:w-64">
          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-emerald-400" />
          <input
            type="text"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            placeholder="Search location..."
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-emerald-800/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Machinery Listings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {machines.length > 0 ? (
          machines.map((machine) => (
            <BookingCard
              key={machine.id}
              title={machine.machine_name}
              subtitle={`Owner: ${machine.owner}`}
              location={machine.location}
              price={machine.rent}
              priceUnit="/day"
              type={machine.type}
              imageUrl={machine.image_url}
              availability={Boolean(machine.availability)}
              onBook={() => setBookingMachine(machine)}
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-slate-400 text-sm">
            No machinery found matching your search filter.
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {bookingMachine && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl max-w-md w-full border border-emerald-500/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/30">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Reserve Equipment</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{bookingMachine.machine_name}</h3>
              </div>
              <button onClick={() => setBookingMachine(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="space-y-4">
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-emerald-900/30 space-y-1 text-xs">
                <p className="text-slate-300">Owner: <strong className="text-white">{bookingMachine.owner}</strong></p>
                <p className="text-slate-300">Location: <strong className="text-white">{bookingMachine.location}</strong></p>
                <p className="text-emerald-400 font-bold text-sm">Rent: ${bookingMachine.rent} / day</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-emerald-800/40 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-emerald-800/40 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-bold text-xs shadow-lg"
              >
                Confirm Machine Reservation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Machine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl max-w-md w-full border border-emerald-500/40 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-emerald-900/30">
              <h3 className="text-lg font-bold text-white">List Machinery for Rent</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMachine} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Owner Name</label>
                <input
                  type="text"
                  required
                  value={newMachine.owner}
                  onChange={(e) => setNewMachine({ ...newMachine, owner: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-emerald-800/40 rounded-xl text-xs text-white"
                  placeholder="Ramesh Patel"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Machine Name & Model</label>
                <input
                  type="text"
                  required
                  value={newMachine.machine_name}
                  onChange={(e) => setNewMachine({ ...newMachine, machine_name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-emerald-800/40 rounded-xl text-xs text-white"
                  placeholder="Mahindra 575 DI Tractor"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Machine Type</label>
                  <select
                    value={newMachine.type}
                    onChange={(e) => setNewMachine({ ...newMachine, type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-emerald-800/40 rounded-xl text-xs text-white"
                  >
                    <option value="Tractor">Tractor</option>
                    <option value="Harvester">Harvester</option>
                    <option value="Rotavator">Rotavator</option>
                    <option value="Sprayer">Sprayer</option>
                    <option value="Seed Drill">Seed Drill</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Rent ($/day)</label>
                  <input
                    type="number"
                    required
                    value={newMachine.rent}
                    onChange={(e) => setNewMachine({ ...newMachine, rent: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-emerald-800/40 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={newMachine.location}
                  onChange={(e) => setNewMachine({ ...newMachine, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-emerald-800/40 rounded-xl text-xs text-white"
                  placeholder="GreenValley Agro Hub"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs shadow-lg"
              >
                Publish Machinery Listing
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
