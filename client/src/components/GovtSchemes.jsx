import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, ChevronDown, Filter, BookOpen } from 'lucide-react';
import { schemesAPI } from '../utils/api';
import { schemeCategoryConfig } from '../utils/helpers';
import mockSchemesData from '../data/mockSchemes.json';

function SchemeCard({ scheme }) {
  const [expanded, setExpanded] = useState(false);
  const catConfig = schemeCategoryConfig[scheme.category] || schemeCategoryConfig.central;

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden card-hover">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-xl text-xl flex-shrink-0">
            {catConfig.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-gray-900 leading-tight">{scheme.name}</h4>
            {scheme.nameHindi && (
              <p className="text-xs text-emerald-700 mt-0.5">{scheme.nameHindi}</p>
            )}
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`badge text-[10px] ${catConfig.color}`}>{catConfig.label}</span>
              {scheme.launchYear && (
                <span className="text-[10px] text-gray-400">Since {scheme.launchYear}</span>
              )}
            </div>
          </div>
        </div>

        {/* Benefit highlight */}
        <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg">
          <p className="text-xs font-semibold text-emerald-800">💰 Benefit: {scheme.benefitAmount}</p>
        </div>
      </div>

      {/* Expandable */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50 animate-fade-in">
          <p className="text-xs text-gray-700 leading-relaxed mb-4">{scheme.description}</p>

          {scheme.eligibility?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-700 mb-2">✅ Eligibility:</p>
              <ul className="space-y-1">
                {scheme.eligibility.map((e, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-emerald-500 flex-shrink-0 mt-0.5">•</span> {e}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {scheme.documents?.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-700 mb-2">📄 Documents Required:</p>
              <div className="flex flex-wrap gap-1.5">
                {scheme.documents.map((doc, i) => (
                  <span key={i} className="badge bg-blue-50 text-blue-700 text-[10px]">{doc}</span>
                ))}
              </div>
            </div>
          )}

          {scheme.ministry && (
            <p className="text-[10px] text-gray-400 mb-3">
              <span className="font-medium">Ministry:</span> {scheme.ministry}
            </p>
          )}

          {scheme.applicationUrl && (
            <a
              href={scheme.applicationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-xl transition-colors"
            >
              Apply Now / More Info <ExternalLink size={12} />
            </a>
          )}

          {/* Tags */}
          {scheme.tags?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {scheme.tags.map(tag => (
                <span key={tag} className="badge bg-gray-200 text-gray-600 text-[9px]">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full py-2.5 text-xs text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center justify-center gap-1 border-t border-gray-100"
      >
        {expanded ? 'Show less' : 'View eligibility & apply'}
        <ChevronDown size={12} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
}

const CATEGORY_FILTERS = [
  { value: 'all', label: 'All', icon: '📋' },
  { value: 'central', label: 'Central', icon: '🏛️' },
  { value: 'insurance', label: 'Insurance', icon: '🛡️' },
  { value: 'subsidy', label: 'Subsidy', icon: '🎯' },
  { value: 'loan', label: 'Loan', icon: '💰' },
  { value: 'training', label: 'Training', icon: '📚' },
];

export default function GovtSchemes() {
  const [schemes, setSchemes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const { data } = await schemesAPI.getAll();
        if (data && data.data && data.data.length > 0) {
          setSchemes(data.data);
          setFiltered(data.data);
        } else {
          setSchemes(mockSchemesData);
          setFiltered(mockSchemesData);
        }
      } catch (err) {
        console.warn('Backend schemes request failed/timed out, loading verified offline schemes fallback:', err.message);
        setSchemes(mockSchemesData);
        setFiltered(mockSchemesData);
      } finally {
        setLoading(false);
      }
    };
    fetchSchemes();
  }, []);

  useEffect(() => {
    let result = [...schemes];
    if (category !== 'all') {
      result = result.filter(s => s.category === category);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q) ||
        s.tags?.some(t => t.includes(q))
      );
    }
    setFiltered(result);
  }, [search, category, schemes]);

  return (
    <div className="card">
      <div className="p-5 border-b border-gray-100">
        <h3 className="section-title mb-1">
          <span>📋</span> Government Schemes
        </h3>
        <p className="text-xs text-gray-500">Central & state schemes for farmers and rural youth</p>
      </div>

      {/* Search & Filter */}
      <div className="p-5 pb-3 space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search PM-KISAN, PMFBY, solar pump..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9 text-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORY_FILTERS.map(({ value, label, icon }) => (
            <button
              key={value}
              onClick={() => setCategory(value)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                category === value
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="px-5 mb-3">
        <p className="text-xs text-gray-400">
          Showing {filtered.length} scheme{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Scheme cards */}
      <div className="px-5 pb-5 space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          ))
        ) : error ? (
          <p className="text-red-500 text-sm text-center py-6">{error}</p>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center">
            <BookOpen size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No schemes match your search.</p>
          </div>
        ) : (
          filtered.map(scheme => (
            <SchemeCard key={scheme._id} scheme={scheme} />
          ))
        )}
      </div>
    </div>
  );
}
