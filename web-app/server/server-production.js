require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { logger } = require('./utils/logger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => logger.success('Connected to MongoDB'))
.catch(err => logger.error('MongoDB connection error:', err));

// API Routes
const videoRoutes = require('./routes/videos');
const routineRoutes = require('./routes/routines');
const logRoutes = require('./routes/logs');
const dashboardRoutes = require('./routes/dashboard');
const scheduleRoutes = require('./routes/schedule');
const segmentRoutes = require('./routes/segments');

app.use('/api/videos', videoRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/segments', segmentRoutes);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/dist')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '2.0' });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  logger.success(`Server is running on port ${PORT}`);
  logger.info('Phase 2 features enabled: AI Analysis, Workout Logging, Dashboard');
});

