const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  filePath: { type: String, required: true },
  originalName: { type: String, required: true },
  version: { type: Number, default: 1 },
  previousVersionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', default: null }
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);
