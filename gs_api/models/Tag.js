const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  tag_concept: { // exmaple: /c/en/xxx
    type: String,
    unique: true
  },
  label: String,
  symbolset: String,
  lang: String,
  concepts: Array
}, {
  timestamps: true
});
const Tag = mongoose.model('Tag', tagSchema);
module.exports = Tag;