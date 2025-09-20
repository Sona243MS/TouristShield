const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
  touristDid: { type: String, required: true },
  deviceId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  events: [{
    type: { type: String, required: true },
    ts: { type: Date, required: true },
    lat: Number,
    lon: Number,
    meta: mongoose.Schema.Types.Mixed
  }],
  severity: { type: Number, min: 0, max: 1 },
  status: { type: String, enum: ['NEW', 'ACKED', 'DISPATCHED', 'RESOLVED'], default: 'NEW' },
  proofHash: { type: String },
  proofTxId: { type: String }, // optional blockchain tx id
  consent: {
    shareWithPolice: { type: Boolean, default: false },
    shareAnonymously: { type: Boolean, default: false }
  }
});

module.exports = mongoose.model('Incident', IncidentSchema);
