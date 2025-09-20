const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

const Incident = require('./models/Incident');
const Dispatch = require('./models/Dispatch');

// Dummy JWT auth middleware (replace with real one for production!)
function authenticateJWT(req, res, next) {
  // Accept all for demo; use JWT verify in production!
  next();
}

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Create HTTP server and socket.io
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { origin: '*' }
});

// Make io available to routes
app.set('io', io);

// Connect to MongoDB (replace with your URI)
mongoose.connect('mongodb://localhost:27017/touristshield', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// --- API Route ---

app.post('/api/v1/bands/sync', authenticateJWT, async (req, res) => {
  try {
    const { deviceId, touristDid, events, bandMetadata } = req.body;
    if (!deviceId || !touristDid || !events) {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Create proof hash for blockchain
    const payload = JSON.stringify({
      deviceId,
      events,
      syncedAt: new Date().toISOString()
    });
    const proofHash = crypto.createHash('sha256').update(payload).digest('hex');

    // Store events as separate IncidentEvent documents (optional)
    // For simplicity, we'll attach events to Incident

    // Determine if this sync has a critical event
    const critical = events.some(
      e => e.type === 'sos' || (e.severity && e.severity > 0.8)
    );

    let incident = null;
    if (critical) {
      incident = await Incident.create({
        touristDid,
        deviceId,
        events,
        status: 'NEW',
        proofHash
      });
      // Emit real-time notification to admins
      io.to('admins').emit('incident:new', incident);
    }

    // Dummy blockchain queue function (replace with actual worker/queue)
    enqueueBlockchainProof({ proofHash, touristDid, incidentId: incident?._id });

    res.json({
      ok: true,
      proofHash,
      incidentCreated: !!critical
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// Dummy blockchain queue - replace with BullMQ/worker setup
function enqueueBlockchainProof({ proofHash, touristDid, incidentId }) {
  // Simulate async blockchain job
  setTimeout(() => {
    console.log(
      `Blockchain job: Write proofHash ${proofHash} for DID ${touristDid}, incident ${incidentId}`
    );
    // In real implementation, call worker and update Incident with tx id
  }, 1000);
}

// Start server
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
