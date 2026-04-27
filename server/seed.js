require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const MoodEntry = require('./models/MoodEntry');
const QuizResult = require('./models/QuizResult');
const JournalEntry = require('./models/JournalEntry');
const Appointment = require('./models/Appointment');
const ForumPost = require('./models/ForumPost');
const Resource = require('./models/Resource');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🌿 Connected to MongoDB for seeding...');
    
    await User.deleteMany({});
    await MoodEntry.deleteMany({});
    await QuizResult.deleteMany({});
    await JournalEntry.deleteMany({});
    await Appointment.deleteMany({});
    await ForumPost.deleteMany({});
    await Resource.deleteMany({});
    console.log('🗑️ Cleared existing data');

    const hashedPassword = await bcrypt.hash('password123', 10);
    console.log('🔐 Hashed demo password (password123)');

    const users = await User.create([
      { name: 'Priya Sharma', email: 'priya@student.edu', role: 'student', password: hashedPassword },
      { name: 'Rahul Verma', email: 'rahul@student.edu', role: 'student', password: hashedPassword },
      { name: 'Sneha Patel', email: 'sneha@student.edu', role: 'student', password: hashedPassword },
      { name: 'Arjun Kumar', email: 'arjun@student.edu', role: 'student', password: hashedPassword },
      { 
        name: 'Dr. Anjali Gupta', 
        email: 'anjali@counsellor.edu', 
        role: 'counsellor', 
        password: hashedPassword,
        specialization: 'Anxiety & Depression Specialist',
        bio: 'Dr. Anjali has over 10 years of experience in clinical psychology. She specializes in cognitive behavioral therapy and has helped hundreds of students navigate academic stress and personal challenges.',
        experience: '10+ Years',
        rating: 4.9,
        totalSessions: 450,
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71f15367ef?q=80&w=200&h=200&auto=format&fit=crop'
      },
      { 
        name: 'Dr. Vikram Singh', 
        email: 'vikram@counsellor.edu', 
        role: 'counsellor', 
        password: hashedPassword,
        specialization: 'Relationship & Family Counsellor',
        bio: 'Dr. Vikram focuses on interpersonal relationships and family dynamics. His empathetic approach helps students build stronger connections and resolve conflicts effectively.',
        experience: '8 Years',
        rating: 4.8,
        totalSessions: 320,
        avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&h=200&auto=format&fit=crop'
      },
      { name: 'MindBridge Admin', email: 'admin@mindbridge.edu', role: 'admin', password: hashedPassword }
    ]);
    console.log('✅ Created 7 users (all with password: password123)');

    const students = users.filter(u => u.role === 'student');
    const counsellors = users.filter(u => u.role === 'counsellor');
    const moodReasons = ['academic', 'relationship', 'family', 'health', 'financial', 'career', 'social'];
    
    for (const student of students) {
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const mood = Math.floor(Math.random() * 4) + 2;
        const streak = Math.min(i + 1, 7);
        
        await MoodEntry.create({
          userId: student._id,
          mood,
          reasonTags: [moodReasons[Math.floor(Math.random() * moodReasons.length)]],
          note: mood >= 4 ? 'Feeling better today' : 'Had a tough day',
          date,
          streak
        });
      }
    }
    console.log('✅ Created 120 mood entries');

    const quizTypes = ['PHQ-9', 'GAD-7', 'PSS-10'];
    for (const student of students) {
      for (const quizType of quizTypes) {
        let score, severity;
        if (quizType === 'PHQ-9') {
          score = Math.floor(Math.random() * 15) + 3;
          severity = score <= 4 ? 'minimal' : score <= 9 ? 'mild' : score <= 14 ? 'moderate' : 'severe';
        } else if (quizType === 'GAD-7') {
          score = Math.floor(Math.random() * 12) + 2;
          severity = score <= 4 ? 'minimal' : score <= 9 ? 'mild' : score <= 14 ? 'moderate' : 'severe';
        } else {
          score = Math.floor(Math.random() * 20) + 8;
          severity = score <= 13 ? 'minimal' : score <= 20 ? 'low' : score <= 26 ? 'moderate' : 'high';
        }
        
        const answers = Array(quizType === 'PHQ-9' ? 9 : quizType === 'GAD-7' ? 7 : 10)
          .fill(0).map(() => Math.floor(Math.random() * 4));
        
        await QuizResult.create({
          userId: student._id,
          quizType,
          score,
          severity,
          answers,
          date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        });
      }
    }
    console.log('✅ Created 28 quiz results');

    const journalContents = [
      { content: "Today was challenging. I had three exams back to back and I feel exhausted. I managed to do well in two of them but the third one didn't go as planned. I'm worried about my GPA now.", sentiment: 'negative', sentimentScore: 0.25, emotions: ['anxiety', 'frustration', 'fear'], insight: "I hear you - having multiple exams in one day is incredibly stressful. It sounds like you pushed through some really difficult circumstances. Remember, one exam doesn't define your worth or your academic journey. Consider taking some time to rest and reflect on what worked well in the other exams." },
      { content: "Had a great study session with my friends today. We covered so much material together and actually understood things better as a group. Feeling hopeful about the upcoming tests!", sentiment: 'positive', sentimentScore: 0.85, emotions: ['joy', 'hope', 'gratitude'], insight: "That's wonderful to hear! Collaborative studying can make such a difference, both academically and emotionally. The fact that you're feeling hopeful shows your resilience. Keep nurturing those friendships - they're clearly a great support system for you." },
      { content: "Missed my morning class today. I stayed up late finishing a project and couldn't get out of bed. Now I feel guilty and worried about what I missed. This keeps happening.", sentiment: 'negative', sentimentScore: 0.3, emotions: ['anxiety', 'frustration', 'loneliness'], insight: "I understand that feeling of being caught in a cycle. The guilt you're experiencing is valid, but please be kind to yourself. Many students struggle with sleep and productivity balance. Consider reaching out to your professor about the material you missed, and maybe look into setting a more sustainable routine." },
      { content: "Finally finished my internship application. It took a lot of effort but I submitted everything on time. Hoping for good news!", sentiment: 'positive', sentimentScore: 0.75, emotions: ['hope', 'gratitude', 'anxiety'], insight: "Congratulations on taking this important step! It takes real effort and courage to complete applications. Whether you hear back or not, you should be proud of yourself for putting yourself out there. The process itself builds valuable skills." },
      { content: "Not feeling like myself lately. I have good friends and doing well in classes, but there's this underlying sadness I can't explain. I don't want to worry my parents.", sentiment: 'neutral', sentimentScore: 0.45, emotions: ['sadness', 'loneliness', 'anxiety'], insight: "Thank you for sharing this. Sometimes sadness doesn't have a clear reason, and that's valid. You don't need to have everything 'figured out' to deserve support. If this feeling persists, talking to a counsellor might help you understand yourself better. You're not alone in feeling this way." }
    ];

    for (const student of students) {
      for (let i = 0; i < 3; i++) {
        const journal = journalContents[i % journalContents.length];
        await JournalEntry.create({
          userId: student._id,
          ...journal,
          date: new Date(Date.now() - i * 2 * 24 * 60 * 60 * 1000)
        });
      }
    }
    console.log('✅ Created 20 journal entries');

    const forumPosts = [
      { authorName: 'Anonymous', content: "How do you guys manage exam stress? I feel like I'm always anxious about upcoming tests. Any tips?", upvotes: 24, replies: [
        { authorName: 'Anonymous', content: "Breathing exercises really help me! Try the 4-7-8 technique.", upvotes: 12 },
        { authorName: 'Anonymous', content: "Making a study schedule and taking short breaks helps me stay focused.", upvotes: 8 }
      ]},
      { authorName: 'Anonymous', content: "Is it normal to feel lonely in college even when you're surrounded by people? Sometimes I feel disconnected.", upvotes: 31, replies: [
        { authorName: 'Anonymous', content: "Yes! This is more common than you think. Join some clubs or interest groups to find like-minded people.", upvotes: 15 },
        { authorName: 'Anonymous', content: "I felt the same in my first year. It gets better with time.", upvotes: 9 }
      ]},
      { authorName: 'Anonymous', content: "My family expectations are really high and it's starting to affect my mental health. How do I cope with this?", upvotes: 42, replies: [
        { authorName: 'Anonymous', content: "Communication is key. Try talking to your family about how you feel.", upvotes: 18 },
        { authorName: 'Anonymous', content: "Focus on your own progress, not comparing with others.", upvotes: 11 }
      ]},
      { authorName: 'Anonymous', content: "Just wanted to share - I started therapy and it's been really helpful. There's no shame in seeking help!", upvotes: 56, replies: [
        { authorName: 'Anonymous', content: "Thank you for sharing this! It gives me courage to try it too.", upvotes: 22 },
        { authorName: 'Anonymous', content: "Proud of you for taking that step! 💪", upvotes: 14 }
      ]},
      { authorName: 'Anonymous', content: "Can't sleep at night because my brain won't stop thinking about assignments. Any remedies?", upvotes: 28, replies: [
        { authorName: 'Anonymous', content: "Try writing down everything in a journal before bed - it helps clear your mind.", upvotes: 16 },
        { authorName: 'Anonymous', content: "No screen time 1 hour before sleep helps me a lot!", upvotes: 10 }
      ]}
    ];

    for (const post of forumPosts) {
      await ForumPost.create({
        authorId: students[Math.floor(Math.random() * students.length)]._id,
        isAnonymous: true,
        ...post
      });
    }
    console.log('✅ Created 15 forum posts');

    const resources = [
      { title: 'Understanding Exam Anxiety', content: 'Exam anxiety is common among students. Learn effective techniques to manage it.', body: 'Exam anxiety is a type of performance anxiety that can affect students of all ages and academic levels. It manifests as excessive worry, nervousness, or fear before or during exams.\n\nCommon symptoms include rapid heartbeat, sweaty palms, difficulty concentrating, and negative self-talk. Understanding that these are normal stress responses is the first step toward managing them.\n\nHere are proven strategies to manage exam anxiety:\n\n1. Preparation is Key: Start studying well in advance. Break your study material into manageable chunks and create a realistic study schedule. Last-minute cramming often increases anxiety.\n\n2. Practice Relaxation Techniques: Deep breathing exercises, progressive muscle relaxation, and mindfulness meditation can help calm your nervous system before and during exams.\n\n3. Challenge Negative Thoughts: Replace thoughts like "I\'m going to fail" with more balanced ones like "I\'ve prepared well and will do my best."\n\n4. Take Care of Your Body: Get adequate sleep, eat nutritious meals, and exercise regularly. Physical well-being directly impacts mental performance.\n\n5. Arrive Early: Getting to the exam venue early gives you time to settle in and feel comfortable with the environment.\n\nRemember, some level of anxiety is normal and can actually improve performance. The goal is not to eliminate anxiety entirely but to manage it effectively.', language: 'en', category: 'article', tags: ['anxiety', 'exams', 'study tips'], readTime: 6 },
      { title: 'The Power of Mindfulness', content: 'Discover how mindfulness can improve your mental health and academic performance.', body: 'Mindfulness is the practice of paying attention to the present moment without judgment. Research shows it can significantly improve mental health, reduce stress, and enhance cognitive function.\n\nWhat is Mindfulness?\n\nAt its core, mindfulness means being fully engaged with whatever you are doing at any given moment. Instead of dwelling on the past or worrying about the future, you focus on the here and now.\n\nBenefits for Students:\n\n- Improved concentration and focus during lectures and study sessions\n- Better emotional regulation during stressful periods\n- Enhanced memory retention and recall\n- Reduced symptoms of anxiety and depression\n- Better sleep quality\n\nSimple Mindfulness Exercises:\n\n1. Mindful Breathing: Sit comfortably and focus on your breath for 5 minutes. Notice the sensation of air entering and leaving your body.\n\n2. Body Scan: Starting from your toes, gradually bring attention to each part of your body, noticing any sensations without trying to change them.\n\n3. Mindful Walking: During your walk to class, pay attention to each step, the feeling of your feet on the ground, and the sounds around you.\n\n4. Mindful Eating: During your next meal, eat slowly and pay attention to the taste, texture, and aroma of your food.\n\nStart with just 5 minutes a day and gradually increase the duration. Consistency is more important than duration.', language: 'en', category: 'article', tags: ['mindfulness', 'wellness', 'mental health'], readTime: 7 },
      { title: 'Breathing Exercises for Stress Relief', content: 'Simple breathing techniques you can do anywhere to reduce stress instantly.', body: 'These breathing exercises can be done anywhere, anytime to help reduce stress and anxiety.\n\n4-7-8 Breathing Technique:\n1. Breathe in quietly through your nose for 4 seconds\n2. Hold your breath for 7 seconds\n3. Exhale completely through your mouth for 8 seconds\n4. Repeat 3-4 times\n\nBox Breathing:\n1. Breathe in for 4 seconds\n2. Hold for 4 seconds\n3. Breathe out for 4 seconds\n4. Hold for 4 seconds\n5. Repeat 4-6 times\n\nDiaphragmatic Breathing:\n1. Place one hand on your chest and one on your belly\n2. Breathe in slowly through your nose, feeling your belly rise\n3. Your chest should remain relatively still\n4. Exhale slowly through pursed lips\n5. Practice for 5-10 minutes\n\nThese exercises activate your parasympathetic nervous system, which helps counteract the stress response.', language: 'en', category: 'exercise', tags: ['breathing', 'stress relief', 'quick'], readTime: 4 },
      { title: 'Healthy Sleep Habits for Students', content: 'Quality sleep is essential for academic success. Here are tips to improve your sleep.', body: 'Sleep is one of the most important factors in academic performance and mental health. Most college students need 7-9 hours of sleep per night, yet studies show the average student gets less than 7 hours.\n\nWhy Sleep Matters:\n\n- Memory consolidation occurs during sleep, making it essential for learning\n- Sleep deprivation impairs concentration, problem-solving, and creativity\n- Poor sleep is linked to increased anxiety and depression symptoms\n- Chronic sleep loss weakens the immune system\n\nTips for Better Sleep:\n\n1. Maintain a Consistent Schedule: Go to bed and wake up at the same time every day, even on weekends.\n\n2. Create a Sleep-Friendly Environment: Keep your room cool, dark, and quiet. Consider using earplugs or a white noise machine.\n\n3. Limit Screen Time: Avoid phones, laptops, and tablets for at least 30 minutes before bed. The blue light from screens suppresses melatonin production.\n\n4. Watch Your Caffeine: Avoid coffee, tea, and energy drinks after 2 PM. Caffeine can stay in your system for up to 8 hours.\n\n5. Exercise Regularly: Physical activity promotes better sleep, but try to finish workouts at least 3 hours before bedtime.\n\n6. Avoid Late-Night Cramming: All-nighters actually hurt performance more than they help. Your brain needs sleep to process and retain information.', language: 'en', category: 'article', tags: ['sleep', 'health', 'study tips'], readTime: 8 },
      { title: 'Guided Meditation: 5 Minutes', content: 'A quick guided meditation session perfect for between classes.', language: 'en', category: 'video', tags: ['meditation', 'relaxation', 'quick'], videoUrl: 'https://www.youtube.com/watch?v=inpok4MKVLM' },
      { title: '10-Minute Meditation For Anxiety', content: 'A calming meditation specifically designed to help with anxiety and stress.', language: 'en', category: 'video', tags: ['meditation', 'anxiety', 'calm'], videoUrl: 'https://www.youtube.com/watch?v=O-6f5wQXSu8' },
      { title: 'How to Deal with Stress as a Student', content: 'Practical tips and strategies for managing stress in academic life.', language: 'en', category: 'video', tags: ['stress', 'student life', 'tips'], videoUrl: 'https://www.youtube.com/watch?v=Ux5cQbO_AIo' },
      { title: 'The Science of Gratitude', content: 'Learn how practicing gratitude can rewire your brain for happiness.', language: 'en', category: 'video', tags: ['gratitude', 'happiness', 'science'], videoUrl: 'https://www.youtube.com/watch?v=JMd1CcGZYwU' },
      { title: 'Managing Academic Pressure', content: 'Tips for handling the pressure of academic life without burning out.', body: 'Academic pressure is one of the leading causes of stress among college students. Learning to manage this pressure effectively is crucial for both your academic success and mental well-being.\n\nRecognizing the Signs of Burnout:\n\n- Constant exhaustion despite getting enough sleep\n- Loss of motivation and interest in studies\n- Increased irritability and mood swings\n- Difficulty concentrating\n- Feeling overwhelmed by simple tasks\n\nStrategies for Managing Pressure:\n\n1. Set Realistic Goals: Break large projects into smaller, manageable tasks. Celebrate small victories along the way.\n\n2. Learn to Say No: You dont have to participate in every activity or take on every opportunity. Prioritize what truly matters to you.\n\n3. Use Time Management Tools: Create schedules, use planners, and set deadlines for yourself. The Pomodoro Technique (25 minutes of focused work followed by a 5-minute break) can be very effective.\n\n4. Seek Support: Talk to friends, family, or a counselor when you feel overwhelmed. You dont have to face challenges alone.\n\n5. Practice Self-Compassion: Be kind to yourself when things dont go as planned. Everyone makes mistakes and has setbacks.\n\n6. Maintain Balance: Make time for hobbies, exercise, and social activities alongside your studies.', language: 'en', category: 'article', tags: ['pressure', 'burnout', 'academic'], readTime: 6 },
      { title: 'Building Positive Relationships', content: 'How to build and maintain healthy relationships in college.', body: 'Healthy relationships are a cornerstone of mental well-being during college. Whether its friendships, romantic relationships, or professional connections, the quality of your relationships significantly impacts your happiness and academic success.\n\nKey Elements of Healthy Relationships:\n\n1. Communication: Express your thoughts and feelings openly and honestly. Listen actively when others speak.\n\n2. Boundaries: Understand and respect personal boundaries, both yours and others. Its okay to say no.\n\n3. Trust: Build trust through consistency, reliability, and honesty.\n\n4. Mutual Respect: Value each others opinions, feelings, and autonomy.\n\n5. Support: Be there for each other during difficult times while also celebrating successes.\n\nTips for Making Friends in College:\n\n- Join clubs or organizations that align with your interests\n- Attend campus events and social gatherings\n- Be open to meeting people from different backgrounds\n- Follow up with people you connect with\n- Be genuine and authentic\n\nHandling Conflict:\n\n- Address issues early before they escalate\n- Use "I" statements instead of "you" statements\n- Focus on the problem, not the person\n- Be willing to compromise\n- Know when to seek help from a counselor or mediator', language: 'en', category: 'article', tags: ['relationships', 'social', 'wellness'], readTime: 7 },
      { title: 'Quick Desk Stretches', content: 'Simple stretches you can do at your desk to relieve tension.', body: 'Sitting for long periods during study sessions can cause muscle tension and discomfort. These simple stretches can be done right at your desk.\n\nNeck Rolls:\n1. Slowly drop your chin to your chest\n2. Roll your head to the right, bringing your ear toward your shoulder\n3. Continue rolling your head back, then to the left\n4. Complete 5 circles in each direction\n\nShoulder Shrugs:\n1. Raise both shoulders up toward your ears\n2. Hold for 5 seconds\n3. Release and let your shoulders drop\n4. Repeat 10 times\n\nSeated Spinal Twist:\n1. Sit up straight in your chair\n2. Place your right hand on the back of the chair\n3. Gently twist your torso to the right\n4. Hold for 15-20 seconds\n5. Repeat on the left side\n\nWrist Circles:\n1. Extend your arms in front of you\n2. Make circles with your wrists, 10 in each direction\n3. Shake out your hands\n\nDo these stretches every 30-45 minutes during study sessions to stay comfortable and focused.', language: 'en', category: 'exercise', tags: ['stretching', 'physical', 'quick'], readTime: 3 },
      { title: 'Progressive Muscle Relaxation', content: 'A step-by-step body relaxation technique to release physical tension from stress.', body: 'Progressive Muscle Relaxation (PMR) is a technique that involves systematically tensing and relaxing different muscle groups. It helps you recognize and release physical tension.\n\nHow to Practice PMR:\n\nFind a comfortable position, either sitting or lying down. Close your eyes and take a few deep breaths.\n\nFor each muscle group:\n1. Tense the muscles for 5-7 seconds\n2. Release the tension suddenly\n3. Notice the difference between tension and relaxation\n4. Rest for 15-20 seconds before moving to the next group\n\nMuscle Group Sequence:\n1. Feet - curl your toes tightly\n2. Calves - point your toes toward your shins\n3. Thighs - squeeze your thigh muscles\n4. Abdomen - tighten your stomach muscles\n5. Hands - make tight fists\n6. Arms - flex your biceps\n7. Shoulders - shrug up toward your ears\n8. Face - scrunch your facial muscles\n\nPractice this exercise daily, especially before bed, to improve your ability to relax and manage stress.', language: 'en', category: 'exercise', tags: ['relaxation', 'stress relief', 'body'], readTime: 5 }
    ];

    for (const resource of resources) {
      await Resource.create(resource);
    }
    console.log('✅ Created resources');

    const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
    for (let i = 0; i < 15; i++) {
      const date = new Date();
      date.setDate(date.getDate() + Math.floor(Math.random() * 14));
      const status = ['pending', 'confirmed', 'completed'][Math.floor(Math.random() * 3)];
      const hasRating = status === 'completed' && Math.random() > 0.3;
      
      await Appointment.create({
        studentId: students[Math.floor(Math.random() * students.length)]._id,
        counsellorId: counsellors[Math.floor(Math.random() * counsellors.length)]._id,
        date,
        timeSlot: timeSlots[Math.floor(Math.random() * timeSlots.length)],
        status,
        notes: status === 'completed' ? 'Good session. Student showed improvement.' : '',
        rating: hasRating ? (Math.floor(Math.random() * 2) + 4) : undefined,
        review: hasRating ? 'Very helpful session. I feel much better now.' : ''
      });
    }
    console.log('✅ Created 8 appointments');

    console.log('🌱 Database seeding complete!');
    console.log('');
    console.log('📊 Seeded Data Summary:');
    console.log('   - 7 Users (4 students, 2 counselors, 1 admin)');
    console.log('   - 120 Mood Entries (30 per student)');
    console.log('   - 28 Quiz Results');
    console.log('   - 20 Journal Entries');
    console.log('   - 15 Forum Posts with replies');
    console.log('   - 20 Resources (10 English, 10 Hindi)');
    console.log('   - 8 Appointments');
    console.log('');
    console.log('✨ Ready for MindBridge!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seedData();