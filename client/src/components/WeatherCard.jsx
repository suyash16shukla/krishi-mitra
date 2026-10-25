import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Wind, Droplets, RefreshCw, CloudRain, Navigation, AlertCircle, Compass } from 'lucide-react';
import { weatherAPI } from '../utils/api';
import { weatherEmoji } from '../utils/helpers';
import { getTranslation } from '../utils/translations';

const POPULAR_LOCATIONS = [
  { name: 'Lucknow, UP', city: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462 },
  { name: 'Bhopal, MP', city: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126 },
  { name: 'Indore, MP', city: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577 },
  { name: 'Patna, Bihar', city: 'Patna', state: 'Bihar', lat: 25.5941, lon: 85.1376 },
  { name: 'Ranchi, Jharkhand', city: 'Ranchi', state: 'Jharkhand', lat: 23.3441, lon: 85.3096 },
  { name: 'Varanasi, UP', city: 'Varanasi', state: 'Uttar Pradesh', lat: 25.3176, lon: 82.9739 },
  { name: 'Kanpur, UP', city: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lon: 80.3319 },
  { name: 'Ludhiana, Punjab', city: 'Ludhiana', state: 'Punjab', lat: 30.9010, lon: 75.8573 },
  { name: 'Karnal, Haryana', city: 'Karnal', state: 'Haryana', lat: 29.6857, lon: 76.9905 },
  { name: 'Jaipur, Rajasthan', city: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873 },
  { name: 'Pune, Maharashtra', city: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567 },
  { name: 'Hyderabad, Telangana', city: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867 },
  { name: 'Delhi NCR', city: 'Delhi', state: 'Delhi', lat: 28.6139, lon: 77.2090 },
];

function WeatherIcon({ code, size = 'large' }) {
  const emoji = weatherEmoji(code);
  return (
    <span className={size === 'large' ? 'text-6xl drop-shadow' : 'text-2xl'} role="img" aria-label="weather">
      {emoji}
    </span>
  );
}

function ForecastDay({ day }) {
  return (
    <div className="flex flex-col items-center gap-1.5 bg-white/70 backdrop-blur-sm rounded-2xl p-3 min-w-[76px] border border-emerald-100 shadow-2xs">
      <p className="text-[11px] text-gray-500 font-semibold">
        {new Date(day.date).toLocaleDateString('en-IN', { weekday: 'short' })}
      </p>
      <WeatherIcon code={day.weatherCode} size="small" />
      <div className="flex items-center gap-1">
        <span className="text-xs font-bold text-gray-800">{day.maxTemp}°</span>
        <span className="text-[10px] text-gray-400">{day.minTemp}°</span>
      </div>
      {day.rainProbability > 0 ? (
        <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
          <CloudRain size={9} /> {day.rainProbability}%
        </span>
      ) : day.precipitation > 0 ? (
        <span className="text-[9px] font-bold text-blue-600">
          {day.precipitation}mm
        </span>
      ) : (
        <span className="text-[9px] text-emerald-600">Dry</span>
      )}
    </div>
  );
}

