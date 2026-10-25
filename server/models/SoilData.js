const mongoose = require('mongoose');

const cropRecommendationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  localName: { type: String },
  suitabilityScore: { type: Number, default: 90 }, // e.g., 95%
  season: { type: String, enum: ['Rabi', 'Kharif', 'Zaid', 'All Season'], default: 'Rabi' },
  expectedYield: { type: String },
  profitability: { type: String },
  waterRequirement: { type: String },
  fertilizerDosage: { type: String },
  keyAdvantages: [{ type: String }],
}, { _id: false });

const soilDataSchema = new mongoose.Schema({
  district: { type: String, required: true, trim: true, index: true },
  state: { type: String, required: true, trim: true, index: true },
  soilType: {
    type: String,
    required: true,
    enum: [
      'Alluvial', 'Black', 'Clay', 'Red', 'Sandy', 'Loamy',
      'Black Cotton Soil', 'Red Sandy Soil', 'Clay Loam',
      'Sandy Loam', 'Laterite', 'Silt Loam', 'Heavy Loam', 'Acidic Loam'
    ],
  },
  ph: {
    min: { type: Number, default: 6.5 },
    max: { type: Number, default: 7.8 },
    avg: { type: Number, default: 7.2 },
    classification: { type: String, default: 'Neutral / Slightly Alkaline' },
  },
  nitrogen: {
    min: { type: Number, default: 180 },
    max: { type: Number, default: 280 },
    avg: { type: Number, default: 220 },
    unit: { type: String, default: 'kg/ha' },
    status: { type: String, default: 'Medium' },
  },
  phosphorus: {
    min: { type: Number, default: 15 },
    max: { type: Number, default: 45 },
    avg: { type: Number, default: 28 },
    unit: { type: String, default: 'kg/ha' },
    status: { type: String, default: 'Medium' },
  },
  potassium: {
    min: { type: Number, default: 140 },
    max: { type: Number, default: 320 },
    avg: { type: Number, default: 210 },
    unit: { type: String, default: 'kg/ha' },
    status: { type: String, default: 'High' },
  },
  organicCarbon: {
    value: { type: Number, default: 0.65 },
    unit: { type: String, default: '%' },
    status: { type: String, default: 'Medium' },
  },
  moisturePercent: {
    avg: { type: Number, default: 35 },
    status: { type: String, default: 'Adequate' },
  },
  recommendedCrops: [cropRecommendationSchema],
  seasonalAdvice: {
    rabi: { type: String },
    kharif: { type: String },
    zaid: { type: String },
  },
  soilHealthTips: [{ type: String }],
}, { timestamps: true });

// Compound index for fast district + state lookup
soilDataSchema.index({ district: 1, state: 1 });

module.exports = mongoose.model('SoilData', soilDataSchema);
