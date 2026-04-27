import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useApp } from '../context/AppContext';
import { moodAPI } from '../services/api';
import { Wind, Smile, BookOpen, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { MOOD_LABELS } from '../utils/constants';

const MOODS = [
  { value: 5, emoji: '😄', label: 'Great', color: 'text-green-500' },
  { value: 4, emoji: '🙂', label: 'Good', color: 'text-green-400' },
  { value: 3, emoji: '😐', label: 'Okay', color: 'text-yellow-500' },
  { value: 2, emoji: '😔', label: 'Low', color: 'text-orange-500' },
  { value: 1, emoji: '😢', label: 'Struggling', color: 'text-red-500' }
];

const REASONS = [
  'Academic pressure', 'Sleep issues', 'Relationships', 'Family concerns',
  'Health worries', 'Financial stress', 'Career decisions', 'Social isolation',
  'Self-doubt', 'Burnout', 'Other'
];

const BREATHING_EXERCISES = [
  { name: '4-7-8 Breathing', duration: 60, description: 'Inhale 4s, Hold 7s, Exhale 8s' },
  { name: 'Box Breathing', duration: 60, description: '4s in, 4s hold, 4s out, 4s hold' }
];

export default function DailyCheckIn() {
  const { user } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState(null);
  const [reasons, setReasons] = useState([]);
  const [note, setNote] = useState('');
  const [breathingExercise, setBreathingExercise] = useState(null);
  const [breathingTime, setBreathingTime] = useState(0);
  const [gratitude, setGratitude] = useState(['', '', '']);
  const [breathingInterval, setBreathingInterval] = useState(null);
  const [completed, setCompleted] = useState(false);

  const steps = ['Mood', 'Reasons', 'Breathing', 'Gratitude', 'Complete'];

  useEffect(() => {
    return () => {
      if (breathingInterval) clearInterval(breathingInterval);
    };
  }, [breathingInterval]);

  const toggleReason = (reason) => {
    setReasons(prev =>
      prev.includes(reason) ? prev.filter(r => r !== reason) : [...prev, reason]
    );
  };

  const startBreathing = (exercise) => {
    setBreathingExercise(exercise);
    setBreathingTime(exercise.duration);
    const interval = setInterval(() => {
      setBreathingTime(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setBreathingInterval(null);
          setBreathingExercise(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setBreathingInterval(interval);
  };

  const skipBreathing = () => {
    if (breathingInterval) clearInterval(breathingInterval);
    setBreathingExercise(null);
    setBreathingTime(0);
  };

  const handleComplete = async () => {
    if (!mood) return;
    try {
      await moodAPI.create({
        userId: user._id,
        mood,
        reasons,
        note,
        date: new Date()
      });
      setCompleted(true);
    } catch (error) {
      console.error('Error saving check-in:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canProceed = () => {
    switch (step) {
      case 0: return mood !== null;
      case 2: return breathingExercise === null || breathingTime === 0;
      default: return true;
    }
  };

  const nextStep = () => {
    if (step === 4) {
      handleComplete();
    } else {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-4 lg:p-8 flex items-center justify-center">
            <Card className="max-w-md text-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                Check-in Complete!
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Great job taking time for yourself today. Your mental health matters!
              </p>
              <div className="flex flex-col space-y-3">
                <Button onClick={() => navigate('/dashboard')} className="w-full">
                  Go to Dashboard
                </Button>
                <Button onClick={() => navigate('/journal')} variant="secondary" className="w-full">
                  Write in Journal
                </Button>
              </div>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 lg:ml-64">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Daily Check-In
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Take a moment to reflect and check in with yourself
              </p>
            </div>

            <div className="flex justify-center mb-8">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    i <= step ? 'bg-primary dark:bg-primary text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}>
                    {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-8 h-0.5 ${i < step ? 'bg-primary dark:bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`} />
                  )}
                </div>
              ))}
            </div>

            <Card>
              {step === 0 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
                    How are you feeling right now?
                  </h3>
                  <div className="grid grid-cols-5 gap-4">
                    {MOODS.map(m => (
                      <button
                        key={m.value}
                        onClick={() => setMood(m.value)}
                        className={`p-4 rounded-xl text-center transition-all ${
                          mood === m.value
                            ? 'bg-primary dark:bg-primary text-white scale-110'
                            : 'bg-gray-100 dark:bg-gray-800 hover:scale-105'
                        }`}
                      >
                        <span className="text-4xl block mb-2">{m.emoji}</span>
                        <span className={`text-sm ${mood === m.value ? 'text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                          {m.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
                    What's on your mind? (Optional)
                  </h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {REASONS.map(reason => (
                      <button
                        key={reason}
                        onClick={() => toggleReason(reason)}
                        className={`px-4 py-2 rounded-full transition-all ${
                          reasons.includes(reason)
                            ? 'bg-primary dark:bg-primary text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Add a note (optional)
                    </label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Anything else you'd like to share..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                      rows="3"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="text-center">
                  {!breathingExercise ? (
                    <>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                        Take a Breathing Break
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">
                        A quick breathing exercise to help you reset
                      </p>
                      <div className="space-y-3">
                        {BREATHING_EXERCISES.map(ex => (
                          <button
                            key={ex.name}
                            onClick={() => startBreathing(ex)}
                            className="w-full p-4 bg-gray-100 dark:bg-gray-800 rounded-xl text-left hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-800 dark:text-white">{ex.name}</p>
                                <p className="text-sm text-gray-500">{ex.description}</p>
                              </div>
                              <span className="text-sm text-gray-500">{ex.duration}s</span>
                            </div>
                          </button>
                        ))}
                      </div>
                      <Button variant="secondary" onClick={skipBreathing} className="mt-4">
                        Skip for now
                      </Button>
                    </>
                  ) : (
                    <div>
                      <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <span className="text-4xl font-bold text-primary dark:text-primary">
                          {formatTime(breathingTime)}
                        </span>
                      </div>
                      <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">{breathingExercise.name}</p>
                      <Button variant="secondary" onClick={skipBreathing}>
                        Stop
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {step === 3 && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
                    What are you grateful for today?
                  </h3>
                  <div className="space-y-4">
                    {[0, 1, 2].map(i => (
                      <input
                        key={i}
                        type="text"
                        value={gratitude[i]}
                        onChange={(e) => {
                          const newGratitude = [...gratitude];
                          newGratitude[i] = e.target.value;
                          setGratitude(newGratitude);
                        }}
                        placeholder={`I'm grateful for ${i === 0 ? '...' : i === 1 ? '...' : '...'}`}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                      />
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                    You're all set!
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-left">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="text-3xl">{MOOD_LABELS[mood]?.emoji}</span>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">Feeling: {MOOD_LABELS[mood]?.label}</p>
                        {reasons.length > 0 && (
                          <p className="text-sm text-gray-500">Focus areas: {reasons.join(', ')}</p>
                        )}
                      </div>
                    </div>
                    <Button onClick={handleComplete} className="w-full">
                      Save Check-In
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <Button
                  variant="ghost"
                  onClick={prevStep}
                  disabled={step === 0}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={!canProceed() && step !== 4}
                >
                  {step === 3 ? 'Finish' : 'Next'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}


