const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, default: null },
  role: { type: String, enum: ['student', 'counsellor', 'admin'], default: 'student' },
  isActive: { type: Boolean, default: true },
  avatar: { type: String, default: '' },
  // Academic fields (Student)
  program: { type: String, default: '' },
  department: { type: String, default: '' },
  yearOfStudy: { type: String, default: '' },
  section: { type: String, default: '' },
  universityRollNo: { type: String, default: '' },
  // Counsellor specific fields
  specialization: { type: String, default: '' },
  bio: { type: String, default: '' },
  experience: { type: String, default: '' },
  rating: { type: Number, default: 4.5 },
  totalSessions: { type: Number, default: 0 },
  availabilityStatus: { type: String, enum: ['available', 'busy', 'offline'], default: 'available' },
  badges: [{ type: String }],
  points: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

module.exports = mongoose.model('User', userSchema);