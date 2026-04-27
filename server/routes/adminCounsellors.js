const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Appointment = require('../models/Appointment');

router.get('/', async (req, res) => {
  try {
    const counsellors = await User.find({ role: 'counsellor' });
    
    const counsellorStats = await Promise.all(
      counsellors.map(async (counsellor) => {
        const appointments = await Appointment.find({ counsellorId: counsellor._id });
        const completed = appointments.filter(a => a.status === 'completed').length;
        const pending = appointments.filter(a => a.status === 'pending').length;
        const confirmed = appointments.filter(a => a.status === 'confirmed').length;
        
        return {
          _id: counsellor._id,
          name: counsellor.name,
          email: counsellor.email,
          totalAppointments: appointments.length,
          completedSessions: completed,
          pendingRequests: pending,
          confirmedSessions: confirmed
        };
      })
    );
    
    res.json(counsellorStats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;