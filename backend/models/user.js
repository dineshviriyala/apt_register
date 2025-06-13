const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  flatNumber: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'resident'], default: 'resident' },
  apartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Apartment', required: true }
});

module.exports = mongoose.model('User', userSchema);
