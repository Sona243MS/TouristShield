const mongoose = require('mongoose');

const DispatchSchema = new mongoose.Schema({
  incidentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Incident', required: true },
  responderId: { type: String, required: true },
  assignedAt: { type: Date, default: Date.now },
  acceptedAt: { type: Date },
  status: { type: String, enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'TIMED_OUT'], default: 'PENDING' },
  slaDeadline: { type: Date }
});

module.exports = mongoose.model('Dispatch', DispatchSchema);
