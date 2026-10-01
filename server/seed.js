require('dotenv').config();
const mongoose = require('mongoose');
const Crop = require('./models/Crop');
const CropSchedule = require('./models/CropSchedule');
const GovtScheme = require('./models/GovtScheme');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/krishimitra';

const cropsData = [
  // ─── Madhya Pradesh (Malwa / Bhopal / Sehore / Black Soil) ───────────────────
  {
    name: 'Lok-1 / Sharbati Wheat',
    localName: 'शरबती / लोक-1 गेहूँ',
    season: 'Rabi',
    soilTypes: ['Black Cotton Soil', 'Clay Loam', 'Heavy Loam'],
    states: ['Madhya Pradesh'],
    duration: 115,
    waterRequirement: '3-4 light irrigations (350-450mm)',
    avgYield: '18-22 quintals/acre',
    mspPrice: 2425,
    marketPrice: 2950,
    profitMargin: '30-40%',
    description: 'World-famous MP Sharbati/Lok-1 wheat. Golden lustrous grains with high protein content and premium market price in Bhopal, Sehore & Indore mandis.',
    tags: ['sharbati', 'rabi', 'premium-wheat', 'mp-special'],
  },
  {
    name: 'JG-11 Chana (Desi Gram)',
    localName: 'जेजी-11 चना (Chickpea)',
    season: 'Rabi',
    soilTypes: ['Black Cotton Soil', 'Loamy', 'Clayey'],
    states: ['Madhya Pradesh'],
    duration: 100,
    waterRequirement: '1-2 life-saving irrigations (200-300mm)',
    avgYield: '9-12 quintals/acre',
    mspPrice: 5650,
    marketPrice: 6450,
    profitMargin: '35-48%',
    description: 'High-yielding, wilt-resistant desi chickpea variety developed by JNKVV/ICRISAT. Highly suited for black soils of Malwa & Narmada valley with low irrigation need.',
    tags: ['pulse', 'rabi', 'low-water', 'mp-special'],
  },
  {
    name: 'Pusa Bold Mustard',
    localName: 'पूसा बोल्ड सरसों',
    season: 'Rabi',
    soilTypes: ['Black Cotton Soil', 'Sandy Loam', 'Loamy'],
    states: ['Madhya Pradesh', 'Uttar Pradesh'],
    duration: 110,
    waterRequirement: '2 irrigations (250-350mm)',
    avgYield: '8-10 quintals/acre',
    mspPrice: 5950,
    marketPrice: 6350,
    profitMargin: '32-44%',
    description: 'Bold-seeded mustard variety with high oil recovery (40-42%). Drought-tolerant and responsive to limited irrigation in Central India.',
    tags: ['oilseed', 'rabi', 'high-oil', 'profitable'],
  },
  {
    name: 'Linseed (Alsi - T-397)',
    localName: 'अलसी (T-397)',
    season: 'Rabi',
    soilTypes: ['Black Cotton Soil', 'Clay'],
    states: ['Madhya Pradesh'],
    duration: 115,
    waterRequirement: '1-2 irrigations or rainfed',
    avgYield: '5-7 quintals/acre',
    mspPrice: 5650,
    marketPrice: 6200,
    profitMargin: '28-38%',
    description: 'High Omega-3 industrial and nutritional oilseed. Excellent fit for black soils with residual moisture after Kharif harvest.',
    tags: ['oilseed', 'rabi', 'drought-hardy', 'alsi'],
  },

  // ─── Jharkhand (Chota Nagpur Plateau / Red & Acidic Loam) ────────────────────
  {
    name: 'HQPM-1 Rabi Maize',
    localName: 'संकर रबी मक्का (HQPM-1)',
    season: 'Rabi',
    soilTypes: ['Red Sandy Soil', 'Loamy', 'Well-drained'],
    states: ['Jharkhand'],
    duration: 110,
    waterRequirement: '3-4 irrigations (400-500mm)',
    avgYield: '25-32 quintals/acre',
    mspPrice: 2225,
    marketPrice: 2550,
    profitMargin: '28-38%',
    description: 'Quality Protein Maize (QPM) hybrid. High nutritional value with lysine and tryptophan. Thrives in winter sunshine across Ranchi, Hazaribagh & Ramgarh plateaus.',
    tags: ['cereal', 'rabi', 'high-protein', 'jharkhand-special'],
  },
  {
    name: 'Toria / Yellow Sarson',
    localName: 'तोरिया / पीली सरसों',
    season: 'Rabi',
    soilTypes: ['Red Sandy Soil', 'Loamy', 'Acidic Soil'],
    states: ['Jharkhand'],
    duration: 85,
    waterRequirement: '2 light irrigations (200-250mm)',
    avgYield: '6-8 quintals/acre',
    mspPrice: 5950,
    marketPrice: 6400,
    profitMargin: '30-42%',
    description: 'Short-duration catch crop (85-90 days). Fits perfectly into Jharkhand paddy-fallow lands before third vegetable crops.',
    tags: ['oilseed', 'rabi', 'short-duration', 'catch-crop'],
  },
  {
    name: 'Kufri Pukhraj Potato',
    localName: 'कुफरी पुखराज आलू',
    season: 'Rabi',
    soilTypes: ['Loamy', 'Sandy Loam', 'Red Sandy Soil'],
    states: ['Jharkhand', 'Uttar Pradesh'],
    duration: 75,
    waterRequirement: '5-6 light irrigations (450mm)',
    avgYield: '90-130 quintals/acre',
    mspPrice: 1250,
    marketPrice: 1650,
    profitMargin: '38-52%',
    description: 'Early-maturing high-yielding table potato. Extremely popular cash crop in Ranchi, Hazaribagh & Chota Nagpur valley during October-January.',
    tags: ['vegetable', 'rabi', 'cash-crop', 'high-profit'],
  },
  {
    name: 'Field Pea (Arkel / Azad)',
    localName: 'सब्जी मटर (आर्केल / आजाद)',
    season: 'Rabi',
    soilTypes: ['Loamy', 'Red Sandy Soil', 'Clay Loam'],
    states: ['Jharkhand', 'Uttar Pradesh'],
    duration: 65,
    waterRequirement: '2-3 light irrigations',
    avgYield: '30-42 quintals/acre (green pods)',
    mspPrice: 4200,
    marketPrice: 5200,
    profitMargin: '40-55%',
    description: 'Quick early cash returns from green pods. Enriches soil nitrogen for succeeding summer crops in acidic soils.',
    tags: ['pulse', 'vegetable', 'rabi', 'short-duration'],
  },

  // ─── Uttar Pradesh (Alluvial / Indo-Gangetic Plains) ─────────────────────────
  {
    name: 'HD-2967 / DBW-187 Wheat',
    localName: 'एचडी-2967 / डीबीडब्ल्यू-187 गेहूँ',
    season: 'Rabi',
    soilTypes: ['Alluvial', 'Loamy', 'Clay Loam'],
    states: ['Uttar Pradesh'],
    duration: 125,
    waterRequirement: '4-5 irrigations (450-550mm)',
    avgYield: '20-25 quintals/acre',
    mspPrice: 2425,
    marketPrice: 2650,
    profitMargin: '24-32%',
    description: 'High-tillering, rust-resistant wheat varieties for the fertile alluvial plains of Uttar Pradesh (Varanasi, Lucknow, Kanpur).',
    tags: ['staple', 'rabi', 'high-yield'],
  },
  {
    name: 'Lentil (Masoor - KLS-218)',
    localName: 'मसूर दाल (KLS-218)',
    season: 'Rabi',
    soilTypes: ['Alluvial', 'Loamy', 'Sandy Loam'],
    states: ['Uttar Pradesh', 'Madhya Pradesh'],
    duration: 105,
    waterRequirement: '1-2 light irrigations',
    avgYield: '7-9 quintals/acre',
    mspPrice: 6700,
    marketPrice: 7200,
    profitMargin: '35-46%',
    description: 'High-value pulse with Government MSP of ₹6,700/q. Requires very little irrigation and fetches high mandi returns.',
    tags: ['pulse', 'rabi', 'high-msp', 'masoor'],
  },
];

