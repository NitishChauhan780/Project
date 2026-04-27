const mongoose = require('mongoose');
const User = require('./models/User');
const MoodEntry = require('./models/MoodEntry');
const QuizResult = require('./models/QuizResult');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mindbridge';

const departments = ['Computer Science', 'Computer Application', 'Mechanical', 'Electrical', 'Business', 'Psychology'];
const years = ['1', '2', '3', '4'];
const programs = ['B.Tech', 'MBA', 'B.Sc'];

async function seedData() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    // Clear existing students and their data (optional)
    // await User.deleteMany({ role: 'student' });
    // await MoodEntry.deleteMany({});
    // await QuizResult.deleteMany({});

    console.log('Generating university students...');

    const students = [];
    
    // Create 15 students with different profiles
    for (let i = 1; i <= 15; i++) {
      const dept = departments[i % departments.length];
      const year = years[i % years.length];
      const prog = programs[i % programs.length];
      
      const student = await User.create({
        name: `Student ${i}`,
        email: `student${i}@university.edu`,
        password: 'password123', // hashed automatically by pre-save if implemented, or just plain for this test
        role: 'student',
        program: prog,
        department: dept,
        yearOfStudy: year,
        section: i % 2 === 0 ? 'A' : 'B',
        universityRollNo: `ROLL-${prog.charAt(0)}${year}${i}`
      });
      students.push(student);
    }

    console.log('Generating mood and quiz entries...');

    const now = new Date();

    for (const student of students) {
      // 1. Generate Mood Entries for the last 14 days
      for (let d = 0; d < 14; d++) {
        const date = new Date();
        date.setDate(now.getDate() - d);
        
        // Custom logic: CS Students in Year 3 are stressed (low mood)
        let mood = Math.floor(Math.random() * 3) + 3; // 3-5 range
        if (student.department === 'Computer Science' && student.yearOfStudy === '3') {
          mood = Math.floor(Math.random() * 3) + 1; // 1-3 range
        } else if (student.department === 'Business') {
          mood = 5; // Happy business students
        }

        await MoodEntry.create({
          userId: student._id,
          mood,
          note: mood < 3 ? 'Feeling overwhelmed with assignments' : 'Doing okay',
          date
        });
      }

      // 2. Generate Quiz Results
      const quizTypes = ['PHQ-9', 'GAD-7', 'PSS-10'];
      for (const type of quizTypes) {
        let score = 5;
        let severity = 'minimal';

        if (student.department === 'Computer Science' && student.yearOfStudy === '3') {
          score = 18 + Math.floor(Math.random() * 5);
          severity = 'severe';
        } else if (student.department === 'Mechanical') {
          score = 10;
          severity = 'moderate';
        }

        await QuizResult.create({
          userId: student._id,
          quizType: type,
          score,
          severity,
          answers: [], // empty for seed
          date: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        });
      }
    }

    console.log('Seeding complete!');
    console.log(`Created 15 students with 210 mood entries and 45 quiz results.`);
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedData();
