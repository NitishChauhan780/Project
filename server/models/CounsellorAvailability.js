const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema({
  counsellorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  daysOfWeek: [{ type: Number, min: 0, max: 6 }],
  timeSlots: [{
    start: { type: String, required: true },
    end: { type: String, required: true },
    maxBookings: { type: Number, default: 1 }
  }],
  timezone: { type: String, default: 'Asia/Kolkata' },
  sessionDuration: { type: Number, default: 60 },
  breakBetweenSessions: { type: Number, default: 15 },
  isActive: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now }
});

availabilitySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

availabilitySchema.methods.isAvailable = function(date, timeSlot) {
  const dayOfWeek = new Date(date).getDay();
  if (!this.daysOfWeek.includes(dayOfWeek)) return false;
  
  const slot = this.timeSlots.find(s => s.start === timeSlot);
  return slot ? true : false;
};

availabilitySchema.statics.getOrCreate = async function(counsellorId) {
  let availability = await this.findOne({ counsellorId });
  if (!availability) {
    availability = await this.create({
      counsellorId,
      daysOfWeek: [1, 2, 3, 4, 5],
      timeSlots: [
        { start: '09:00', end: '10:00' },
        { start: '10:00', end: '11:00' },
        { start: '11:00', end: '12:00' },
        { start: '14:00', end: '15:00' },
        { start: '15:00', end: '16:00' },
        { start: '16:00', end: '17:00' },
        { start: '17:00', end: '18:00' },
        { start: '19:00', end: '20:00' }
      ]
    });
  }
  return availability;
};

module.exports = mongoose.model('CounsellorAvailability', availabilitySchema);