const mongoose = require('mongoose');
const Resource = require('./models/Resource');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mindbridge';

const newResources = [
  // ---------------- VIDEOS ----------------
  {
    title: 'Guided Meditation for Anxiety',
    content: 'A 10-minute guided meditation to help you ground yourself when feeling overwhelmed.',
    body: '',
    language: 'en',
    category: 'video',
    tags: ['meditation', 'anxiety', 'calm'],
    videoUrl: 'https://www.youtube.com/watch?v=O-6f5wQXSu8',
  },
  {
    title: 'ध्यान और शांति (Meditation & Peace)',
    content: 'तनाव कम करने के लिए 10 मिनट का ध्यान। (10-minute meditation to reduce stress.)',
    body: '',
    language: 'hi',
    category: 'video',
    tags: ['meditation', 'hindi', 'stress'],
    videoUrl: 'https://www.youtube.com/watch?v=inpok4MKVLM',
  },
  {
    title: 'How to Manage Time as a College Student',
    content: 'Learn effective time management strategies to balance academics and personal life without burning out.',
    body: '',
    language: 'en',
    category: 'video',
    tags: ['productivity', 'college', 'time-management'],
    videoUrl: 'https://www.youtube.com/watch?v=iONDebHX9qk',
  },
  {
    title: 'परीक्षा का तनाव कैसे दूर करें (How to beat Exam Stress)',
    content: 'परीक्षा के समय होने वाली घबराहट और तनाव को कैसे कम करें, इसके लिए मनोवैज्ञानिक सुझाव।',
    body: '',
    language: 'hi',
    category: 'video',
    tags: ['exams', 'stress', 'hindi', 'students'],
    videoUrl: 'https://www.youtube.com/watch?v=VFaE78A_Z-w',
  },

  // ---------------- EXERCISES ----------------
  {
    title: 'The 5-4-3-2-1 Grounding Technique',
    content: 'A quick exercise to bring you back to the present moment when experiencing a panic attack or severe anxiety.',
    body: 'The 5-4-3-2-1 grounding technique is a powerful tool to calm panic and anxiety.\n\nStep 1: Look around and identify 5 things you can see.\nStep 2: Focus on 4 things you can feel (e.g., your shirt on your back, the chair under you).\nStep 3: Listen for 3 things you can hear (e.g., a clock ticking, cars outside).\nStep 4: Find 2 things you can smell.\nStep 5: Notice 1 thing you can taste.\n\nTake deep breaths throughout this exercise.',
    language: 'en',
    category: 'exercise',
    tags: ['anxiety', 'grounding', 'panic'],
    readTime: 3
  },
  {
    title: 'Progressive Muscle Relaxation (PMR)',
    content: 'Release physical tension step-by-step to calm your mind before sleep.',
    body: 'Progressive Muscle Relaxation involves tensing and then relaxing different muscle groups.\n\n1. Find a comfortable place to lie down.\n2. Start at your feet: tense the muscles for 5 seconds, then completely relax for 10 seconds.\n3. Move up to your calves, tense, and relax.\n4. Continue moving up your body: thighs, stomach, chest, arms, hands, neck, and face.\n5. Notice the feeling of heaviness and relaxation in your body.',
    language: 'en',
    category: 'exercise',
    tags: ['sleep', 'relaxation', 'physical'],
    readTime: 5
  },
  {
    title: 'गहरी सांस लेने का व्यायाम (Deep Breathing)',
    content: 'तनाव और चिंता को तुरंत कम करने के लिए "4-7-8" श्वास तकनीक।',
    body: '4-7-8 श्वास तकनीक तंत्रिका तंत्र को शांत करने में मदद करती है:\n\n1. आराम से बैठें और अपनी आंखें बंद करें।\n2. 4 सेकंड के लिए अपनी नाक से धीरे-धीरे सांस लें।\n3. 7 सेकंड के लिए अपनी सांस को रोक कर रखें।\n4. 8 सेकंड के लिए अपने मुंह से धीरे-धीरे सांस छोड़ें।\n\nइस चक्र को कम से कम 4 बार दोहराएं। यह व्यायाम नींद न आने पर भी बहुत लाभदायक है।',
    language: 'hi',
    category: 'exercise',
    tags: ['breathing', 'hindi', 'anxiety'],
    readTime: 2
  },

  // ---------------- ARTICLES ----------------
  {
    title: 'Understanding Imposter Syndrome',
    content: 'Why you feel like a fraud and how to overcome the belief that you don\'t belong.',
    body: 'Imposter syndrome is the psychological pattern where individuals doubt their accomplishments and have a persistent internalized fear of being exposed as a "fraud".\n\nResearch shows that up to 70% of people will experience this at some point, particularly high-achieving college students.\n\nHow to overcome it:\n1. Acknowledge the feelings and talk to peers. You will be surprised how many others feel the same.\n2. Separate feelings from fact. Just because you feel stupid doesn\'t mean you are.\n3. Develop a healthy response to failure. See it as an opportunity to learn, not a reflection of your worth.',
    language: 'en',
    category: 'article',
    tags: ['imposter-syndrome', 'confidence', 'academics'],
    readTime: 6
  },
  {
    title: 'अकेलापन कैसे दूर करें (Overcoming Loneliness in Hostel Life)',
    content: 'हॉस्टल में रहने वाले छात्रों के लिए अकेलेपन से निपटने के व्यावहारिक तरीके।',
    body: 'घर से दूर हॉस्टल में रहना कई बार बहुत अकेलापन भरा हो सकता है। नए लोगों के बीच तालमेल बिठाना मुश्किल लग सकता है।\n\nअकेलेपन से निपटने के कुछ उपाय:\n\n1. पहल करें: अपने रूममेट्स या क्लासमेट्स से बातचीत शुरू करें। छोटी सी शुरुआत बड़ी दोस्ती में बदल सकती है।\n2. क्लब या सोसाइटी में शामिल हों: अपने शौक (जैसे म्यूजिक, ड्रामा या स्पोर्ट्स) से जुड़े ग्रुप्स में जाएं।\n3. रूटीन बनाएं: खाली समय अक्सर अकेलेपन को बढ़ाता है। एक स्वस्थ दिनचर्या का पालन करें।\n4. घर पर बात करें: जब भी बुरा लगे, अपने माता-पिता या पुराने दोस्तों से फोन पर बात करें।\n\nयाद रखें, इस बदलाव में समय लगता है। खुद को समय दें और अपनी भावनाओं को स्वीकार करें।',
    language: 'hi',
    category: 'article',
    tags: ['loneliness', 'hostel-life', 'hindi'],
    readTime: 4
  },
  {
    title: 'The Impact of Screen Time on Mental Health',
    content: 'How your phone might be affecting your mood and strategies for a digital detox.',
    body: 'In the digital age, college students spend an average of 8-10 hours a day looking at screens. While technology connects us, excessive screen time is closely linked to increased rates of depression, anxiety, and poor sleep.\n\nThe "Comparison Trap" on social media often leads to feelings of inadequacy. Furthermore, the blue light emitted by screens suppresses melatonin production, disrupting your natural sleep cycle.\n\nTips for a Digital Detox:\n1. Establish "No-Tech" zones, such as the dining table or your bed.\n2. Use app timers to limit social media usage to 30 minutes a day.\n3. Replace 1 hour of screen time with a physical activity like reading a physical book or going for a walk.\n4. Enable "Night Shift" mode on your devices to reduce blue light exposure in the evenings.',
    language: 'en',
    category: 'article',
    tags: ['digital-detox', 'social-media', 'sleep'],
    readTime: 7
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    let addedCount = 0;
    for (const res of newResources) {
      // Check if it already exists by title
      const exists = await Resource.findOne({ title: res.title });
      if (!exists) {
        await Resource.create(res);
        addedCount++;
        console.log(`Added: ${res.title}`);
      }
    }
    
    console.log(`\nSuccessfully added ${addedCount} new resources!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seed();
