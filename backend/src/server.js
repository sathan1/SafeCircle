require('dotenv').config();
const express = require('express');
const cors = require('cors');
const contactRoutes = require('./routes/contactRoutes');
const journeyRoutes = require('./routes/journeyRoutes');
const authRoutes = require('./routes/authRoutes');
const socketService = require('./services/socketService');

const app = express();
const PORT = process.env.PORT || 5000;

// Core Middleware
app.use(cors());
app.use(express.json());

// Foundation Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SafeCircle backend is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Environment & Config info endpoint for mobile app discovery
app.get('/api/config', (req, res) => {
  res.json({
    success: true,
    appName: 'SafeCircle',
    serverTime: new Date().toISOString(),
    features: {
      webSockets: true,
      emailOtp: Boolean(process.env.EMAIL_PROVIDER_API_KEY || process.env.EMAIL_PROVIDER === 'console'),
      emailProvider: process.env.EMAIL_PROVIDER || 'console'
    }
  });
});

// Primary Routes
app.use('/api/contacts', contactRoutes);
app.use('/api/journeys', journeyRoutes);
app.use('/api/auth', authRoutes);

// Phase 8 Direct Resource Routes
const checkInController = require('./controllers/checkInController');
app.patch('/api/checkins/:id/respond', checkInController.respondToCheckIn);
app.patch('/api/escalations/:id/resolve', checkInController.resolveEscalation);

const os = require('os');

// Start Express Server on 0.0.0.0 to allow physical phones on Wi-Fi to connect
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`  SafeCircle Backend & Real-Time Gateway Online     `);
  console.log(`====================================================`);
  console.log(`[SafeCircle] Localhost: http://localhost:${PORT}`);
  
  // Print available LAN IPv4 addresses for physical phone configuration
  const interfaces = os.networkInterfaces();
  let foundLan = false;
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`[SafeCircle] Wi-Fi / LAN (${name}): http://${iface.address}:${PORT}`);
        foundLan = true;
      }
    }
  }
  if (!foundLan) {
    console.log(`[SafeCircle] LAN IP: Connect to Wi-Fi to reach from physical phones`);
  }
  console.log(`[SafeCircle] WebSocket Gateway: ws://<your-ip>:${PORT}/ws`);
  console.log(`[SafeCircle] Health check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

// Initialize WebSocket Gateway
socketService.initialize(server);

// Optional Database Connection
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (mongoUri) {
  const mongoose = require('mongoose');
  mongoose
    .connect(mongoUri)
    .then(() => console.log('[SafeCircle] Connected to MongoDB'))
    .catch((err) => console.warn('[SafeCircle] MongoDB connection notice:', err.message));
} else {
  console.log('[SafeCircle] Running with persistent embedded file database (safecircle_db.json)');
}

module.exports = { app, server };
