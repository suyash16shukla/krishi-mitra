import React, { useState, useEffect } from 'react';
import {
  MapPin, Sprout, Droplets, CheckCircle, AlertCircle, RefreshCw,
  Compass, ChevronRight, Layers, Sparkles, SlidersHorizontal, Info, ShieldAlert
} from 'lucide-react';
import { soilAPI } from '../utils/api';
import { indianStates, STATE_DISTRICTS } from '../utils/helpers';

export default function SoilCropRecommendationCard({
  detectedLocation = null,
  onLocationChange = null,
  language = 'hinglish',
}) {
  const [district, setDistrict] = useState(detectedLocation?.district || detectedLocation?.city || 'Lucknow');
  const [state, setState] = useState(detectedLocation?.state || 'Uttar Pradesh');
  const [pinCode, setPinCode] = useState(detectedLocation?.pinCode || '');
  const [isManualSelectOpen, setIsManualSelectOpen] = useState(false);
  const [soilData, setSoilData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSeason, setActiveSeason] = useState('rabi');

  // Sync with detected location from HTML5 GPS or dropdown selection
  useEffect(() => {
    if (detectedLocation) {
      const d = detectedLocation.district || detectedLocation.city;
      if (d) setDistrict(d);
      if (detectedLocation.state) {
        const stateMap = {
          'MP': 'Madhya Pradesh',
          'UP': 'Uttar Pradesh',
          'JH': 'Jharkhand',
          'BR': 'Bihar',
          'RJ': 'Rajasthan',
          'PB': 'Punjab',
          'HR': 'Haryana',
          'MH': 'Maharashtra',
          'GJ': 'Gujarat',
          'CG': 'Chhattisgarh',
        };
        const resolvedState = stateMap[detectedLocation.state] || detectedLocation.state;
        setState(resolvedState);
      }
      if (detectedLocation.pinCode) setPinCode(detectedLocation.pinCode);
    }
  }, [detectedLocation]);

  // Query soil recommendation endpoint whenever district or state changes
  useEffect(() => {
    let isMounted = true;
    const fetchSoilRecommendation = async () => {
      setLoading(true);
      try {
        const { data } = await soilAPI.recommend(district, state);
        if (isMounted && data?.data) {
          setSoilData(data.data);
        }
      } catch (err) {
        console.warn('Soil recommendation fetch failed:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSoilRecommendation();
    return () => { isMounted = false; };
  }, [district, state]);

  // Manual fallback selection handler
  const handleManualStateChange = (e) => {
    const newState = e.target.value;
    setState(newState);
    const districtsForState = STATE_DISTRICTS[newState] || [];
    if (districtsForState.length > 0) {
      setDistrict(districtsForState[0]);
      if (onLocationChange) {
        onLocationChange({
          district: districtsForState[0],
          state: newState,
          pinCode: '',
          formatted: `${districtsForState[0]}, ${newState}`,
          isManual: true,
        });
      }
    }
  };

  const handleManualDistrictChange = (e) => {
    const newDistrict = e.target.value;
    setDistrict(newDistrict);
    if (onLocationChange) {
      onLocationChange({
        district: newDistrict,
        state,
        pinCode: '',
        formatted: `${newDistrict}, ${state}`,
        isManual: true,
      });
    }
  };

  const availableDistricts = STATE_DISTRICTS[state] || [district];

  return (
    <div className="card overflow-hidden shadow-sm border border-emerald-100 bg-white">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 p-5 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
              🌍
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-sm md:text-base text-white">
                  Soil & Crop Recommendation
                </h3>
                <span className="badge bg-emerald-400 text-emerald-950 font-bold text-[9px] px-2 py-0.5">
                  Kaggle Calibrated
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5 flex items-center gap-1.5">
                <MapPin size={12} className="text-emerald-300 flex-shrink-0" />
                <span className="font-semibold text-white">{district}, {state}</span>
                {pinCode && (
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-md text-emerald-100">
                    PIN: {pinCode}
                  </span>
                )}
                {detectedLocation?.isGPS && (
                  <span className="text-[9px] bg-emerald-500 text-white font-bold px-1.5 py-0.2 rounded-full">
                    GPS Lock
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Fallback Manual Switch Button */}
          <button
            onClick={() => setIsManualSelectOpen(!isManualSelectOpen)}
            className="self-start sm:self-auto px-3 py-1.5 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-semibold text-white transition-all flex items-center gap-1.5 border border-white/20"
          >
            <SlidersHorizontal size={13} />
            <span>{isManualSelectOpen ? 'Close Dropdown' : 'Manual Location'}</span>
          </button>
        </div>

        {/* Expandable Manual State / District Dropdown */}
        {isManualSelectOpen && (
          <div className="mt-4 p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 animate-fade-in">
            <p className="text-xs font-semibold text-emerald-100 mb-2">
              Select your exact State and District (Fallback when GPS is off/denied):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-emerald-200 uppercase font-semibold block mb-1">State</label>
                <select
                  value={state}
                  onChange={handleManualStateChange}
                  className="w-full bg-white text-gray-900 text-xs rounded-xl px-3 py-2 outline-none border border-emerald-300 font-medium cursor-pointer"
                >
                  {indianStates.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-emerald-200 uppercase font-semibold block mb-1">District</label>
                <select
                  value={district}
                  onChange={handleManualDistrictChange}
                  className="w-full bg-white text-gray-900 text-xs rounded-xl px-3 py-2 outline-none border border-emerald-300 font-medium cursor-pointer"
                >
                  {availableDistricts.map(dt => (
                    <option key={dt} value={dt}>{dt}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="p-5">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-20 bg-gray-100 rounded-2xl" />
            <div className="grid grid-cols-3 gap-3">
              <div className="h-16 bg-gray-100 rounded-xl" />
              <div className="h-16 bg-gray-100 rounded-xl" />
              <div className="h-16 bg-gray-100 rounded-xl" />
            </div>
            <div className="h-32 bg-gray-100 rounded-2xl" />
          </div>
        ) : soilData ? (
          <div className="space-y-5 animate-fade-in">
            {/* Soil Type Banner & Key Health Parameters */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  Predominant Soil Type
                </span>
                <h4 className="text-lg font-extrabold text-emerald-950 mt-0.5">
                  {soilData.soilType}
                </h4>
                <p className="text-xs text-emerald-800 mt-1">
                  pH Range: <strong className="text-emerald-950">{soilData.ph?.avg || '7.2'}</strong> ({soilData.ph?.classification || 'Optimal'}) • Organic Carbon: <strong>{soilData.organicCarbon?.value || '0.62'}%</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="badge bg-emerald-200 text-emerald-900 text-xs font-bold px-3 py-1 rounded-xl">
                  {soilData.moisturePercent?.status || 'Adequate Moisture'}
                </span>
              </div>
            </div>

            {/* N-P-K & Micronutrient Telemetry Cards */}
            <div>
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Layers size={13} className="text-emerald-600" />
                Soil Nutrient Parameters (NPK)
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl text-center">
                  <p className="text-[11px] font-semibold text-green-700">Nitrogen (N)</p>
                  <p className="text-base font-extrabold text-green-950 mt-0.5">
                    {soilData.nitrogen?.avg || 220} <span className="text-[10px] text-green-700 font-normal">kg/ha</span>
                  </p>
                  <span className={`badge text-[9px] mt-1 font-bold ${soilData.nitrogen?.status === 'Low' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-800'}`}>
                    {soilData.nitrogen?.status || 'Medium'}
                  </span>
                </div>

                <div className="p-3 bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl text-center">
                  <p className="text-[11px] font-semibold text-amber-700">Phosphorus (P)</p>
                  <p className="text-base font-extrabold text-amber-950 mt-0.5">
                    {soilData.phosphorus?.avg || 24} <span className="text-[10px] text-amber-700 font-normal">kg/ha</span>
                  </p>
                  <span className={`badge text-[9px] mt-1 font-bold ${soilData.phosphorus?.status === 'Low' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>
                    {soilData.phosphorus?.status || 'Medium'}
                  </span>
                </div>

                <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl text-center">
                  <p className="text-[11px] font-semibold text-blue-700">Potassium (K)</p>
                  <p className="text-base font-extrabold text-blue-950 mt-0.5">
                    {soilData.potassium?.avg || 260} <span className="text-[10px] text-blue-700 font-normal">kg/ha</span>
                  </p>
                  <span className="badge text-[9px] mt-1 font-bold bg-blue-100 text-blue-800">
                    {soilData.potassium?.status || 'High'}
                  </span>
                </div>
              </div>
            </div>

            {/* Recommended Crops from Tabular Dataset */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sprout size={14} className="text-emerald-600" />
                  Recommended Crops for {district} Soil
                </p>
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                  {soilData.recommendedCrops?.length || 0} Crops Suited
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {soilData.recommendedCrops?.map((crop, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-gray-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/20 transition-all shadow-2xs group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h5 className="font-bold text-sm text-gray-900 group-hover:text-emerald-800 transition-colors">
                          {crop.name}
                        </h5>
                        {crop.localName && (
                          <p className="text-xs text-emerald-700 font-medium">{crop.localName}</p>
                        )}
                      </div>
                      <span className="badge bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex-shrink-0">
                        {crop.suitabilityScore}% Match
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-gray-600 my-2">
                      <p>🌾 <strong>Yield:</strong> {crop.expectedYield}</p>
                      <p>💧 <strong>Irrigation:</strong> {crop.waterRequirement}</p>
                      <p>🌿 <strong>Fertilizer:</strong> {crop.fertilizerDosage}</p>
                    </div>

                    {crop.keyAdvantages?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2.5 pt-2 border-t border-gray-100">
                        {crop.keyAdvantages.map((adv, i) => (
                          <span key={i} className="badge bg-gray-100 text-gray-700 text-[10px]">
                            ✓ {adv}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Seasonal Farm Advice Tabs */}
            {soilData.seasonalAdvice && (
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-600" />
                    Seasonal Protocol for {district}
                  </p>
                  <div className="flex gap-1">
                    {['rabi', 'kharif', 'zaid'].map(seasonKey => (
                      <button
                        key={seasonKey}
                        onClick={() => setActiveSeason(seasonKey)}
                        className={`text-[10px] font-bold uppercase px-2 py-1 rounded-lg transition-colors ${
                          activeSeason === seasonKey
                            ? 'bg-amber-600 text-white'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                        }`}
                      >
                        {seasonKey}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-amber-900 leading-relaxed mt-2">
                  {soilData.seasonalAdvice[activeSeason] || soilData.seasonalAdvice.rabi}
                </p>
              </div>
            )}

            {/* Soil Health Restoration Tips */}
            {soilData.soilHealthTips?.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                  <Info size={13} className="text-slate-600" />
                  Soil Health Preservation Tips
                </p>
                <ul className="space-y-1.5">
                  {soilData.soilHealthTips.map((tip, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500 text-xs">
            No soil data found for {district}, {state}. Please choose your district manually.
          </div>
        )}
      </div>
    </div>
  );
}
