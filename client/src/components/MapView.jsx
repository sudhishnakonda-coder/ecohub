import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix default leaflet marker icon issue in React
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function MapView({ items = [], center = [17.385, 78.4867], zoom = 12, onSelect }) {
  return (
    <div className="h-72 lg:h-96 w-full rounded-2xl overflow-hidden border border-emerald-900/40 shadow-inner relative z-0">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {items.map((item) => {
          const lat = parseFloat(item.lat) || center[0];
          const lng = parseFloat(item.lng) || center[1];
          return (
            <Marker key={item.id} position={[lat, lng]} icon={customIcon}>
              <Popup>
                <div className="p-1 font-sans">
                  <h4 className="font-bold text-slate-900 text-sm">{item.machine_name || item.name}</h4>
                  <p className="text-xs text-slate-600 font-medium">{item.location}</p>
                  <p className="text-xs text-emerald-700 font-bold mt-1">
                    {item.rent ? `$${item.rent}/day` : `$${item.price}/ton-day`}
                  </p>
                  {onSelect && (
                    <button
                      onClick={() => onSelect(item)}
                      className="mt-2 text-xs bg-emerald-600 text-white px-2 py-1 rounded hover:bg-emerald-700 w-full"
                    >
                      Book Now
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