const cropSchedulesData = [
  {
    cropName: 'Lok-1 / Sharbati Wheat',
    totalDays: 115,
    stages: [
      {
        stageName: 'Germination & Palewa (Day 1-20)',
        stageNameHindi: 'अंकुरण एवं पलेवा',
        startDay: 1,
        endDay: 20,
        color: '#86efac',
        tasks: [
          { day: 1, week: 1, title: 'Seed Treatment (Trichoderma + Bavistin)', titleHindi: 'बीज उपचार (ट्राइकोडर्मा + बाविस्टिन)', description: 'Treat 40 kg seed/acre with Trichoderma viride @ 5g/kg and Bavistin @ 2g/kg to shield against collar rot and flag smut.', type: 'sowing', priority: 'high' },
          { day: 4, week: 1, title: 'Pre-sowing Irrigation (Palewa)', titleHindi: 'बुवाई से पहले पलेवा', description: 'Apply 5 cm uniform palewa irrigation to bring black soil to optimum moist condition (wapsa).', type: 'irrigation', priority: 'high' },
          { day: 8, week: 2, title: 'Basal Dose Fertilizer Application', titleHindi: 'बुवाई पूर्व बेसल खाद', description: 'Apply 1 bag DAP (50kg) + 25kg MOP + 5kg Zinc Sulphate per acre in seed furrow.', type: 'fertilizer', priority: 'high' },
          { day: 18, week: 3, title: 'Germination & Stand Evaluation', titleHindi: 'अंकुरण प्रतिशत जांच', description: 'Verify plant population (>180 plants/sq meter). Fill vacant gaps if any.', type: 'monitoring', priority: 'medium' },
        ]
      },
      {
        stageName: 'Crown Root & Tillering (Day 21-45)',
        stageNameHindi: 'मुकुट जड़ एवं कल्ले फूटना',
        startDay: 21,
        endDay: 45,
        color: '#4ade80',
        tasks: [
          { day: 22, week: 4, title: 'CRI First Critical Irrigation', titleHindi: 'पहली क्रांतिक सिंचाई (CRI स्टेज)', description: 'MOST CRITICAL: Irrigate at Crown Root Initiation (21-25 days). Never delay.', type: 'irrigation', priority: 'high' },
          { day: 25, week: 4, title: 'First Urea Top-Dressing', titleHindi: 'पहली यूरिया टॉप-ड्रेसिंग', description: 'Broadcast 35 kg Urea per acre after first irrigation absorption.', type: 'fertilizer', priority: 'high' },
          { day: 35, week: 5, title: 'Weed Control (Clodinafop/2,4-D)', titleHindi: 'खरपतवार नियंत्रण', description: 'Spray Clodinafop 15% WP @ 160g/acre for narrow weeds or 2,4-D for broad-leaf weeds.', type: 'pesticide', priority: 'medium' },
        ]
      },
      {
        stageName: 'Jointing, Booting & Milk Stage (Day 46-95)',
        stageNameHindi: 'गांठ बनना, बाली व दूधिया अवस्था',
        startDay: 46,
        endDay: 95,
        color: '#22c55e',
        tasks: [
          { day: 50, week: 7, title: 'Second Irrigation (Jointing)', titleHindi: 'दूसरी सिंचाई (गांठ बनने पर)', description: 'Irrigate field to support stem elongation. Broadcast second urea dose (25 kg/acre).', type: 'irrigation', priority: 'high' },
          { day: 70, week: 10, title: 'Third Irrigation (Booting Stage)', titleHindi: 'तीसरी सिंचाई (बाली निकलने से पूर्व)', description: 'Ensure adequate moisture when ear-head emerges inside leaf sheath.', type: 'irrigation', priority: 'high' },
          { day: 85, week: 12, title: 'Foliar Spray 0:52:34 + Micronutrient', titleHindi: 'पर्णीय पोषण छिड़काव', description: 'Spray NPK 0:52:34 @ 1 kg/acre in 150L water to plump up grain weight.', type: 'fertilizer', priority: 'medium' },
        ]
      },
      {
        stageName: 'Maturity & Harvest (Day 96-115)',
        stageNameHindi: 'दाना पकना एवं कटाई',
        startDay: 96,
        endDay: 115,
        color: '#15803d',
        tasks: [
          { day: 100, week: 14, title: 'Stop All Irrigation', titleHindi: 'सिंचाई पूर्णतः बंद करें', description: 'Discontinue irrigation 15 days before harvest for proper grain hardening.', type: 'irrigation', priority: 'medium' },
          { day: 112, week: 16, title: 'Combine / Manual Harvesting', titleHindi: 'कटाई व गहाई', description: 'Harvest when grain moisture drops to 12-14%. Store in clean, moisture-proof sacks.', type: 'harvest', priority: 'high' },
        ]
      }
    ]
  },
  {
    cropName: 'JG-11 Chana (Desi Gram)',
    totalDays: 100,
    stages: [
      {
        stageName: 'Sowing & Stand Establishment',
        stageNameHindi: 'बुवाई व जमाव',
        startDay: 1,
        endDay: 25,
        color: '#fbbf24',
        tasks: [
          { day: 1, week: 1, title: 'Rhizobium Culture & Seed Inoculation', titleHindi: 'राइजोबियम कल्चर से बीज उपचार', description: 'Treat 30 kg seed/acre with Rhizobium + PSB culture (10g/kg) and Trichoderma (5g/kg).', type: 'sowing', priority: 'high' },
          { day: 3, week: 1, title: 'Pre-sowing Palewa in Black Soil', titleHindi: 'पलेवा सिंचाई', description: 'Light irrigation to create optimal moisture at 8-10 cm seeding depth.', type: 'irrigation', priority: 'high' },
          { day: 20, week: 3, title: 'Early Weed Hoeing', titleHindi: 'निराई-गुड़ाई', description: 'One light hand weeding to aerate black soil roots.', type: 'monitoring', priority: 'medium' },
        ]
      },
      {
        stageName: 'Branching & Pre-Flowering',
        stageNameHindi: 'शाखाएं निकलना व फूल पूर्व',
        startDay: 26,
        endDay: 60,
        color: '#f59e0b',
        tasks: [
          { day: 35, week: 5, title: 'Nipping (Top Pinching)', titleHindi: 'खुंटाई (Nipping)', description: 'Pinch apical shoot tips (5-7 cm) to stimulate heavy lateral branching and double the pod count.', type: 'monitoring', priority: 'high' },
          { day: 45, week: 7, title: 'Pre-Flowering Irrigation (Single)', titleHindi: 'फूल आने से पहले सिंचाई', description: 'Light irrigation 4-5 cm. NEVER irrigate during full bloom as it causes flower drop.', type: 'irrigation', priority: 'high' },
          { day: 55, week: 8, title: 'Pod Borer (Helicoverpa) Pheromone Traps', titleHindi: 'इल्ली फेरोमोन ट्रैप', description: 'Install 4-5 Helilure pheromone traps per acre to monitor gram pod borer moth activity.', type: 'pesticide', priority: 'high' },
        ]
      },
      {
        stageName: 'Pod Filling & Harvesting',
        stageNameHindi: 'घेंटी भराव व कटाई',
        startDay: 61,
        endDay: 100,
        color: '#b45309',
        tasks: [
          { day: 70, week: 10, title: 'Pod Borer Spray (Emamectin Benzoate)', titleHindi: 'इल्ली रोकथाम स्प्रे', description: 'If caterpillars visible, spray Emamectin Benzoate 5% SG @ 80g/acre or Chlorantraniliprole @ 60ml/acre.', type: 'pesticide', priority: 'high' },
          { day: 95, week: 14, title: 'Harvesting at Golden Brown Stage', titleHindi: 'कटाई', description: 'Harvest when 90% pods turn golden-brown and seeds rattle inside pods.', type: 'harvest', priority: 'high' },
        ]
      }
    ]
  }
];

