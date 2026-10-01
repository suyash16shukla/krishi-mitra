// Weather condition code → emoji map
export const weatherEmoji = (code) => {
  if (code === 0 || code === 1) return '☀️';
  if (code === 2) return '⛅';
  if (code === 3) return '☁️';
  if (code >= 45 && code <= 48) return '🌫️';
  if (code >= 51 && code <= 55) return '🌦️';
  if (code >= 61 && code <= 65) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 82) return '🌩️';
  if (code >= 95) return '⛈️';
  return '🌤️';
};

// Get task icon config based on type
export const taskTypeConfig = {
  irrigation: { icon: '💧', color: 'bg-blue-100 text-blue-700', borderColor: 'border-blue-300', label: 'Pani Dena (सिंचाई)' },
  fertilizer: { icon: '🌿', color: 'bg-green-100 text-green-700', borderColor: 'border-green-300', label: 'Khad Dalna (खाद)' },
  pesticide: { icon: '🛡️', color: 'bg-yellow-100 text-yellow-700', borderColor: 'border-yellow-300', label: 'Keetnashak (दवा)' },
  harvest: { icon: '🌾', color: 'bg-amber-100 text-amber-700', borderColor: 'border-amber-300', label: 'Katai (कटाई)' },
  sowing: { icon: '🌱', color: 'bg-emerald-100 text-emerald-700', borderColor: 'border-emerald-300', label: 'Buwai & Upchar (बुवाई)' },
  monitoring: { icon: '🔍', color: 'bg-purple-100 text-purple-700', borderColor: 'border-purple-300', label: 'Nirikshan (निरीक्षण)' },
};

// Scheme category config
export const schemeCategoryConfig = {
  central: { label: 'Central Govt', color: 'bg-blue-100 text-blue-800', icon: '🏛️' },
  state: { label: 'State Scheme', color: 'bg-purple-100 text-purple-800', icon: '🏢' },
  insurance: { label: 'Insurance', color: 'bg-red-100 text-red-800', icon: '🛡️' },
  loan: { label: 'Loan/Credit', color: 'bg-yellow-100 text-yellow-800', icon: '💰' },
  training: { label: 'Training', color: 'bg-green-100 text-green-800', icon: '📚' },
  subsidy: { label: 'Subsidy', color: 'bg-orange-100 text-orange-800', icon: '🎯' },
};

// Season badge colors
export const seasonColors = {
  Kharif: 'bg-green-100 text-green-800',
  Rabi: 'bg-blue-100 text-blue-800',
  Zaid: 'bg-yellow-100 text-yellow-800',
};

// Indian states list focusing on priority Agri regions
export const indianStates = [
  'Madhya Pradesh', 'Jharkhand', 'Uttar Pradesh', 'Rajasthan', 'Bihar',
  'Punjab', 'Haryana', 'Maharashtra', 'Gujarat', 'Chhattisgarh'
];

// Cascading state districts
export const STATE_DISTRICTS = {
  'Madhya Pradesh': [
    'Bhopal', 'Sehore', 'Raisen', 'Vidisha', 'Hoshangabad (Narmadapuram)',
    'Ujjain', 'Indore', 'Dewas', 'Sagar', 'Jabalpur'
  ],
  'Jharkhand': [
    'Ranchi', 'Hazaribagh', 'Dhanbad', 'Bokaro', 'Ramgarh',
    'Dumka', 'Deoghar', 'East Singhbhum (Jamshedpur)'
  ],
  'Uttar Pradesh': [
    'Varanasi', 'Lucknow', 'Kanpur', 'Prayagraj', 'Gorakhpur',
    'Meerut', 'Agra', 'Aligarh'
  ],
  'Rajasthan': ['Jaipur', 'Kota', 'Alwar', 'Sri Ganganagar'],
  'Bihar': ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur'],
};

// Default soil types per state
export const STATE_DEFAULT_SOILS = {
  'Madhya Pradesh': 'Black Cotton Soil',
  'Jharkhand': 'Red Sandy Soil',
  'Uttar Pradesh': 'Alluvial',
  'Rajasthan': 'Sandy Loam',
  'Bihar': 'Loamy',
};

export const soilTypes = [
  'Black Cotton Soil', 'Alluvial', 'Red Sandy Soil', 'Loamy',
  'Clay Loam', 'Heavy Loam', 'Acidic Loam', 'Sandy Loam'
];

// Format currency
export const formatCurrency = (amount) =>
  `₹${Number(amount).toLocaleString('en-IN')}`;