export default function WeatherCard({
  onLocationChange = null,
  onLocationDetected = null,
  selectedLocation: propSelectedLocation = null,
  language = 'hinglish'
}) {
  const t = getTranslation(language).weather;

  const [selectedLocation, setSelectedLocation] = useState(
    propSelectedLocation || 'Lucknow, UP'
  );
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [isUsingGPS, setIsUsingGPS] = useState(false);
  const [currentCoords, setCurrentCoords] = useState({ lat: 26.8467, lon: 80.9462, name: propSelectedLocation || 'Lucknow, UP' });
  const [lastUpdated, setLastUpdated] = useState(null);

  // Sync external selectedLocation prop if provided
  useEffect(() => {
    if (propSelectedLocation && propSelectedLocation !== selectedLocation) {
      setSelectedLocation(propSelectedLocation);
      const match = POPULAR_LOCATIONS.find(l => l.name === propSelectedLocation);
      if (match) {
        setCurrentCoords({ lat: match.lat, lon: match.lon, name: match.name });
      }
    }
  }, [propSelectedLocation]);

  // Fetch weather using coordinates
  const fetchWeatherForCoords = useCallback(async (lat, lon, label = '') => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await weatherAPI.get(lat, lon, label);
      if (data && label) {
        data.location = label;
      }
      setWeather(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.warn('Weather fetch warning, relying on resilient API:', err.message);
      // Fallback
      setWeather({
        location: label || 'Farm Coordinates',
        isLive: false,
        current: {
          temperature: 29,
          feelsLike: 31,
          humidity: 55,
          windSpeed: 10,
          precipitation: 0,
          condition: 'Clear Sky',
          weatherCode: 1,
        },
        forecast: [
          { date: new Date().toISOString(), maxTemp: 31, minTemp: 21, precipitation: 0, rainProbability: 10, weatherCode: 1, condition: 'Clear Sky' },
          { date: new Date(Date.now() + 86400000).toISOString(), maxTemp: 32, minTemp: 22, precipitation: 0, rainProbability: 5, weatherCode: 0, condition: 'Clear Sky' },
          { date: new Date(Date.now() + 172800000).toISOString(), maxTemp: 30, minTemp: 20, precipitation: 1, rainProbability: 35, weatherCode: 2, condition: 'Partly Cloudy' },
        ]
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Detect GPS Location using HTML5 Geolocation API with high accuracy
  const detectGPSLocation = useCallback((showAlertOnError = false) => {
    if (!navigator.geolocation) {
      const msg = 'Geolocation is not supported by your browser. Please select district manually.';
      setError(msg);
      if (showAlertOnError) alert(msg);
      return;
    }

    setDetectingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log("GPS coordinates received:", latitude, longitude);

        try {
          // Fetch city via Open-Meteo reverse geocoding or BigDataCloud
          const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
          const data = await res.json();

          const detectedCity = data.city || data.locality || data.principalSubdivision || "Bhopal";
          const detectedState = data.principalSubdivision || "MP";
          const locationString = `${detectedCity}, ${detectedState}`;

          // Immediately set the state and trigger weather + soil update
          setSelectedLocation(locationString);
          setCurrentCoords({ lat: latitude, lon: longitude, name: locationString });
          setIsUsingGPS(true);
          setDetectingLocation(false);

          fetchWeatherForCoords(latitude, longitude, locationString);

          const locPayload = {
            city: detectedCity,
            district: detectedCity,
            state: detectedState,
            lat: latitude,
            lon: longitude,
            latitude,
            longitude,
            locationName: locationString,
            isGPS: true,
          };

          if (onLocationChange) onLocationChange(locPayload);
          if (onLocationDetected) onLocationDetected(locPayload);
        } catch (err) {
          console.error("Reverse geocoding failed, using coordinates directly:", err);
          const fallbackString = `Farm (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`;
          setSelectedLocation(fallbackString);
          setCurrentCoords({ lat: latitude, lon: longitude, name: fallbackString });
          setIsUsingGPS(true);
          setDetectingLocation(false);

          fetchWeatherForCoords(latitude, longitude, fallbackString);

          const locPayload = {
            city: 'Bhopal',
            district: 'Bhopal',
            state: 'MP',
            lat: latitude,
            lon: longitude,
            latitude,
            longitude,
            locationName: fallbackString,
            isGPS: true,
          };

          if (onLocationChange) onLocationChange(locPayload);
          if (onLocationDetected) onLocationDetected(locPayload);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setDetectingLocation(false);
        setError('GPS permission denied or unavailable. Please select your location manually.');
        if (showAlertOnError) {
          alert("GPS detection error: " + error.message);
        }
        // Fallback to initial coords
        fetchWeatherForCoords(currentCoords.lat, currentCoords.lon, currentCoords.name);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [fetchWeatherForCoords, currentCoords, onLocationChange, onLocationDetected]);

  // Initial load: Attempt HTML5 GPS auto-detection with high accuracy
  useEffect(() => {
    detectGPSLocation(false);
  }, []);

  const handleDetectGPS = () => {
    detectGPSLocation(true);
  };

  const handleSelectLocation = (e) => {
    const locName = e.target.value;
    const loc = POPULAR_LOCATIONS.find(l => l.name === locName);
    if (loc) {
      setSelectedLocation(loc.name);
      setCurrentCoords({ lat: loc.lat, lon: loc.lon, name: loc.name });
      setIsUsingGPS(false);
      fetchWeatherForCoords(loc.lat, loc.lon, loc.name);

      const locPayload = {
        city: loc.city,
        district: loc.city,
        state: loc.state,
        lat: loc.lat,
        lon: loc.lon,
        latitude: loc.lat,
        longitude: loc.lon,
        locationName: loc.name,
        isGPS: false,
      };

      if (onLocationChange) onLocationChange(locPayload);
      if (onLocationDetected) onLocationDetected(locPayload);
    }
  };

  if (loading && !weather) {
    return (
      <div className="card p-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="h-20 bg-gray-200 rounded-2xl mb-4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    );
  }

  return (
    <div className="card overflow-hidden shadow-sm">
      {/* Top Banner Gradient */}
      <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-5 md:p-6 text-white relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          {/* Location Badge & Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-xl text-xs font-semibold">
              <MapPin size={13} className="text-emerald-200 flex-shrink-0" />
              <span className="max-w-[200px] truncate">{selectedLocation || weather?.location || currentCoords.name}</span>
              {isUsingGPS && (
                <span className="badge bg-emerald-400 text-emerald-950 text-[9px] font-bold px-1.5 py-0.2">
                  GPS
                </span>
              )}
            </div>

            {/* Quick dropdown for hubs */}
            <select
              value={selectedLocation}
              onChange={handleSelectLocation}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
            >
              <option value="" disabled className="text-gray-900">Change Agri Hub</option>
              {!POPULAR_LOCATIONS.some(l => l.name === selectedLocation) && (
                <option value={selectedLocation} className="text-gray-900">
                  📍 {selectedLocation}
                </option>
              )}
              {POPULAR_LOCATIONS.map(loc => (
                <option key={loc.name} value={loc.name} className="text-gray-900">
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons: GPS Detect & Refresh */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDetectGPS}
              disabled={detectingLocation}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-75"
              title="Detect my current farm GPS location"
            >
              <Navigation size={12} className={detectingLocation ? 'animate-spin' : ''} />
              <span>{detectingLocation ? t.detecting : t.detectLocation}</span>
            </button>

            <button
              onClick={() => fetchWeatherForCoords(currentCoords.lat, currentCoords.lon, currentCoords.name)}
              className="p-1.5 bg-white/15 hover:bg-white/25 rounded-xl transition-colors text-white"
              title="Refresh live weather"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Temperature & Main Stats */}
        <div className="flex items-center justify-between mt-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-5xl md:text-6xl font-extrabold tracking-tight">
                {weather?.current?.temperature ?? 28}
              </span>
              <span className="text-2xl font-medium text-emerald-100">°C</span>
            </div>
            <p className="text-emerald-100 font-semibold text-sm mt-1">
              {weather?.current?.condition || 'Clear Sky'}
            </p>
            <p className="text-emerald-200/90 text-xs">
              {t.feelsLike} {weather?.current?.feelsLike ?? 30}°C
            </p>
          </div>

          <WeatherIcon code={weather?.current?.weatherCode ?? 1} size="large" />
        </div>

        {/* Telemetry Row */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-white/20">
          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-sm">
            <div className="flex items-center gap-1 text-emerald-200 text-xs mb-0.5">
              <Droplets size={12} />
              <span>{t.humidity}</span>
            </div>
            <p className="text-sm font-bold text-white">{weather?.current?.humidity ?? 55}%</p>
          </div>

          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-sm">
            <div className="flex items-center gap-1 text-emerald-200 text-xs mb-0.5">
              <Wind size={12} />
              <span>{t.windSpeed}</span>
            </div>
            <p className="text-sm font-bold text-white">{weather?.current?.windSpeed ?? 12} km/h</p>
          </div>

          <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-sm">
            <div className="flex items-center gap-1 text-emerald-200 text-xs mb-0.5">
              <CloudRain size={12} />
              <span>{t.rainChance}</span>
            </div>
            <p className="text-sm font-bold text-white">
              {weather?.forecast?.[0]?.rainProbability ?? (weather?.current?.precipitation > 0 ? 80 : 5)}%
            </p>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast Carousel / Grid */}
      <div className="p-4 md:p-5 bg-white">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            {t.forecast7Days}
          </p>
          {lastUpdated && (
            <p className="text-[10px] text-gray-400">
              Updated {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {weather?.forecast?.map((day, i) => (
            <ForecastDay key={i} day={day} />
          ))}
        </div>
      </div>
    </div>
  );
}
