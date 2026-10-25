import React, { useState, useEffect } from 'react';

const CITIES = [
  { name: 'Bhopal, MP', district: 'Bhopal', state: 'Madhya Pradesh' },
  { name: 'Indore, MP', district: 'Indore', state: 'Madhya Pradesh' },
  { name: 'Lucknow, UP', district: 'Lucknow', state: 'Uttar Pradesh' },
  { name: 'Patna, Bihar', district: 'Patna', state: 'Bihar' },
  { name: 'Ranchi, Jharkhand', district: 'Ranchi', state: 'Jharkhand' }
];

export default function WeatherCard({ onLocationChange }) {
  const [currentCity, setCurrentCity] = useState(CITIES[0]); // Default Bhopal
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Page load hote hi Bhopal ke hisab se soil card notify karein
    if (onLocationChange) {
      onLocationChange(CITIES[0]);
    }
  }, []);

  const handleCityChange = (e) => {
    const selected = CITIES.find(c => c.name === e.target.value) || CITIES[0];
    setCurrentCity(selected);
    if (onLocationChange) onLocationChange(selected);
  };

  const detectGPS = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      alert("Browser me GPS support nahi hai");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Bhopal default set kar dega live coordinates ke sath
        const detected = { name: 'Bhopal, MP', district: 'Bhopal', state: 'Madhya Pradesh' };
        setCurrentCity(detected);
        if (onLocationChange) onLocationChange(detected);
        setLoading(false);
      },
      (err) => {
        alert("GPS nahi mila, aap dropdown se apna district select kar sakte hain.");
        setLoading(false);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="bg-emerald-800 text-white p-6 rounded-2xl shadow-md my-4">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="bg-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">Live Farm</span>
          <select 
            value={currentCity.name} 
            onChange={handleCityChange}
            className="bg-emerald-900 border border-emerald-600 rounded-lg px-3 py-1.5 text-white font-medium focus:outline-none"
          >
            {CITIES.map((c) => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={detectGPS}
          disabled={loading}
          className="bg-white text-emerald-900 hover:bg-emerald-50 px-4 py-1.5 rounded-lg text-sm font-bold transition-all shadow"
        >
          {loading ? "Detecting..." : "📍 Mera Location Pehchano"}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-extrabold">28°C</h2>
          <p className="text-emerald-200 mt-1">Clear Sky • {currentCity.district}</p>
        </div>
        <div className="text-right text-xs text-emerald-200 space-y-1">
          <p>Nami (Humidity): 52%</p>
          <p>Hawa Ki Speed: 11 km/h</p>
        </div>
      </div>
    </div>
  );
}