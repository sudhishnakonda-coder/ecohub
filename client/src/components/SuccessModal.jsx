import React from 'react';
import { CheckCircle2, Sparkles, Calendar, ArrowRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SuccessModal({ isOpen, onClose, title = "Booked Successfully!", message, details }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl max-w-md w-full border border-emerald-500/50 space-y-5 text-center relative overflow-hidden shadow-2xl glow-emerald">
        {/* Glow backdrop */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-900/60"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Animated Checkmark Circle */}
        <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 shadow-xl shadow-emerald-950/80 animate-bounce">
          <CheckCircle2 className="h-12 w-12 stroke-[2.5]" />
        </div>

        <div>
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold uppercase tracking-widest mb-2">
            <Sparkles className="h-3 w-3 text-amber-300 animate-spin-slow" />
            <span>Reservation Confirmed</span>
          </span>
          <h3 className="text-2xl font-extrabold text-white">{title}</h3>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">{message}</p>
        </div>

        {details && (
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-emerald-900/40 text-xs text-slate-300 space-y-1.5 text-left">
            {details.item && <p>Item: <strong className="text-emerald-300 font-bold">{details.item}</strong></p>}
            {details.date && <p>Date: <span className="text-white font-medium">{details.date}</span></p>}
            {details.price && <p>Total Price: <span className="text-emerald-400 font-bold">${details.price}</span></p>}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => {
              onClose();
              navigate('/bookings');
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-950 flex items-center justify-center space-x-2 transition-all transform hover:scale-105"
          >
            <span>View My Bookings</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-900/40 text-slate-300 font-bold text-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
