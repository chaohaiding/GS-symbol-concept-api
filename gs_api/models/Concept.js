const mongoose = require('mongoose');

const conceptSchema = new mongoose.Schema({
  concpet: { // exmaple: /c/en/xxx
    type: String,
    unique: true
  },
  label: String,
  symbolset: String,
  lang: String,
  isA: Array
}, {
  timestamps: true
});

const Concept = mongoose.model('Concept', conceptSchema);

module.exports = Concept;