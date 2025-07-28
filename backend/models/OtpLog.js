const mongoose = require('mongoose');

const otpLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, required: true }, 
  timestamp: { type: Date, default: Date.now },
  ip: String,
  status: { type: String, enum: ['sent', 'blocked'], default: 'sent' }
});

module.exports = mongoose.model('OtpLog', otpLogSchema);
