import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Heart, Shield, Users, MessageCircle, Calendar, Smile, BookOpen, ArrowRight, Sparkles, Phone, Star, ChevronDown, Mail, MapPin, Instagram, Twitter, Linkedin, CheckCircle } from 'lucide-react';

const TEAM_MEMBERS = [
  {
    name: 'Sarah Chen',
    role: 'Lead Full-Stack Developer',
    description: 'Architected the core MindBridge platform. Passionate about creating accessible mental health tech.',
    seed: 'Sarah',
    bg: 'bg-primary-100 dark:bg-primary-900/40'
  },
  {
    name: 'David Rodriguez',
    role: 'UI/UX Lead Designer',
    description: 'Designed the intuitive, calming interface of MindBridge to ensure a stress-free user experience.',
    seed: 'David',
    bg: 'bg-purple-100 dark:bg-purple-900/40'
  },
  {
    name: 'Priya Patel',
    role: 'AI & Data Engineer',
    description: 'Developed the MindBot AI algorithms, integrating empathetic response models for student support.',
    seed: 'Priya',
    bg: 'bg-green-100 dark:bg-green-900/40'
  },
  {
    name: 'Marcus Johnson',
    role: 'Backend Systems Architect',
    description: 'Built the secure, scalable Node.js infrastructure that handles real-time mood tracking and chat.',
    seed: 'Marcus',
    bg: 'bg-orange-100 dark:bg-orange-900/40'
  },
  {
    name: 'Elena Rostova',
    role: 'Security & QA Specialist',
    description: 'Ensured all student data is encrypted and the platform maintains rigorous privacy standards.',
    seed: 'Elena',
    bg: 'bg-rose-100 dark:bg-rose-900/40'
  }
];

const TESTIMONIALS = [
  {
    name: 'Emily R.',
    role: 'Computer Science Junior',
    content: 'MindBridge completely changed how I manage stress during finals. The Pomodoro timer paired with the quick breathing exercises keeps me grounded and focused.',
    rating: 5,
    seed: 'Felix'
  },
  {
    name: 'James T.',
    role: 'Medical Student',
    content: 'Having anonymous access to the peer support forum helped me realize I wasn\'t alone in dealing with burnout. It\'s a beautifully designed, safe space.',
    rating: 5,
    seed: 'Aneka'
  },
  {
    name: 'Sophia L.',
    role: 'Psychology Senior',
    content: 'The clinical quizzes (PHQ-9) are so easy to use, and I love how I can easily book a session with a campus counsellor when my scores indicate I need help.',
    rating: 5,
    seed: 'Jude'
  }
];

