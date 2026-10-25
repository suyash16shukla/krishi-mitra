require('dotenv').config();
const mongoose = require('mongoose');
const GovtScheme = require('./models/GovtScheme');

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/krishimitra';

const essentialSchemes = [
  {
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    nameHindi: 'प्रधानमंत्री किसान सम्मान निधि योजना',
    category: 'central',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    launchYear: 2019,
    benefitAmount: '₹6,000 per year (3 installments of ₹2,000 directly via DBT)',
    eligibility: [
      'All landholding farmer families having cultivable land in their names',
      'Valid Aadhaar card linked with active bank account and NPCI DBT enabled',
      'Mandatory e-KYC completed on PM-Kisan portal or CSC center',
      'Updated land revenue records (Khatauni / Bhu-Naksha verification)',
    ],
    documents: [
      'Aadhaar Card',
      'Bank Account Passbook (Aadhaar Seeded)',
      'Land Ownership Document (Khatauni / Patta / Ror)',
      'Active Mobile Number linked to Aadhaar',
    ],
    applicationUrl: 'https://pmkisan.gov.in',
    description: 'Central sector scheme providing 100% financial funding from Government of India. Transferred directly to farmers bank accounts in three equal 4-monthly cycles to meet domestic and input needs.',
    descriptionHindi: 'सभी पात्र भूमिधारक किसान परिवारों को कृषि लागत और घरेलू जरूरतों के लिए प्रति वर्ष ₹6,000 की नकद वित्तीय सहायता 3 किस्तों में सीधे बैंक खाते में दी जाती है।',
    targetStates: ['All India'],
    tags: ['income-support', 'central', 'dbt', 'small-farmers', 'pm-kisan'],
    isActive: true,
  },
  {
    name: 'PMFBY (Pradhan Mantri Fasal Bima Yojana)',
    nameHindi: 'प्रधानमंत्री फसल बीमा योजना',
    category: 'insurance',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    launchYear: 2016,
    benefitAmount: '100% sum insured against natural calamities, drought, frost, pests & post-harvest loss',
    eligibility: [
      'All farmers cultivating notified crops in notified areas including sharecroppers and tenant farmers',
      'Extremely low farmer premium: Only 1.5% for Rabi crops, 2.0% for Kharif crops, and 5.0% for horticultural/commercial crops',
      'Remaining actuarial premium (80-90%) is equally subsidized by Central & State Governments',
      'Claims settled for localized perils (hailstorm, landslide, inundation) and post-harvest losses up to 14 days',
    ],
    documents: [
      'Aadhaar Card',
      'Land Revenue Records (Khasra / Khatauni)',
      'Sowing Certificate / Declaration issued by Patwari or Sarpanch',
      'Bank Account Details / Cancelled Cheque',
    ],
    applicationUrl: 'https://pmfby.gov.in',
    description: 'Comprehensive yield index and weather-based crop insurance shielding Indian farmers from devastating financial shocks due to unseasonal rain, dry spells, pests, and frost.',
    descriptionHindi: 'सूखा, बाढ़, ओलावृष्टि, कीट रोग और बेमौसम बारिश से होने वाले नुकसान पर न्यूनतम 1.5% प्रीमियम पर संपूर्ण फसल सुरक्षा और त्वरित मुआवजा भुगतान।',
    targetStates: ['All India'],
    tags: ['insurance', 'pmfby', 'risk-management', 'crop-loss', 'protection'],
    isActive: true,
  },
  {
    name: 'PM-KUSUM (Solar Pump & Farm Solarization)',
    nameHindi: 'प्रधानमंत्री कुसुम सोलर पंप योजना',
    category: 'subsidy',
    ministry: 'Ministry of New and Renewable Energy',
    launchYear: 2019,
    benefitAmount: 'Up to 60% total subsidy (30% Central + 30% State) on 3 HP to 10 HP Solar Pumps',
    eligibility: [
      'Individual farmers, Water User Associations (WUA), Farmer Producer Organizations (FPOs), and Panchayats',
      'Farmer contributes only 10% of total system cost; remaining 30% available as concessional bank loan via NABARD',
      'Available for off-grid standalone pumps and grid-connected agriculture pumps',
      'Farmers can also sell surplus solar electricity back to DISCOM at guaranteed feed-in tariff',
    ],
    documents: [
      'Aadhaar Card & Passport Size Photo',
      'Land Record (Khasra / B-1 copy proving agricultural borewell/source)',
      'Bank Account Passbook',
      'Electricity Utility No-Dues Certificate (NOC)',
    ],
    applicationUrl: 'https://pmkusum.mnre.gov.in',
    description: 'De-dieselizes Indian agriculture by installing standalone solar irrigation pumps (Component-B) and solarizing existing grid-connected tubewells (Component-C), drastically reducing electricity & diesel expenses.',
    descriptionHindi: 'सिंचाई के लिए महंगे डीजल और बिजली बिल से छुटकारा। 3 HP से 10 HP तक सोलर पंप लगाने पर 60% तक भारी सरकारी सब्सिडी और 30% तक आसान बैंक लोन।',
    targetStates: ['All India'],
    tags: ['solar', 'subsidy', 'irrigation', 'pm-kusum', 'green-energy'],
    isActive: true,
  },
  {
    name: 'KCC (Kisan Credit Card) 4% Concessional Interest',
    nameHindi: 'किसान क्रेडिट कार्ड (KCC) 4% ब्याज योजना',
    category: 'loan',
    ministry: 'Ministry of Finance & RBI / NABARD',
    launchYear: 1998,
    benefitAmount: 'Collateral-free crop loan up to ₹1.6 Lakh (up to ₹3 Lakh at 4% effective interest)',
    eligibility: [
      'All owner cultivators, tenant farmers, oral lessees, and sharecroppers',
      'Nominal baseline interest rate of 7%, with 3% prompt repayment incentive bringing effective rate to just 4% per annum',
      'Card validity of 5 years with automatic annual credit review and flexible withdrawal through RuPay ATM card',
      'Includes mandatory in-built crop insurance and personal accident death cover up to ₹50,000',
    ],
    documents: [
      'Aadhaar Card and Voter ID',
      'Land Ownership / Tenant Cultivation Records',
      'Two Passport size photographs',
      'No Dues Certificate / Affidavit from neighboring financial institutions',
    ],
    applicationUrl: 'https://www.nabard.org',
    description: 'Timely institutional credit line for cultivation expenses, seeds, fertilizers, pesticides, harvesting, and post-harvest storage, preventing farmers from falling prey to high-interest moneylenders.',
    descriptionHindi: 'खाद, बीज, कीटनाशक व कृषि खर्चों के लिए ₹3 लाख तक का कार्यशील ऋण समय पर चुकाने पर मात्र 4% रियायती ब्याज दर पर उपलब्ध।',
    targetStates: ['All India'],
    tags: ['kcc', 'loan', 'credit', 'low-interest', 'nabard'],
    isActive: true,
  },
  {
    name: 'Soil Health Card Scheme (Mrida Swasthya Card)',
    nameHindi: 'मृदा स्वास्थ्य कार्ड योजना',
    category: 'central',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    launchYear: 2015,
    benefitAmount: '100% Free laboratory testing of 12 vital soil chemical & micronutrient parameters',
    eligibility: [
      'All farmers cultivating crops across all districts in India',
      'Issued once every 3 years after GPS-coordinated field soil sample collection by Krishi Vigyan Kendra (KVK)',
      'Provides exact dosage guidance for N-P-K, Secondary Nutrients (Sulphur), and Micronutrients (Zinc, Iron, Boron, Copper, Manganese)',
    ],
    documents: [
      'Aadhaar Card',
      'Khata / Khasra Farm Location Coordinates',
      'Farmer Mobile Number',
    ],
    applicationUrl: 'https://soilhealth.dac.gov.in',
    description: 'Diagnostic report card on soil fertility status providing customized fertilizer and bio-fertilizer recommendations to restore declining soil organic carbon and cut wasteful DAP/Urea overdosing.',
    descriptionHindi: 'खेत की मिट्टी के 12 पोषक तत्वों (NPK, जिंक, सल्फर, pH) की मुफ्त सरकारी जांच और संतुलित खाद उपयोग की वैज्ञानिक पर्ची।',
    targetStates: ['All India'],
    tags: ['soil-health', 'npk', 'fertilizer-saving', 'organic-carbon'],
    isActive: true,
  },
  {
    name: 'SMAM (Sub-Mission on Agricultural Mechanization)',
    nameHindi: 'कृषि यंत्रीकरण उप-मिशन (ट्रैक्टर व कृषि उपकरण सब्सिडी)',
    category: 'subsidy',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    launchYear: 2014,
    benefitAmount: '40% to 50% subsidy on Tractors, Rotavators, Happy Seeders, Power Tillers & Drones',
    eligibility: [
      'Small, marginal, SC/ST, and women farmers receive highest subsidy tier of 50%',
      'Other category general farmers receive 40% financial assistance',
      'Custom Hiring Centers (CHC) and Village Farm Machinery Banks eligible for up to 80% project subsidy',
      'Farmer must not have availed machinery subsidy on the same machine within the past 5 years',
    ],
    documents: [
      'Aadhaar Card',
      'Land Revenue Record (Khatauni)',
      'Bank Account Passbook with IFSC',
      'Quotation / Proforma Invoice from authorized farm equipment dealer',
    ],
    applicationUrl: 'https://agrimachinery.nic.in',
    description: 'Promotes farm mechanization for labor-intensive operations. Enables farmers to purchase tractors, happy seeders for zero-stubble burning, laser levellers, and modern spray drones at deeply discounted rates.',
    descriptionHindi: 'ट्रैक्टर, रोटावेटर, कल्टीवेटर, लेजर लैंड लेवलर व कृषि ड्रोन खरीदने पर 40% से 50% तक सरकारी अनुदान।',
    targetStates: ['All India'],
    tags: ['machinery', 'tractor-subsidy', 'mechanization', 'drone'],
    isActive: true,
  },
  {
    name: 'PMKSY - Per Drop More Crop (Micro-Irrigation)',
    nameHindi: 'प्रधानमंत्री कृषि सिंचाई योजना (प्रति बूंद अधिक फसल)',
    category: 'subsidy',
    ministry: 'Ministry of Jal Shakti & Agriculture',
    launchYear: 2015,
    benefitAmount: 'Up to 55% subsidy for Small/Marginal farmers, 45% for other farmers on Drip/Sprinkler systems',
    eligibility: [
      'All farmers having assured irrigation water source (well, tubewell, farm pond, canal lift)',
      'Covers Drip Irrigation, Micro-Sprinkler, Portable Sprinkler, and Raingun sets',
      'Saves up to 40-50% irrigation water while boosting crop yields by 20-30%',
    ],
    documents: [
      'Aadhaar Card',
      'Electricity connection bill or water source affidavit',
      'Land Record (7/12 or Khasra)',
      'Soil & Water testing report (if applicable)',
    ],
    applicationUrl: 'https://pmksy.gov.in',
    description: 'Expands precision micro-irrigation systems to improve on-farm water use efficiency, reduce electricity pumping bills, and enable fertigation directly at root zones.',
    descriptionHindi: 'ड्रिप (टपक) व स्प्रिंकलर (फव्वारा) सिंचाई प्रणाली लगाने पर 55% तक सब्सिडी। 50% पानी की बचत और 30% अधिक पैदावार।',
    targetStates: ['All India'],
    tags: ['drip-irrigation', 'water-saving', 'sprinkler', 'subsidy'],
    isActive: true,
  },
  {
    name: 'MP Mukhyamantri Kisan Kalyan Yojana',
    nameHindi: 'मुख्यमंत्री किसान कल्याण योजना (मध्य प्रदेश)',
    category: 'state',
    ministry: 'Department of Farmer Welfare, Government of Madhya Pradesh',
    launchYear: 2020,
    benefitAmount: '₹6,000 per year additional state top-up (Total ₹12,000/year with PM-KISAN)',
    eligibility: [
      'All farmers of Madhya Pradesh who are registered and verified beneficiaries under PM-KISAN',
      'Landholding situated inside Madhya Pradesh boundaries',
      'Direct credit in two equal installments of ₹3,000 or three installments of ₹2,000 each',
    ],
    documents: [
      'PM-KISAN Registration ID',
      'Samagra ID (MP Family ID)',
      'Aadhaar Card & MP Bhu-Abhilekh Khasra',
      'Aadhaar Seeded Bank Account',
    ],
    applicationUrl: 'https://saara.mp.gov.in',
    description: 'Flagship Madhya Pradesh state farmer welfare scheme providing supplementary financial cash benefit on top of PM-KISAN to strengthen rural farm liquidity.',
    descriptionHindi: 'मध्य प्रदेश सरकार द्वारा पीएम-किसान के पात्र किसानों को ₹6,000 वार्षिक अतिरिक्त सहायता। दोनों योजनाएं मिलाकर कुल ₹12,000 प्रति वर्ष।',
    targetStates: ['Madhya Pradesh'],
    tags: ['mp-state', 'kisan-kalyan', 'direct-benefit', 'samagra'],
    isActive: true,
  },
  {
    name: 'UP Krishi Upkaran & Solar Pump Subsidy Scheme',
    nameHindi: 'उत्तर प्रदेश पारदर्शी किसान सेवा योजना (सोलर पंप अनुदान)',
    category: 'state',
    ministry: 'Department of Agriculture, Government of Uttar Pradesh',
    launchYear: 2021,
    benefitAmount: 'Up to 60% grant on Solar Pumps & Certified High-Yield Seeds',
    eligibility: [
      'Resident farmers of Uttar Pradesh registered on upagriculture.com portal',
      'Token booking conducted online through First-Come-First-Served basis with transparent lottery mechanism',
      'Token money deposit refundable upon verification of installation',
    ],
    documents: [
      'UP Agriculture Registration Number (Pardarshi Kisan ID)',
      'Aadhaar Card & Bank Passbook',
      'Khatoni of agricultural field',
    ],
    applicationUrl: 'https://upagriculture.com',
    description: 'State government initiative for promotion of solar pumps, certified wheat/paddy seed mini-kits, bio-fertilizers, and farm power machinery across UP districts.',
    descriptionHindi: 'उत्तर प्रदेश के पंजीकृत किसानों को सोलर पंप, प्रमाणित बीज और आधुनिक कृषि यंत्रों पर 60% तक ऑनलाइन डायरेक्ट सब्सिडी।',
    targetStates: ['Uttar Pradesh'],
    tags: ['up-state', 'solar-pump', 'pardarshi-kisan', 'up-agriculture'],
    isActive: true,
  },
  {
    name: 'Birsa Harit Gram & Krishi Rin Mafi Yojana (Jharkhand)',
    nameHindi: 'बिरसा हरित ग्राम एवं कृषि ऋण माफी योजना (झारखंड)',
    category: 'state',
    ministry: 'Department of Agriculture, Government of Jharkhand',
    launchYear: 2021,
    benefitAmount: 'Farm loan waiver up to ₹50,000 + 100% sapling support for mango/guava orchards',
    eligibility: [
      'Small and marginal farmers of Jharkhand holding short-term crop loans through KCC',
      'Only ₹1 token fee required for loan relief processing',
      'Horticulture orchard scheme (Birsa Harit Gram) utilizes barren upland (Tand land) for profitable fruit cultivation under MGNREGA',
    ],
    documents: [
      'Aadhaar Card and Ration Card',
      'KCC Loan Account Passbook',
      'Jharkhand Land Revenue Receipt (LPC)',
    ],
    applicationUrl: 'https://jkrmy.jharkhand.gov.in',
    description: 'Alleviates farm indebtedness for debt-stressed Jharkhand farmers up to ₹50,000 and transforms rainfed fallow uplands into high-income orchards.',
    descriptionHindi: 'झारखंड के छोटे किसानों का ₹50,000 तक का बैंक कृषि ऋण माफ और बंजर भूमि पर फलदार बागवानी लगाने का पूर्ण सरकारी खर्च।',
    targetStates: ['Jharkhand'],
    tags: ['jharkhand-state', 'loan-waiver', 'birsa-harit-gram', 'horticulture'],
    isActive: true,
  },
];

async function seedSchemes() {
  console.log('🌾 Starting Government Schemes Seeding process...');
  console.log(`Connecting to: ${MONGODB_URI.replace(/:([^:@]+)@/, ':****@')}`);

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log('✅ Connected to MongoDB Atlas');

    // Remove existing schemes to avoid duplicate entries
    const deleteResult = await GovtScheme.deleteMany({});
    console.log(`🗑️  Cleared existing schemes collection (${deleteResult.deletedCount} items removed)`);

    // Insert rich authentic schemes
    const inserted = await GovtScheme.insertMany(essentialSchemes);
    console.log(`✨ Successfully seeded ${inserted.length} essential Central & State Government farming schemes!`);

    console.log('\nList of populated schemes:');
    inserted.forEach((s, idx) => {
      console.log(`   ${idx + 1}. [${s.category.toUpperCase()}] ${s.name} (${s.targetStates.join(', ')})`);
    });

    console.log('\n🌱 Schemes collection in MongoDB Atlas is now ready and verified!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed schemes database:', err.message);
    process.exit(1);
  }
}

seedSchemes();
