const mongoose = require('mongoose');

const apartmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  apartmentCode: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('Apartment', apartmentSchema);