const govtSchemesData = [
  {
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    nameHindi: 'प्रधानमंत्री किसान सम्मान निधि',
    category: 'central',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    launchYear: 2019,
    benefitAmount: '₹6,000/year (₹2,000 in 3 installments)',
    eligibility: [
      'All landholding small and marginal farmer families with cultivable land',
      'Valid Aadhaar-linked active bank account with e-KYC completed',
      'Updated land revenue records (Khatauni / Bhu-naksha)',
    ],
    documents: ['Aadhaar Card', 'Bank Passbook (Aadhaar linked)', 'Land Ownership Record', 'Mobile Number'],
    applicationUrl: 'https://pmkisan.gov.in',
    description: 'Direct income support of ₹6,000 per year transferred directly to bank accounts in three equal 4-monthly installments.',
    descriptionHindi: 'सभी पात्र किसान परिवारों को प्रति वर्ष ₹6,000 की प्रत्यक्ष सहायता तीन समान किस्तों में बैंक खाते में।',
    targetStates: ['All India'],
    tags: ['income-support', 'direct-benefit', 'small-farmer'],
  },
  {
    name: 'PMFBY (Pradhan Mantri Fasal Bima Yojana)',
    nameHindi: 'प्रधानमंत्री फसल बीमा योजना',
    category: 'insurance',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    launchYear: 2016,
    benefitAmount: 'Full sum insured coverage for unseasonal rain, frost, hail & pests',
    eligibility: [
      'Farmers cultivating notified Rabi crops (Wheat, Chana, Mustard, Potato)',
      'Subsidized premium: Only 1.5% for Rabi crops, remainder borne by Govt',
      'Coverage from pre-sowing till post-harvest (up to 14 days)',
    ],
    documents: ['Aadhaar Card', 'Land Sowing Certificate / Patwari Report', 'Bank Passbook', 'Khasra / Khatauni'],
    applicationUrl: 'https://pmfby.gov.in',
    description: 'Comprehensive financial safety net against unpreventable natural perils, drought, flood, hailstorm, and pests.',
    descriptionHindi: 'प्राकृतिक आपदाओं, कीटों और बेमौसम बारिश से फसल नुकसान पर न्यूनतम 1.5% प्रीमियम में संपूर्ण बीमा सुरक्षा।',
    targetStates: ['All India'],
    tags: ['insurance', 'crop-protection', 'risk-management'],
  },
  {
    name: 'PM-KUSUM Solar Pump Scheme',
    nameHindi: 'प्रधानमंत्री कुसुम सोलर पंप योजना',
    category: 'subsidy',
    ministry: 'Ministry of New & Renewable Energy',
    launchYear: 2019,
    benefitAmount: 'Up to 60% total subsidy (30% Central + 30% State) on standalone solar pumps',
    eligibility: [
      'Individual farmers, FPOs, and village water committees with agricultural land',
      'Farmer pays only 10% upfront; 30% soft loan available through NABARD',
      'Replaces expensive diesel generator pumping with free solar daylight irrigation',
    ],
    documents: ['Aadhaar Card', 'Land Record (Khasra)', 'Bank Account', 'Electricity No-Dues Certificate'],
    applicationUrl: 'https://pmkusum.mnre.gov.in',
    description: 'Provides standalone DC/AC solar water pumping systems (3 HP to 10 HP) to eliminate diesel pumping costs.',
    descriptionHindi: 'डीजल पंपों से मुक्ति पाने के लिए 3 से 10 HP सोलर पंप स्थापना पर 60% तक भारी सरकारी सब्सिडी।',
    targetStates: ['All India'],
    tags: ['solar', 'subsidy', 'irrigation', 'green-energy'],
  },
  {
    name: 'KCC (Kisan Credit Card) 4% Interest Facility',
    nameHindi: 'किसान क्रेडिट कार्ड (4% ब्याज दर)',
    category: 'loan',
    ministry: 'Ministry of Finance & RBI',
    launchYear: 1998,
    benefitAmount: 'Working capital crop loan up to ₹3 Lakh at effective 4% interest rate',
    eligibility: [
      'All farmers cultivating land, tenant farmers, and sharecroppers',
      'Interest subvention of 3% provided on prompt repayment reducing rate to 4%',
      'Revolving credit limit valid for 5 years with simple annual renewal',
    ],
    documents: ['Aadhaar Card', 'Land Records / Khasra Khatauni', '2 Passport Photos', 'No-Dues from other banks'],
    applicationUrl: 'https://www.nabard.org',
    description: 'Institutional credit facility for purchasing quality certified seeds, fertilizers, pesticides and diesel without falling into private moneylender debt.',
    descriptionHindi: 'फसल लागत (बीज, खाद, कीटनाशक) के लिए ₹3 लाख तक का ऋण मात्र 4% रियायती ब्याज पर।',
    targetStates: ['All India'],
    tags: ['credit', 'low-interest', 'short-term-loan'],
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing crop and schedule data
    await Crop.deleteMany({});
    await CropSchedule.deleteMany({});
    await GovtScheme.deleteMany({});
    console.log('🗑️  Cleared existing crop and scheme collections');

    // Insert authentic regional crops
    const insertedCrops = await Crop.insertMany(cropsData);
    console.log(`🌾 Seeded ${insertedCrops.length} authentic regional crops (MP, Jharkhand, UP)`);

    const cropMap = {};
    insertedCrops.forEach(c => { cropMap[c.name] = c._id; });

    // Link schedules
    const schedulesWithIds = cropSchedulesData.map(s => ({
      ...s,
      cropId: cropMap[s.cropName] || insertedCrops[0]._id,
    }));
    const insertedSchedules = await CropSchedule.insertMany(schedulesWithIds);
    console.log(`📅 Seeded ${insertedSchedules.length} detailed day-wise schedules`);

    // Insert schemes
    const insertedSchemes = await GovtScheme.insertMany(govtSchemesData);
    console.log(`📋 Seeded ${insertedSchemes.length} core farmer welfare schemes`);

    console.log('\n✨ Database seeding completed successfully! Ready for MP & Jharkhand demo.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
