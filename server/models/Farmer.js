const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  mobile: { type: String, trim: true },
  state: { type: String, required: true, trim: true },
  district: { type: String, required: true, trim: true },
  pinCode: { type: String, trim: true, default: '' },
  acreage: { type: Number, min: 0.1 },
  landSizeAcres: { type: Number, min: 0.1 },
  crops: [{ type: String }],
  soilType: { type: String, required: true, trim: true },
  irrigationType: { type: String, default: 'Canal / Borewell' },
  preferredLanguage: { type: String, default: 'hinglish' },
}, { timestamps: true });

// Pre-save hook to ensure mobile/phone and landSizeAcres/acreage consistency
farmerSchema.pre('save', function(next) {
  if (this.mobile && !this.phone) this.phone = this.mobile;
  if (this.phone && !this.mobile) this.mobile = this.phone;
  if (this.landSizeAcres != null && this.acreage == null) this.acreage = this.landSizeAcres;
  if (this.acreage != null && this.landSizeAcres == null) this.landSizeAcres = this.acreage;
  next();
});

module.exports = mongoose.model('Farmer', farmerSchema);
