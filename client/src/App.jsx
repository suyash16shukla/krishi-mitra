import React, { useState, useEffect } from 'react';
import {
  Bell, Globe, TrendingUp, ChevronRight, User, ShieldCheck,
  CheckCircle, Sparkles, Sprout, Layers, ArrowRight, Compass
} from 'lucide-react';
import { MobileNav, DesktopSidebar } from './components/Navigation';
import WeatherCard from './components/WeatherCard';
import SoilCropRecommendationCard from './components/SoilCropRecommendationCard';
import SoilMetricsCard from './components/SoilMetricsCard';
import CropAdvisor from './components/CropAdvisor';
import CropTimeline from './components/CropTimeline';
import GovtSchemes from './components/GovtSchemes';
import ChatBot, { FloatingChatButton } from './components/ChatBot';
import FarmerDashboardView, { FarmerModal } from './components/FarmerProfile';
import { farmerAPI } from './utils/api';
import { getTranslation } from './utils/translations';

// ── Alert Banner ──────────────────────────────────────────────────────────────
function AlertBanner({ language = 'hinglish' }) {
  const [visible, setVisible] = useState(true);
  const t = getTranslation(language).alert;
  if (!visible) return null;

  return (
    <div className="bg-amber-50/90 border border-amber-300/80 rounded-2xl p-4 flex items-start gap-3 shadow-xs animate-fade-in">
      <span className="text-xl flex-shrink-0 mt-0.5">⚠️</span>
      <div className="flex-1">
        <p className="text-xs font-bold text-amber-900">{t.title}</p>
        <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
          {t.text}
        </p>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="text-amber-500 hover:text-amber-700 text-lg leading-none flex-shrink-0 p-1"
        aria-label="Dismiss alert"
      >×</button>
    </div>
  );
}

