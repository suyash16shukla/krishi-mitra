import React, { useState, useEffect } from 'react';
import {
  User, Phone, MapPin, Layers, Sprout, Droplets, CheckCircle,
  Edit3, ShieldCheck, ArrowRight, Award, Compass, FileText, Sparkles, X
} from 'lucide-react';
import { farmerAPI } from '../utils/api';
import { indianStates, soilTypes, formatCurrency } from '../utils/helpers';
import { getTranslation } from '../utils/translations';

const AVAILABLE_CROPS = [
  'Wheat', 'Paddy', 'Mustard', 'Cotton', 'Sugarcane', 'Maize', 'Soybean', 'Chickpea', 'Potato', 'Tomato'
];

export function FarmerModal({ isOpen, onClose, onSave, initialData = null, detectedLocation = null, language = 'hinglish' }) {
  const t = getTranslation(language).farmer;

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    state: 'Uttar Pradesh',
    district: '',
    landSizeAcres: '2.5',
    crops: ['Wheat', 'Mustard'],
    soilType: 'Alluvial',
    irrigationType: 'Tubewell / Borewell',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        mobile: initialData.mobile || initialData.phone || '',
        state: initialData.state || 'Uttar Pradesh',
        district: initialData.district || '',
        landSizeAcres: String(initialData.landSizeAcres || initialData.acreage || '2.5'),
        crops: initialData.crops?.length ? initialData.crops : ['Wheat', 'Mustard'],
        soilType: initialData.soilType || 'Alluvial',
        irrigationType: initialData.irrigationType || 'Tubewell / Borewell',
      });
    } else if (detectedLocation) {
      if (detectedLocation.state) {
        setForm(prev => ({
          ...prev,
          state: detectedLocation.state,
          district: detectedLocation.district || detectedLocation.city || prev.district,
        }));
      }
    }
  }, [initialData, detectedLocation, isOpen]);

  const toggleCrop = (crop) => {
    setForm(prev => {
      const exists = prev.crops.includes(crop);
      if (exists) {
        if (prev.crops.length === 1) return prev; // Keep at least one
        return { ...prev, crops: prev.crops.filter(c => c !== crop) };
      } else {
        return { ...prev, crops: [...prev.crops, crop] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const cleanMobile = form.mobile.trim().replace(/\D/g, '');

    if (!form.name.trim()) {
      setError('Please enter farmer name (किसान का नाम भरें).');
      return;
    }
    if (!cleanMobile || cleanMobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number (10 अंकों का मोबाइल नंबर).');
      return;
    }
    if (!form.district.trim()) {
      setError('Please enter your district name (जिला भरें).');
      return;
    }
    if (!form.landSizeAcres || Number(form.landSizeAcres) <= 0) {
      setError('Please enter valid land acreage (भूमि का आकार एकड़ में).');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        mobile: cleanMobile,
        phone: cleanMobile,
        state: form.state.trim(),
        district: form.district.trim(),
        landSizeAcres: Number(form.landSizeAcres),
        acreage: Number(form.landSizeAcres),
        soilType: form.soilType.trim(),
        crops: form.crops,
        irrigationType: form.irrigationType,
        pinCode: detectedLocation?.pinCode || '',
        preferredLanguage: language,
      };

      // Save directly to MongoDB Atlas via POST /api/farmers/register
      let savedData = payload;
      try {
        const { data } = await farmerAPI.register(payload);
        if (data.data) savedData = data.data;
        if (data.token) {
          localStorage.setItem('krishi_farmer_token', data.token);
        }
        if (data.farmerId) {
          localStorage.setItem('krishi_farmer_id', data.farmerId);
        }
      } catch (err) {
        console.warn('Backend farmer save note, persisting in client session:', err.message);
      }

      // Save profile to localStorage for instant personalized dashboard
      localStorage.setItem('krishi_farmer_profile', JSON.stringify(savedData));
      onSave(savedData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to register farmer profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-xl">
              👨‍🌾
            </div>
            <div>
              <h3 className="font-bold text-base">
                {initialData ? t.editModalTitle : t.modalTitle}
              </h3>
              <p className="text-xs text-emerald-100">Krishi Mitra Farm Registry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {/* Name & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t.fullName} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder={t.namePlaceholder}
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input-field pl-9 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t.phone} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder={t.phonePlaceholder}
                  value={form.mobile}
                  onChange={e => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '') })}
                  className="input-field pl-9 text-sm"
                />
              </div>
            </div>
          </div>

          {/* State & District */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t.state} <span className="text-red-500">*</span>
              </label>
              <select
                value={form.state}
                onChange={e => setForm({ ...form, state: e.target.value })}
                className="input-field text-sm"
              >
                {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t.district} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  required
                  placeholder={t.districtPlaceholder}
                  value={form.district}
                  onChange={e => setForm({ ...form, district: e.target.value })}
                  className="input-field pl-9 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Land Acreage & Soil Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t.acreage} (Acres) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Layers size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  placeholder={t.acreagePlaceholder}
                  value={form.landSizeAcres}
                  onChange={e => setForm({ ...form, landSizeAcres: e.target.value })}
                  className="input-field pl-9 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {t.soilType} <span className="text-red-500">*</span>
              </label>
              <select
                value={form.soilType}
                onChange={e => setForm({ ...form, soilType: e.target.value })}
                className="input-field text-sm"
              >
                {soilTypes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Primary Crops Pills */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              {t.primaryCrops} (Select one or more)
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_CROPS.map(crop => {
                const isSelected = form.crops.includes(crop);
                return (
                  <button
                    type="button"
                    key={crop}
                    onClick={() => toggleCrop(crop)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm border border-emerald-600'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {crop} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Irrigation Source */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {t.irrigationSource}
            </label>
            <select
              value={form.irrigationType}
              onChange={e => setForm({ ...form, irrigationType: e.target.value })}
              className="input-field text-sm"
            >
              <option value="Tubewell / Borewell">Tubewell / Borewell (नलकूप / बोरवेल)</option>
              <option value="Canal (Nahar)">Canal (नहर प्रणाली)</option>
              <option value="Drip / Sprinkler">Drip / Sprinkler (ड्रिप सिंचाई)</option>
              <option value="Rainfed (Barani)">Rainfed / Barani (वर्षा आधारित)</option>
              <option value="Pond / River">Pond / River (तालाब / नदी)</option>
            </select>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm shadow-md"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {t.savingBtn}
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  {t.saveBtn}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FarmerDashboardView({ farmer, onEditProfile, onOpenRegister, onTabChange, language = 'hinglish' }) {
  const t = getTranslation(language).farmer;

  if (!farmer) {
    return (
      <div className="card p-8 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
          👨‍🌾
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{t.notRegistered}</h3>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed max-w-md mx-auto">
          {t.registerPrompt}
        </p>
        <button
          onClick={onOpenRegister}
          className="btn-primary px-6 py-3 inline-flex items-center gap-2 text-sm shadow-md"
        >
          <Sparkles size={16} />
          {t.notRegistered}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Farmer Profile Hero Card */}
      <div className="card p-6 bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-3xl shadow-inner">
              👨‍🌾
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-bold text-white">{farmer.name}</h3>
                <span className="badge bg-emerald-500/80 text-white text-[10px] flex items-center gap-1 border border-white/20">
                  <ShieldCheck size={11} /> {t.badgeRegistered}
                </span>
              </div>
              <p className="text-emerald-200 text-xs mt-1 flex items-center gap-1.5">
                <Phone size={12} /> +91 {farmer.phone}
              </p>
              <p className="text-emerald-100 text-xs mt-0.5 flex items-center gap-1.5">
                <MapPin size={12} /> {farmer.district}, {farmer.state}
              </p>
            </div>
          </div>

          <button
            onClick={onEditProfile}
            className="self-start md:self-auto px-4 py-2 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl text-xs font-semibold text-white transition-all flex items-center gap-1.5"
          >
            <Edit3 size={14} />
            {t.editBtn}
          </button>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/15">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <p className="text-[10px] text-emerald-200 uppercase font-medium">{t.landHolding}</p>
            <p className="text-lg font-bold text-white mt-0.5">{farmer.acreage} {t.acres}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <p className="text-[10px] text-emerald-200 uppercase font-medium">{t.soilHealthSummary}</p>
            <p className="text-base font-bold text-white mt-0.5 truncate">{farmer.soilType}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <p className="text-[10px] text-emerald-200 uppercase font-medium">Irrigation</p>
            <p className="text-xs font-bold text-white mt-1 truncate">{farmer.irrigationType || 'Tubewell'}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
            <p className="text-[10px] text-emerald-200 uppercase font-medium">Category</p>
            <p className="text-xs font-bold text-white mt-1">
              {Number(farmer.acreage) <= 2.5 ? 'Small & Marginal' : Number(farmer.acreage) <= 5 ? 'Semi-Medium' : 'Medium Farmer'}
            </p>
          </div>
        </div>
      </div>

      {/* Registered Crops Row */}
      <div className="card p-5">
        <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Sprout size={16} className="text-emerald-600" />
          {t.registeredCrops}
        </h4>
        <div className="flex flex-wrap gap-2">
          {farmer.crops?.map(crop => (
            <span
              key={crop}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-2xl"
            >
              <span>{crop === 'Wheat' ? '🌾' : crop === 'Paddy' ? '🌱' : crop === 'Mustard' ? '🌻' : '🌿'}</span>
              {crop}
            </span>
          ))}
        </div>
      </div>

      {/* Personalized Precision Farm Advisory */}
      <div className="card p-5">
        <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-amber-500" />
          {t.personalizedAdvisory}
        </h4>
        <div className="space-y-3">
          {farmer.crops?.map((crop, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <span>🌾</span> {crop} Precision Window
                </p>
                <span className="badge bg-amber-200/70 text-amber-800 text-[10px]">Active Stage</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                {crop.toLowerCase() === 'wheat'
                  ? `For your ${farmer.acreage} acres of ${farmer.soilType} soil in ${farmer.district}, perform first irrigation (Crown Root Initiation) at 21-25 days. Broadcast 60 kg/acre Urea evenly after water absorption.`
                  : crop.toLowerCase() === 'mustard'
                  ? `Monitor closely for mustard aphid colonies. In ${farmer.soilType} soil, apply second light irrigation at flowering stage (40-45 days). Spray Imidacloprid 17.8% SL if count exceeds 30 aphids/plant.`
                  : `Ensure proper soil moisture test before applying top-dress fertilizer. Keep field free of broadleaf weeds.`}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Government Welfare Schemes */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <FileText size={16} className="text-blue-600" />
            {t.recommendedSchemes}
          </h4>
          <button
            onClick={() => onTabChange('schemes')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            View All Schemes <ArrowRight size={12} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 flex items-start gap-3">
            <span className="text-2xl">🏛️</span>
            <div>
              <p className="text-xs font-bold text-gray-900">PM-KISAN Samman Nidhi</p>
              <p className="text-[11px] text-gray-600 mt-0.5">Eligible for ₹6,000/year direct bank transfer for your {farmer.acreage} acres holding.</p>
            </div>
          </div>
          <div className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 flex items-start gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <p className="text-xs font-bold text-gray-900">PMFBY Crop Insurance</p>
              <p className="text-[11px] text-gray-600 mt-0.5">Protect your {farmer.crops?.join(', ')} crops at nominal 1.5% - 2% premium.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
