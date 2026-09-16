require('dotenv').config();
const express = require('express');
const cors = require('cors');
const contactRoutes = require('./routes/contactRoutes');
const journeyRoutes = require('./routes/journeyRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Core Middleware
app.use(cors());
app.use(express.json());

// Foundation Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SafeCircle backend is running'
  });
});

// Primary Routes
app.use('/api/contacts', contactRoutes);
app.use('/api/journeys', journeyRoutes);

// Phase 8 Direct Resource Routes
const checkInController = require('./controllers/checkInController');
app.patch('/api/checkins/:id/respond', checkInController.respondToCheckIn);
app.patch('/api/escalations/:id/resolve', checkInController.resolveEscalation);

// Start Express Server
const server = app.listen(PORT, () => {
  console.log(`[SafeCircle] Server running on http://localhost:${PORT}`);
  console.log(`[SafeCircle] Health check available at http://localhost:${PORT}/api/health`);
  console.log(`[SafeCircle] Contacts API mounted at http://localhost:${PORT}/api/contacts`);
  console.log(`[SafeCircle] Journeys API mounted at http://localhost:${PORT}/api/journeys`);
});

// Optional/Future Database Connection (non-blocking for foundation phase)
if (process.env.MONGO_URI) {
  const mongoose = require('mongoose');
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log('[SafeCircle] Connected to MongoDB'))
    .catch((err) => console.warn('[SafeCircle] MongoDB connection notice:', err.message));
}

module.exports = { app, server };