const FAQS = [
  {
    question: 'Is MindBridge free for students?',
    answer: 'Yes! MindBridge is completely free for all currently enrolled students. Just sign up using your university email address.'
  },
  {
    question: 'Is my wellness data kept confidential?',
    answer: 'Absolutely. We use enterprise-grade encryption. Your mood logs, journal entries, and quiz results are completely private and only shared with a counsellor if you explicitly choose to do so.'
  },
  {
    question: 'How do I book a session with a counsellor?',
    answer: 'Simply navigate to the "Appointments" tab, view the availability of our licensed campus counsellors, and select a time that works for you. It takes less than 60 seconds.'
  },
  {
    question: 'Can I use MindBridge on my phone?',
    answer: 'Yes, MindBridge is fully responsive and functions like a native app on mobile devices. We also support progressive web app (PWA) features for offline access.'
  }
];

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState(null);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 dark:bg-primary/5 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-blue-400/10 dark:bg-blue-600/5 blur-[120px]" />
      </div>

      <header className="relative z-10 py-5 px-4 md:px-8 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="w-11 h-11 bg-gradient-to-br from-primary to-primary-400 rounded-xl flex items-center justify-center shadow-md">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-800 dark:text-white">MindBridge</span>
        </div>
        <div className="flex items-center">
          <div className="hidden lg:flex items-center space-x-6 mr-8">
            <a href="#features" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Features</a>
            <a href="#about" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">About</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">How It Works</a>
            <a href="#team" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Team</a>
            <a href="#faq" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">FAQ</a>
            <a href="#contact" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary transition-colors">Contact</a>
          </div>
          <div className="flex items-center space-x-3">
            <Link 
              to="/login" 
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-primary/5 dark:hover:bg-primary/10 rounded-xl transition-all"
            >
              Sign In
            </Link>
            <Link 
              to="/signup" 
              className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-700 hover:shadow-glow transition-all duration-300"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="pt-24 pb-32 px-4 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4" />
            <span>Empowering Student Mental Wellness</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6 leading-tight">
            Your Digital Bridge to <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Better Mental Health
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
            A comprehensive, secure platform designed specifically for college students to track wellness, connect with professional counsellors, and access 24/7 AI support.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link 
              to="/signup" 
              className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-2xl text-base font-semibold hover:bg-primary-700 hover:shadow-glow transition-all duration-300 flex items-center justify-center group"
            >
              Start Your Journey 
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="#features" 
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl text-base font-semibold hover:bg-surface-light dark:hover:bg-surface-dark transition-all duration-300 flex items-center justify-center"
            >
              Explore Features
            </a>
          </div>
        </section>

        <section id="features" className="py-24 px-4 bg-card-light/50 dark:bg-card-dark/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Everything You Need to Thrive
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Powerful tools designed to support your mental wellness journey every day.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30', title: 'Mood Tracking', desc: 'Log daily emotions and visualize trends over time to better understand your emotional rhythms.' },
                { icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', title: 'MindBot AI', desc: 'Get immediate, 24/7 empathetic support and coping strategies from our advanced AI companion.' },
                { icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30', title: 'Professional Care', desc: 'Easily book and manage confidential sessions with certified campus counsellors.' },
                { icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30', title: 'Clinical Quizzes', desc: 'Take validated assessments (PHQ-9, GAD-7) to monitor your mental health scientifically.' },
                { icon: Users, color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/30', title: 'Peer Support Forum', desc: 'Connect anonymously with fellow students who understand exactly what you are going through.' },
                { icon: Shield, color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-200 dark:bg-slate-700/50', title: 'Absolute Privacy', desc: 'Your data is encrypted. We prioritize your privacy and provide immediate crisis routing.' },
              ].map((feature, idx) => (
                <div key={idx} className="p-8 bg-card-light dark:bg-card-dark rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                  <div className={`w-14 h-14 ${feature.bg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300`}>
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="py-24 px-4 max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
                <Heart className="w-4 h-4" />
                <span>Our Mission</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Built by Students, For Students
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                MindBridge was born out of a stark realization: college is overwhelmingly stressful, and accessing mental health resources is often too complicated, too expensive, or simply too intimidating. 
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Our mission is to dismantle these barriers. We provide a safe, anonymous, and comprehensive ecosystem where university students can track their well-being, find peer support, and connect with licensed campus counsellors without any friction.
              </p>
              <ul className="space-y-4">
                {['100% Free for Students', 'Anonymous Peer Support', 'Data Privacy First'].map((item, idx) => (
                  <li key={idx} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <span className="font-medium text-gray-800 dark:text-gray-200">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:w-1/2 w-full relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-accent/20 rounded-2xl transform rotate-1 scale-105" />
              <div className="bg-card-light dark:bg-card-dark p-8 rounded-2xl shadow-lg relative z-10 border border-gray-100 dark:border-gray-800">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-primary/10 rounded-xl text-center">
                    <h4 className="text-3xl font-bold text-primary mb-1">24/7</h4>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Support</p>
                  </div>
                  <div className="p-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-center">
                    <h4 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">50+</h4>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Campus Counsellors</p>
                  </div>
                  <div className="p-5 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-center">
                    <h4 className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">10k+</h4>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Students</p>
                  </div>
                  <div className="p-5 bg-rose-100 dark:bg-rose-900/30 rounded-xl text-center">
                    <h4 className="text-3xl font-bold text-rose-600 dark:text-rose-400 mb-1">100%</h4>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Confidential</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-24 px-4 bg-surface-light dark:bg-surface-dark">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                How MindBridge Works
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                A seamless experience designed to integrate into your busy student life.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 relative">
              {[
                { step: '01', title: 'Create Your Profile', desc: 'Sign up securely with your student email. Your identity remains strictly confidential.' },
                { step: '02', title: 'Track & Reflect', desc: 'Log your daily mood, take validated clinical quizzes, and practice wellness exercises.' },
                { step: '03', title: 'Get Support', desc: 'Chat with our MindBot AI instantly, or seamlessly book a session with a human counsellor.' }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-white dark:bg-card-dark rounded-full shadow-lg border-4 border-primary/20 flex items-center justify-center mb-6">
                    <span className="text-2xl font-bold text-primary">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed px-4">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="team" className="py-32 px-4 max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Meet the Minds Behind MindBridge
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Our dedicated team of developers and designers built this platform with a single goal: making mental health support accessible to every student.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
            {TEAM_MEMBERS.map((member, idx) => (
              <div 
                key={idx} 
                className="p-8 bg-card-light dark:bg-card-dark rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`w-28 h-28 rounded-full mb-5 overflow-hidden border-4 border-white dark:border-gray-700 shadow-md ${member.bg}`}>
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.seed}&backgroundColor=transparent`} 
                      alt={member.name}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{member.name}</h3>
                  <div className="text-sm font-semibold text-primary mb-4 bg-primary/10 px-3 py-1 rounded-full">
                    {member.role}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="py-24 px-4 bg-primary/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Loved by Students
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Don't just take our word for it. Here's how MindBridge is making a difference.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((testimonial, idx) => (
                <div key={idx} className="bg-card-light dark:bg-card-dark p-8 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="flex space-x-1 mb-5">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center space-x-4">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${testimonial.seed}&backgroundColor=e2e8f0`} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="py-24 px-4 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Got questions? We've got answers.
            </p>
          </div>
          
          <div className="space-y-4">
            {FAQS.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-card-light dark:bg-card-dark rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-300"
              >
                <button 
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
                >
                  <span className="font-semibold text-gray-900 dark:text-white pr-4">{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ${activeFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ${activeFaq === idx ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="p-5 pt-0 text-gray-600 dark:text-gray-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="contact" className="py-24 px-4 bg-card-light dark:bg-card-dark border-t border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-16">
              <div className="lg:w-1/2">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  Get in Touch
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                  Whether you have a technical issue, a suggestion, or just want to say hi, our team is always here to listen.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Email Us</h4>
                      <p className="text-gray-600 dark:text-gray-400">support@mindbridge.edu</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-danger/10 rounded-xl flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6 text-danger" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Call Us (24/7 Crisis Line)</h4>
                      <p className="text-gray-600 dark:text-gray-400">1-800-273-8255</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Campus Office</h4>
                      <p className="text-gray-600 dark:text-gray-400">Student Wellness Center, Room 402<br/>123 University Ave</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="lg:w-1/2">
                <form className="bg-surface-light dark:bg-surface-dark p-8 rounded-2xl border border-gray-100 dark:border-gray-800" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                      <input type="text" className="input-field" placeholder="Jane" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                      <input type="text" className="input-field" placeholder="Doe" />
                    </div>
                  </div>
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Student Email</label>
                    <input type="email" className="input-field" placeholder="jane.doe@university.edu" />
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                    <textarea rows="4" className="input-field resize-none" placeholder="How can we help you?"></textarea>
                  </div>
                  <button type="submit" className="btn-primary w-full">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 px-4 text-center">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-primary to-primary-400 rounded-3xl p-12 md:p-16 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
            
            <h2 className="relative z-10 text-3xl md:text-5xl font-bold text-white mb-6">
              Start Prioritizing Your Mental Health Today
            </h2>
            <p className="relative z-10 text-lg text-white/90 mb-10 max-w-2xl mx-auto">
              Join thousands of students who are taking control of their wellness journey with MindBridge. Free, confidential, and always available.
            </p>
            <Link 
              to="/signup" 
              className="relative z-10 inline-flex items-center px-10 py-5 bg-white text-primary rounded-2xl text-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              Create Free Account <ArrowRight className="w-6 h-6 ml-2" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 dark:bg-black pt-20 pb-10 px-4 text-gray-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-400 rounded-xl flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">MindBridge</span>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              Empowering university students with accessible, private, and comprehensive mental wellness tools.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center hover:bg-primary hover:text-white transition-all"><Linkedin className="w-4 h-4" /></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-6">Platform</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a></li>
              <li><a href="#faq" className="hover:text-primary transition-colors">FAQ</a></li>
              <li><Link to="/login" className="hover:text-primary transition-colors">Sign In</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-6">Company</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#about" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#team" className="hover:text-primary transition-colors">Our Team</a></li>
              <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-6">Legal</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Crisis Guidelines</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between text-sm">
          <p>© {new Date().getFullYear()} MindBridge. All rights reserved.</p>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-danger fill-danger" />
            <span>by the MindBridge Team</span>
          </div>
        </div>
      </footer>
    </div>
  );
}


