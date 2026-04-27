# MindBridge - Digital Mental Health Platform

A comprehensive digital mental health and psychological support platform for students in higher education institutions.

## Features

- **AI-Powered Support**: MindBot chatbot with Gemini AI for 24/7 mental health support
- **Mood Tracking**: Daily mood logging with streak system and visual analytics
- **Mental Health Assessments**: PHQ-9, GAD-7, PSS-10, ISI, GHQ-12 validated screening tools
- **AI Journal**: Intelligent journaling with sentiment analysis
- **Appointment Booking**: Schedule sessions with qualified counselors
- **Peer Support Forum**: Anonymous community for shared experiences
- **Resource Hub**: Hindi and English mental health resources
- **Wellness Activities**: Breathing exercises, meditation, pomodoro, gratitude journal
- **Admin Analytics**: Campus-wide anonymised mental health trends

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + Recharts
- **Backend**: Express.js + Node.js
- **Database**: MongoDB
- **AI**: Google Gemini API

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Gemini API Key

### Installation

1. **Setup Server**
```bash
cd mindbridge/server
npm install
```

2. **Setup Client**
```bash
cd mindbridge/client
npm install
```

3. **Configure Environment**

Create `mindbridge/server/.env`:
```
MONGODB_URI=mongodb://localhost:27017/mindbridge
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

4. **Seed Database**
```bash
cd mindbridge/server
node seed.js
```

### Running the Application

**Terminal 1 - Start MongoDB** (if using local):
```bash
mongod
```

**Terminal 2 - Start Backend**:
```bash
cd mindbridge/server
npm run dev
```

**Terminal 3 - Start Frontend**:
```bash
cd mindbridge/client
npm run dev
```

Access the application at: http://localhost:5173

## User Roles

- **Student**: Full access to mood tracking, quizzes, journal, chat, appointments, resources, forum, and wellness activities
- **Counsellor**: Manage appointments and view student sessions
- **Admin**: Campus analytics dashboard

## Demo Accounts

After seeding, you can log in with any of these roles:
- Any student email (e.g., priya@student.edu)
- Counsellor email (e.g., anjali@counsellor.edu)
- Admin email: admin@mindbridge.edu

## Crisis Support

If you or someone you know is in crisis, please reach out:

- **iCall**: 9152987821 (Mon-Sat, 8am-10pm)
- **Vandrevala Foundation**: 1860-2662-345 (24/7)
- **NIMHANS**: 1800-599-0019 (24/7)
- **KIRAN (Govt)**: 1800-599-0011 (24/7)

## License

MIT License - Built for SIH 2025 Problem Statement 25092