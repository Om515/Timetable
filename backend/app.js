const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const timetableRoutes = require('./routes/timetableRoutes');
app.use('/api/timetable', timetableRoutes);

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Timetable API is running'
  });
});

module.exports = app;
