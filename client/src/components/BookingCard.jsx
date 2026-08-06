import React from 'react';
import { MapPin, DollarSign, Calendar, ShieldCheck, Tag } from 'lucide-react';

export default function BookingCard({ title, subtitle, location, price, priceUnit = '/day', type, imageUrl, availability, onBook, buttonText = 'Book Now' }) {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden glass-panel-hover flex flex-col justify-between group">
      <div>
        <div className="relative h-44 w-full overflow-hidden bg-slate-900">
          <img
            src={imageUrl || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80'}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 right-3">
            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase shadow-lg ${
              availability === false ? 'bg-red-500/80 text-white' : 'bg-emerald-500/90 text-slate-950'
            }`}>
              {availability === false ? 'Booked' : 'Available'}
            </span>
          </div>
          {type && (
            <div className="absolute bottom-3 left-3">
              <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur text-xs font-semibold text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                <Tag className="h-3 w-3" />
                <span>{type}</span>
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}

          <div className="flex items-center space-x-1.5 text-xs text-slate-300 mt-2.5">
            <MapPin className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        </div>
      </div>

      <div className="p-4 pt-0 border-t border-emerald-900/20 mt-2 flex items-center justify-between">
        <div>
          <span className="text-2xl font-black text-white">${price}</span>
          <span className="text-xs text-slate-400 font-medium">{priceUnit}</span>
        </div>

        <button
          onClick={onBook}
          disabled={availability === false}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
            availability === false
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-950/50 hover:scale-105'
          }`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
