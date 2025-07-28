const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'lead', 'developer'],
    default: 'developer'
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
