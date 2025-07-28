const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  deadline: { type: Date, required: true },
  status: {
    type: String,
    enum: ['Active', 'Completed'],
    default: 'Active'
  },
  assignedDevelopers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lead: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
