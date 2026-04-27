import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Heart, Wind, Brain, Clock, Target, CheckCircle } from 'lucide-react';

const BREATHING_EXERCISES = [
  { name: '4-7-8 Breathing', cycles: 4, instructions: [
    { text: 'Breathe in through your nose', duration: 4000, action: 'inhale' },
    { text: 'Hold your breath', duration: 7000, action: 'hold' },
    { text: 'Exhale slowly through mouth', duration: 8000, action: 'exhale' }
  ]},
  { name: 'Box Breathing', cycles: 4, instructions: [
    { text: 'Breathe in', duration: 4000, action: 'inhale' },
    { text: 'Hold', duration: 4000, action: 'hold' },
    { text: 'Breathe out', duration: 4000, action: 'exhale' },
    { text: 'Hold', duration: 4000, action: 'hold' }
  ]},
  { name: 'Deep Breathing', cycles: 5, instructions: [
    { text: 'Take a deep breath in', duration: 5000, action: 'inhale' },
    { text: 'Exhale slowly', duration: 5000, action: 'exhale' }
  ]},
  { name: 'Free Breathe (Manual)', cycles: 'Infinite', manual: true, instructions: [] }
];

export default function WellnessPage() {
  const [activeTab, setActiveTab] = useState('breathing');
  const [breathingExercise, setBreathingExercise] = useState(null);
  const [breathingPhase, setBreathingPhase] = useState(0);
  const [breathingCycle, setBreathingCycle] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathingTimer, setBreathingTimer] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  
  const [meditationTime, setMeditationTime] = useState(300);
  const [isMeditating, setIsMeditating] = useState(false);
  const [meditationInterval, setMeditationInterval] = useState(null);
  
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);
  const [pomodoroInterval, setPomodoroInterval] = useState(null);
  const [pomodoroSession, setPomodoroSession] = useState(1);
  
  const [gratitude, setGratitude] = useState(['', '', '']);
  const [gratitudeSubmitted, setGratitudeSubmitted] = useState(false);
  
  const [challenges] = useState([
    { id: 1, text: 'Drink 8 glasses of water today', icon: '💧' },
    { id: 2, text: 'Take a 15-minute walk outside', icon: '🚶' },
    { id: 3, text: 'Connect with a friend or family', icon: '📞' },
    { id: 4, text: 'Practice gratitude for 3 things', icon: '🙏' },
    { id: 5, text: 'Do 10 minutes of stretching', icon: '🧘' }
  ]);
  
  const getTodayKey = () => `wellness_challenges_${new Date().toDateString()}`;
  const [completedChallenges, setCompletedChallenges] = useState(() => {
    const stored = localStorage.getItem(getTodayKey());
    if (stored) {
      const storedDate = JSON.parse(stored).date;
      if (storedDate === new Date().toDateString()) {
        return JSON.parse(stored).completed;
      }
    }
    return [];
  });

  const breathingTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (breathingTimerRef.current) clearTimeout(breathingTimerRef.current);
      if (meditationInterval) clearInterval(meditationInterval);
      if (pomodoroInterval) clearInterval(pomodoroInterval);
    };
  }, []);

  const startBreathing = (exercise) => {
    setBreathingExercise(exercise);
    setBreathingCycle(0);
    setBreathingPhase(0);
    setIsBreathing(true);
    if (!exercise.manual) {
      runBreathingPhase(exercise, 0, 0);
    }
  };

  const runBreathingPhase = (exercise, cycle, phase) => {
    if (breathingTimerRef.current) clearInterval(breathingTimerRef.current);
    
    const instruction = exercise.instructions[phase];
    setBreathingPhase(phase);
    
    let count = instruction.duration / 100;
    setBreathingTimer(count);
    
    const interval = setInterval(() => {
      setBreathingTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          const nextPhase = (phase + 1) % exercise.instructions.length;
          if (nextPhase === 0) {
            const nextCycle = cycle + 1;
            if (nextCycle >= exercise.cycles) {
              setIsBreathing(false);
              return 0;
            }
            setBreathingCycle(nextCycle);
            runBreathingPhase(exercise, nextCycle, 0);
          } else {
            runBreathingPhase(exercise, cycle, nextPhase);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 100);
    
    breathingTimerRef.current = interval;
  };

  const stopBreathing = () => {
    if (breathingTimerRef.current) clearTimeout(breathingTimerRef.current);
    setIsBreathing(false);
    setBreathingExercise(null);
  };

  const startMeditation = (seconds) => {
    setMeditationTime(seconds);
    setIsMeditating(true);
    const interval = setInterval(() => {
      setMeditationTime(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsMeditating(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setMeditationInterval(interval);
  };

  const stopMeditation = () => {
    if (meditationInterval) clearInterval(meditationInterval);
    setIsMeditating(false);
  };

  const startPomodoro = () => {
    setIsPomodoroRunning(true);
    const interval = setInterval(() => {
      setPomodoroTime(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsPomodoroRunning(false);
          if (pomodoroSession < 4) {
            setPomodoroSession(s => s + 1);
            setPomodoroTime(25 * 60);
          } else {
            setPomodoroSession(1);
            setPomodoroTime(25 * 60);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setPomodoroInterval(interval);
  };

  const stopPomodoro = () => {
    if (pomodoroInterval) clearInterval(pomodoroInterval);
    setIsPomodoroRunning(false);
  };

  const toggleChallenge = (id) => {
    setCompletedChallenges(prev => {
      const newCompleted = prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id];
      localStorage.setItem(getTodayKey(), JSON.stringify({
        date: new Date().toDateString(),
        completed: newCompleted
      }));
      return newCompleted;
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const tabs = [
    { id: 'breathing', label: 'Breathing', icon: Wind },
    { id: 'meditation', label: 'Meditation', icon: Brain },
    { id: 'gratitude', label: 'Gratitude', icon: Heart },
    { id: 'pomodoro', label: 'Pomodoro', icon: Clock },
    { id: 'challenges', label: 'Challenges', icon: Target }
  ];

  // Confetti component for Gratitude Celebration
  const Confetti = () => {
    return (
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {[...Array(50)].map((_, i) => {
          const colors = ['#0D9488', '#A78BFA', '#F59E0B', '#EF4444', '#14B8A6'];
          const color = colors[Math.floor(Math.random() * colors.length)];
          const left = `${Math.random() * 100}%`;
          const animationDuration = `${2 + Math.random() * 3}s`;
          const animationDelay = `${Math.random() * 0.5}s`;
          
          return (
            <div 
              key={i}
              className="absolute top-0 w-3 h-3 rounded-sm confetti-piece"
              style={{
                left,
                backgroundColor: color,
                animationDuration,
                animationDelay,
              }}
            />
          );
        })}
      </div>
    );
  };

  const completedCount = completedChallenges.length;
  const progressPercentage = Math.round((completedCount / challenges.length) * 100);

  return (
    <div className={`min-h-screen bg-background-light dark:bg-background-dark transition-all duration-700 ${isMeditating ? 'bg-gray-900 dark:bg-black' : ''}`}>
      {/* Zen Mode Overlay for Meditation */}
      {isMeditating && (
        <div className="fixed inset-0 bg-black/80 z-40 transition-opacity duration-1000 pointer-events-none" />
      )}
      
      {gratitudeSubmitted && <Confetti />}

      <div className={isMeditating ? 'opacity-10 pointer-events-none transition-opacity duration-1000' : 'transition-opacity duration-1000'}>
        <Navbar />
      </div>

      <div className="flex relative">
        <div className={isMeditating ? 'opacity-10 pointer-events-none transition-opacity duration-1000' : 'transition-opacity duration-1000'}>
          <Sidebar />
        </div>

        <main className={`flex-1 p-4 lg:p-8 lg:ml-64 ${isMeditating ? 'relative z-50' : ''}`}>
          <div className="max-w-4xl mx-auto">
            <div className={`mb-8 transition-opacity duration-1000 ${isMeditating ? 'opacity-0' : 'opacity-100'}`}>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Wellness Activities</h1>
              <p className="text-gray-500 dark:text-gray-400">
                Take a break and engage in activities that nurture your wellbeing
              </p>
            </div>

            <div className={`flex flex-wrap gap-2 mb-6 transition-opacity duration-1000 ${isMeditating ? 'opacity-0' : 'opacity-100'}`}>
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary dark:bg-primary text-white scale-105 shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-105'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {activeTab === 'breathing' && (
              <div className="space-y-6 animate-fadeIn">
                {!breathingExercise ? (
                  <div className="grid md:grid-cols-3 gap-4">
                    {BREATHING_EXERCISES.map((ex, i) => (
                      <Card key={i} className="text-center cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-primary/30" onClick={() => startBreathing(ex)}>
                        <h3 className="font-semibold text-gray-800 dark:text-white mb-2">{ex.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{ex.cycles} cycles</p>
                        <Button size="sm" className="w-full">Start Session</Button>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <>
                    {!breathingExercise.manual ? (
                      <Card className="text-center relative overflow-hidden py-12">
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">{breathingExercise.name}</h3>
                        <div className="relative w-64 h-64 mx-auto mb-12 flex items-center justify-center">
                          {/* Aura layers for breathing animation */}
                          <div 
                            className={`absolute inset-0 rounded-full bg-primary/10 dark:bg-primary/20 transition-transform ease-in-out ${
                              breathingExercise.instructions[breathingPhase]?.action === 'inhale' || breathingExercise.instructions[breathingPhase]?.action === 'hold' && breathingPhase !== 0
                                ? 'scale-150' 
                                : 'scale-75'
                            }`}
                            style={{ transitionDuration: `${breathingExercise.instructions[breathingPhase]?.duration}ms` }} 
                          />
                          <div 
                            className={`absolute inset-4 rounded-full bg-primary/20 dark:bg-primary/30 transition-transform ease-in-out delay-75 ${
                              breathingExercise.instructions[breathingPhase]?.action === 'inhale' || breathingExercise.instructions[breathingPhase]?.action === 'hold' && breathingPhase !== 0
                                ? 'scale-125' 
                                : 'scale-90'
                            }`}
                            style={{ transitionDuration: `${breathingExercise.instructions[breathingPhase]?.duration}ms` }}
                          />
                          <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/40 flex items-center justify-center z-10">
                            <span className="text-6xl font-bold text-white drop-shadow-md">
                              {Math.ceil(breathingTimer / 10)}
                            </span>
                          </div>
                        </div>
                        <div className="h-12 flex items-center justify-center">
                          <p key={breathingPhase} className="text-2xl font-medium text-primary dark:text-primary animate-fadeIn">
                            {breathingExercise.instructions[breathingPhase]?.text}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-8 font-medium">
                          Cycle {breathingCycle + 1} of {breathingExercise.cycles}
                        </p>
                        <Button onClick={stopBreathing} variant="secondary" className="px-8">End Session</Button>
                      </Card>
                    ) : (
                      <Card 
                        className="text-center relative overflow-hidden py-12 select-none cursor-pointer" 
                        onMouseDown={() => setIsHolding(true)}
                        onMouseUp={() => setIsHolding(false)}
                        onMouseLeave={() => setIsHolding(false)}
                        onTouchStart={() => setIsHolding(true)}
                        onTouchEnd={() => setIsHolding(false)}
                      >
                        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-8">Free Breathe</h3>
                        
                        <div className="relative w-64 h-64 mx-auto mb-12 flex items-center justify-center">
                          <div className={`absolute inset-0 rounded-full bg-primary/10 dark:bg-primary/20 transition-transform duration-[2000ms] ease-out ${isHolding ? 'scale-150' : 'scale-75'}`} />
                          <div className={`absolute inset-4 rounded-full bg-primary/20 dark:bg-primary/30 transition-transform duration-[2000ms] ease-out delay-75 ${isHolding ? 'scale-125' : 'scale-90'}`} />
                          <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/40 flex items-center justify-center z-10 hover:scale-105 transition-transform duration-300">
                            <span className="text-2xl font-bold text-white drop-shadow-md px-4 text-center">
                              {isHolding ? 'Release to Exhale' : 'Hold to Inhale'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="h-12 flex items-center justify-center">
                          <p className="text-lg font-medium text-primary dark:text-primary">
                            {isHolding ? 'Inhaling deeply...' : 'Exhaling slowly...'}
                          </p>
                        </div>
                        
                        <p className="text-gray-500 mb-8 mt-2">Touch and hold anywhere to inhale. Release to exhale.</p>
                        
                        <div className="relative z-20">
                          <Button onClick={stopBreathing} variant="secondary" className="px-8">End Session</Button>
                        </div>
                      </Card>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === 'meditation' && (
              <div className="animate-fadeIn">
                <Card className={`text-center transition-all duration-1000 ${isMeditating ? 'bg-transparent border-none shadow-none text-white' : ''}`}>
                  <div className={`relative w-64 h-64 mx-auto mb-8 flex items-center justify-center transition-all duration-1000 ${isMeditating ? 'scale-110' : ''}`}>
                    {/* Slow spinning gradient mesh for Zen Mode */}
                    <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-accent/40 via-primary/40 to-purple-500/40 blur-xl animate-spin-slow ${isMeditating ? 'opacity-100' : 'opacity-40'}`} />
                    <div className={`absolute inset-4 rounded-full border border-white/20 backdrop-blur-sm flex items-center justify-center ${isMeditating ? 'bg-white/5' : 'bg-white/80 dark:bg-gray-800/80'}`}>
                      <span className={`text-6xl font-light tabular-nums ${isMeditating ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'text-gray-800 dark:text-white'}`}>
                        {formatTime(meditationTime)}
                      </span>
                    </div>
                  </div>
                  <p className={`mb-8 text-lg font-medium transition-colors duration-1000 ${isMeditating ? 'text-gray-300' : 'text-gray-600 dark:text-gray-300'}`}>
                    {isMeditating ? 'Focus entirely on your breath. Let thoughts pass.' : 'Select a duration to enter Zen Mode'}
                  </p>
                  {!isMeditating ? (
                    <div className="flex justify-center space-x-4">
                      <Button onClick={() => startMeditation(180)} className="hover:scale-105 transition-transform">3 min</Button>
                      <Button onClick={() => startMeditation(300)} className="hover:scale-105 transition-transform">5 min</Button>
                      <Button onClick={() => startMeditation(600)} className="hover:scale-105 transition-transform">10 min</Button>
                    </div>
                  ) : (
                    <button onClick={stopMeditation} className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/30 transition-all">
                      Gently Stop
                    </button>
                  )}
                </Card>
              </div>
            )}

            {activeTab === 'gratitude' && (
              <div className="animate-fadeIn">
                <Card className="overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent/20 to-transparent rounded-bl-full -mr-4 -mt-4" />
                  {!gratitudeSubmitted ? (
                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 text-center">
                        Daily Gratitude
                      </h3>
                      <p className="text-center text-gray-500 mb-8">Reflect on three things that brought you joy today.</p>
                      
                      <div className="space-y-4">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="animate-fadeIn" style={{ animationDelay: `${i * 100}ms` }}>
                            <input
                              type="text"
                              value={gratitude[i]}
                              onChange={(e) => {
                                const newGratitude = [...gratitude];
                                newGratitude[i] = e.target.value;
                                setGratitude(newGratitude);
                              }}
                              placeholder={`I am grateful for...`}
                              className="w-full px-5 py-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary transition-all outline-none"
                            />
                          </div>
                        ))}
                      </div>
                      <Button 
                        onClick={() => setGratitudeSubmitted(true)} 
                        className="w-full mt-8 py-3 text-lg group overflow-hidden relative"
                        disabled={!gratitude.every(g => g.trim())}
                      >
                        <span className="relative z-10 group-hover:tracking-wider transition-all duration-300">Save Journal Entry</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 animate-fadeIn">
                      <div className="w-20 h-20 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-6 animate-pop">
                        <Heart className="w-10 h-10 text-green-500 fill-green-500 animate-pulse-soft" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">Wonderful!</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
                        Taking time to appreciate the good things fundamentally rewires your brain for happiness.
                      </p>
                      <Button onClick={() => { setGratitude(['', '', '']); setGratitudeSubmitted(false); }} variant="secondary">
                        Write Another Entry
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {activeTab === 'pomodoro' && (
              <div className="animate-fadeIn">
                <Card className="text-center py-8">
                  <div className="flex justify-center space-x-2 mb-8">
                    {[1, 2, 3, 4].map(s => (
                      <div key={s} className={`w-3 h-3 rounded-full transition-colors duration-300 ${s <= pomodoroSession ? 'bg-primary dark:bg-primary shadow-[0_0_8px_rgba(13,148,136,0.5)]' : 'bg-gray-200 dark:bg-gray-700'}`} />
                    ))}
                  </div>
                  
                  <div className="relative w-64 h-64 mx-auto mb-8">
                    {/* SVG Circular Progress Bar */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" className="text-gray-100 dark:text-gray-800" strokeWidth="4" />
                      {/* Progress circle */}
                      <circle 
                        cx="50" cy="50" r="45" 
                        fill="none" 
                        stroke="currentColor" 
                        className="text-primary dark:text-primary transition-all duration-1000 ease-linear" 
                        strokeWidth="4" 
                        strokeDasharray="283" 
                        strokeDashoffset={283 - ((25 * 60 - pomodoroTime) / (25 * 60)) * 283}
                        strokeLinecap="round"
                      />
                    </svg>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-bold text-gray-800 dark:text-white tracking-tight tabular-nums">
                        {formatTime(pomodoroTime)}
                      </span>
                      <span className="text-sm font-medium text-gray-500 mt-2 uppercase tracking-widest">Focus</span>
                    </div>
                  </div>

                  {!isPomodoroRunning ? (
                    <Button onClick={startPomodoro} className="px-10 py-3 text-lg rounded-full hover:scale-105 transition-transform shadow-lg shadow-primary/20">
                      Start Session {pomodoroSession}
                    </Button>
                  ) : (
                    <Button onClick={stopPomodoro} variant="secondary" className="px-10 py-3 text-lg rounded-full hover:scale-105 transition-transform">
                      Pause
                    </Button>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 font-medium">
                    25 min focus • 5 min break
                  </p>
                </Card>
              </div>
            )}

            {activeTab === 'challenges' && (
              <div className="animate-fadeIn">
                <Card className="mb-6 bg-gradient-to-r from-primary/10 to-accent/10 border-none">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-gray-800 dark:text-white text-lg">Daily Progress</h3>
                    <span className="font-bold text-primary dark:text-primary">{progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-white/50 dark:bg-gray-800/50 h-3 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  {progressPercentage === 100 && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-3 font-medium flex items-center justify-center animate-fadeIn">
                      <CheckCircle className="w-4 h-4 mr-1" /> Amazing! You completed all wellness challenges today.
                    </p>
                  )}
                </Card>

                <div className="grid md:grid-cols-1 gap-3">
                  {challenges.map(challenge => {
                    const isCompleted = completedChallenges.includes(challenge.id);
                    return (
                      <div 
                        key={challenge.id} 
                        className={`group cursor-pointer p-4 rounded-xl border transition-all duration-300 transform ${
                          isCompleted 
                            ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30 opacity-70 scale-[0.98]' 
                            : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5'
                        }`}
                        onClick={() => {
                          const el = document.getElementById(`challenge-${challenge.id}`);
                          if (el && !isCompleted) {
                            el.classList.add('animate-pop');
                            setTimeout(() => el.classList.remove('animate-pop'), 300);
                          }
                          toggleChallenge(challenge.id);
                        }}
                        id={`challenge-${challenge.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-colors duration-300 ${isCompleted ? 'bg-green-100 dark:bg-green-800/40' : 'bg-gray-50 dark:bg-gray-700 group-hover:bg-primary/10'}`}>
                              {challenge.icon}
                            </div>
                            <span className={`font-medium transition-all duration-300 ${isCompleted ? 'line-through text-green-700/60 dark:text-green-400/60' : 'text-gray-800 dark:text-white group-hover:text-primary'}`}>
                              {challenge.text}
                            </span>
                          </div>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${isCompleted ? 'bg-green-500 text-white scale-110' : 'border-2 border-gray-300 dark:border-gray-600 group-hover:border-primary'}`}>
                            {isCompleted && <CheckCircle className="w-4 h-4" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}