// ── Home Page ─────────────────────────────────────────────────────────────────
function HomePage({ onTabChange, farmer = null, onOpenRegister, onLocationDetected, onLocationChange, detectedLocation = null, language = 'hinglish' }) {
  const t = getTranslation(language);
  const statsT = t.stats;
  const actionsT = t.quickActions;

  const quickStats = [
    { label: statsT.activeCrops, value: farmer?.crops?.length || '3', unit: statsT.fields, icon: '🌾', color: 'bg-emerald-50 border-emerald-200', textColor: 'text-emerald-700' },
    { label: statsT.pendingTasks, value: '5', unit: statsT.today, icon: '⏰', color: 'bg-orange-50 border-orange-200', textColor: 'text-orange-700' },
    { label: statsT.mspSeason, value: 'Rabi', unit: '2026-27', icon: '💰', color: 'bg-blue-50 border-blue-200', textColor: 'text-blue-700' },
    { label: statsT.schemesActive, value: '8', unit: statsT.available, icon: '📋', color: 'bg-purple-50 border-purple-200', textColor: 'text-purple-700' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <AlertBanner language={language} />

      {/* Farmer Greeting Banner if Registered */}
      {farmer ? (
        <div className="card p-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
              👨‍🌾
            </div>
            <div>
              <p className="text-xs text-emerald-100">Welcome Back,</p>
              <h3 className="text-sm font-bold">{farmer.name}</h3>
              <p className="text-[11px] text-emerald-200">{farmer.acreage || farmer.landSizeAcres} Acres • {farmer.district}, {farmer.state}</p>
            </div>
          </div>
          <button
            onClick={() => onTabChange('kisanDashboard')}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-semibold text-white transition-colors"
          >
            Farm Center →
          </button>
        </div>
      ) : (
        <div className="card p-4 bg-emerald-50/80 border border-emerald-200 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌱</span>
            <div>
              <p className="text-xs font-bold text-emerald-900">{t.farmer.notRegistered}</p>
              <p className="text-[11px] text-emerald-700">Get hyper-localized advisory & subsidy alerts</p>
            </div>
          </div>
          <button
            onClick={onOpenRegister}
            className="btn-primary text-xs py-2 px-3 shadow-xs"
          >
            Register Now
          </button>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickStats.map((stat, i) => (
          <div key={i} className={`card p-4 border ${stat.color} shadow-2xs`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <TrendingUp size={14} className="text-gray-300" />
            </div>
            <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
            <p className="text-[11px] text-gray-600 font-semibold mt-0.5">{stat.label}</p>
            <p className="text-[10px] text-gray-400">{stat.unit}</p>
          </div>
        ))}
      </div>

      {/* Live Weather Card with Real-Time HTML5 High-Accuracy GPS Detection */}
      <WeatherCard
        onLocationChange={onLocationChange || onLocationDetected}
        onLocationDetected={onLocationDetected || onLocationChange}
        selectedLocation={detectedLocation?.locationName || (detectedLocation?.city ? `${detectedLocation.city}, ${detectedLocation.state}` : null)}
        language={language}
      />

      {/* Auto Location-Based Soil & Crop Recommendation Card (Kaggle Calibrated) */}
      <SoilCropRecommendationCard
        detectedLocation={detectedLocation}
        onLocationChange={onLocationChange || onLocationDetected}
        language={language}
      />

      {/* Soil Metrics & Diagnostics */}
      <SoilMetricsCard language={language} />

      {/* Quick Actions List */}
      <div className="card p-5 shadow-2xs">
        <h3 className="section-title mb-4">
          <span>⚡</span> {actionsT.title}
        </h3>
        <div className="space-y-2">
          {[
            { label: actionsT.cropRec, sub: actionsT.cropRecSub, icon: '🌾', tab: 'crops' },
            { label: actionsT.schedule, sub: actionsT.scheduleSub, icon: '📅', tab: 'tasks' },
            { label: actionsT.schemes, sub: actionsT.schemesSub, icon: '📋', tab: 'schemes' },
            { label: actionsT.weather, sub: actionsT.weatherSub, icon: '🌤️', tab: 'weather' },
            { label: actionsT.profile, sub: actionsT.profileSub, icon: '👨‍🌾', tab: 'kisanDashboard' },
          ].map(({ label, sub, icon, tab }) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-emerald-50 hover:border-emerald-200 border border-gray-100 bg-gray-50/50 transition-all text-left group"
            >
              <span className="text-xl p-1 bg-white rounded-xl shadow-2xs">{icon}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-500">{sub}</p>
              </div>
              <ChevronRight size={16} className="text-gray-400 group-hover:text-emerald-600 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Global Language Selector Dropdown ──────────────────────────────────────────
function LanguageSelector({ language, onLanguageChange }) {
  const [open, setOpen] = useState(false);

  const languages = [
    { code: 'english', label: 'English', flag: '🇬🇧' },
    { code: 'hindi', label: 'हिंदी (Hindi)', flag: '🇮🇳' },
    { code: 'hinglish', label: 'Hinglish', flag: '🇮🇳' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold transition-all shadow-2xs"
        aria-label="Change Language"
      >
        <Globe size={14} className="text-emerald-700" />
        <span>{languages.find(l => l.code === language)?.label || 'Language'}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 p-1.5 animate-fade-in">
          {languages.map(l => (
            <button
              key={l.code}
              onClick={() => {
                onLanguageChange(l.code);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-xl font-medium transition-colors ${
                language === l.code
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-gray-700 hover:bg-emerald-50'
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Desktop Header ────────────────────────────────────────────────────────────
function DesktopHeader({ activeTab, language, onLanguageChange, farmer = null, onOpenRegister }) {
  const t = getTranslation(language);
  const headerT = t.header;

  const tabTitles = {
    home: headerT.home,
    crops: headerT.crops,
    weather: headerT.weather,
    tasks: headerT.tasks,
    schemes: headerT.schemes,
    kisanDashboard: headerT.kisanDashboard,
  };

  return (
    <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30 shadow-2xs">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
          {tabTitles[activeTab] || 'Dashboard'}
        </h2>
        <p className="text-xs text-gray-500 mt-0.5">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Global Language Selector */}
        <LanguageSelector language={language} onLanguageChange={onLanguageChange} />

        {/* Season Tag */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          {t.seasonTag}
        </div>

        {/* Farmer Status Pill */}
        {farmer ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700">
            <span className="font-bold text-gray-900">{farmer.name}</span>
            <ShieldCheck size={14} className="text-emerald-600" />
          </div>
        ) : (
          <button
            onClick={onOpenRegister}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
          >
            Register Farm
          </button>
        )}
      </div>
    </header>
  );
}

// ── Mobile Header ─────────────────────────────────────────────────────────────
function MobileHeader({ activeTab, language, onLanguageChange, farmer = null, onOpenRegister }) {
  const t = getTranslation(language);
  const headerT = t.header;

  const tabTitles = {
    home: headerT.home,
    crops: headerT.crops,
    weather: headerT.weather,
    tasks: headerT.tasks,
    schemes: headerT.schemes,
    kisanDashboard: headerT.kisanDashboard,
  };

  return (
    <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-2">
        <span className="text-xl">🌾</span>
        <div>
          <h2 className="text-sm font-bold text-gray-900 leading-tight">
            {tabTitles[activeTab] || 'Krishi Mitra'}
          </h2>
          <p className="text-[10px] text-emerald-600 font-semibold">{t.seasonTag}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <LanguageSelector language={language} onLanguageChange={onLanguageChange} />
        {!farmer && (
          <button
            onClick={onOpenRegister}
            className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl"
          >
            Register
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [chatOpen, setChatOpen] = useState(false);
  const [scheduleViewCrop, setScheduleViewCrop] = useState(null);
  const [farmerModalOpen, setFarmerModalOpen] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState(null);

  // Global Language State (persisted in localStorage)
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('krishi_mitra_lang') || 'hinglish';
  });

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('krishi_mitra_lang', newLang);
  };

  // Farmer Profile State (persisted in localStorage + MongoDB)
  const [farmer, setFarmer] = useState(() => {
    try {
      const saved = localStorage.getItem('krishi_farmer_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Fetch farmer profile from server if not in localStorage
  useEffect(() => {
    if (!farmer) {
      farmerAPI.getProfile()
        .then(({ data }) => {
          if (data.data) {
            setFarmer(data.data);
            localStorage.setItem('krishi_farmer_profile', JSON.stringify(data.data));
          }
        })
        .catch(() => {
          // No profile registered yet
        });
    }
  }, []);

  const handleSaveFarmer = (savedFarmer) => {
    setFarmer(savedFarmer);
  };

  const handleLocationDetected = (locData) => {
    setDetectedLocation(locData);
  };

  const handleScheduleView = (crop) => {
    setScheduleViewCrop(crop);
    setActiveTab('tasks');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomePage
            onTabChange={setActiveTab}
            farmer={farmer}
            onOpenRegister={() => setFarmerModalOpen(true)}
            onLocationDetected={handleLocationDetected}
            onLocationChange={handleLocationDetected}
            detectedLocation={detectedLocation}
            language={language}
          />
        );
      case 'crops':
        return <CropAdvisor onScheduleView={handleScheduleView} language={language} />;
      case 'weather':
        return (
          <div className="space-y-5 animate-fade-in">
            <WeatherCard
              onLocationChange={handleLocationDetected}
              onLocationDetected={handleLocationDetected}
              selectedLocation={detectedLocation?.locationName || (detectedLocation?.city ? `${detectedLocation.city}, ${detectedLocation.state}` : null)}
              language={language}
            />
            <div className="card p-5 shadow-2xs">
              <h3 className="section-title mb-4">🌾 Weather Impact & Preventive Farm Protocol</h3>
              <div className="space-y-3">
                {[
                  { icon: '☀️', label: 'High Temperature (>32°C)', advice: 'Irrigate fields in late evenings to mitigate evapotranspiration stress. Mulch between rows for moisture retention.', color: 'bg-orange-50 border-orange-200' },
                  { icon: '🌧️', label: 'Rain Forecast (>60%)', advice: 'Postpone pesticide spraying and urea broadcasting. Prepare surface drainage channels to prevent waterlogging.', color: 'bg-blue-50 border-blue-200' },
                  { icon: '🌫️', label: 'High Humidity (>85%)', advice: 'Elevated risk for fungal blights and rust. Apply prophylactic Mancozeb (2.5 g/L) before heavy moisture buildup.', color: 'bg-slate-50 border-slate-200' },
                  { icon: '💨', label: 'High Winds (>25 km/h)', advice: 'Cease foliar spraying immediately to avoid chemical drift. Stake tall crops (Sugarcane/Maize).', color: 'bg-purple-50 border-purple-200' },
                ].map(({ icon, label, advice, color }) => (
                  <div key={label} className={`p-4 rounded-2xl border ${color}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xl">{icon}</span>
                      <p className="text-xs font-bold text-gray-900">{label}</p>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed ml-7">{advice}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'tasks':
        return <CropTimeline initialCrop={scheduleViewCrop} language={language} />;
      case 'schemes':
        return <GovtSchemes language={language} />;
      case 'kisanDashboard':
        return (
          <FarmerDashboardView
            farmer={farmer}
            onEditProfile={() => setFarmerModalOpen(true)}
            onOpenRegister={() => setFarmerModalOpen(true)}
            onTabChange={setActiveTab}
            language={language}
          />
        );
      default:
        return (
          <HomePage
            onTabChange={setActiveTab}
            farmer={farmer}
            onOpenRegister={() => setFarmerModalOpen(true)}
            onLocationDetected={handleLocationDetected}
            detectedLocation={detectedLocation}
            language={language}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-cream text-gray-800 antialiased">
      {/* Desktop Sidebar */}
      <DesktopSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onChatOpen={() => setChatOpen(true)}
        farmer={farmer}
        language={language}
      />

      {/* Main App Container */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile Header */}
        <MobileHeader
          activeTab={activeTab}
          language={language}
          onLanguageChange={handleLanguageChange}
          farmer={farmer}
          onOpenRegister={() => setFarmerModalOpen(true)}
        />

        {/* Desktop Sticky Header */}
        <DesktopHeader
          activeTab={activeTab}
          language={language}
          onLanguageChange={handleLanguageChange}
          farmer={farmer}
          onOpenRegister={() => setFarmerModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 px-4 lg:px-8 py-5 pb-28 lg:pb-10 max-w-4xl w-full">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onChatOpen={() => setChatOpen(true)}
        farmer={farmer}
        language={language}
      />

      {/* Floating Krishi Mitra AI Trigger Button */}
      <FloatingChatButton onClick={() => setChatOpen(true)} />

      {/* Multilingual Gemini AI Chatbot Modal */}
      <ChatBot
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        currentLanguage={language}
        onLanguageChange={handleLanguageChange}
      />

      {/* Farmer Sign-Up & Registration Modal */}
      <FarmerModal
        isOpen={farmerModalOpen}
        onClose={() => setFarmerModalOpen(false)}
        onSave={handleSaveFarmer}
        initialData={farmer}
        detectedLocation={detectedLocation}
        language={language}
      />
    </div>
  );
}
