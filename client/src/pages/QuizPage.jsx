import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useApp } from '../context/AppContext';
import { quizAPI } from '../services/api';
import { SEVERITY_COLORS, QUIZ_TYPES } from '../utils/constants';
import { ArrowLeft, ArrowRight, CheckCircle, Info } from 'lucide-react';

const QUIZ_QUESTIONS = {
  'PHQ-9': [
    { text: 'Little interest or pleasure in doing things', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
    { text: 'Feeling down, depressed, or hopeless', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
    { text: 'Trouble falling or staying asleep, or sleeping too much', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
    { text: 'Feeling tired or having little energy', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
    { text: 'Poor appetite or overeating', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
    { text: 'Feeling bad about yourself — or that you are a failure or have let yourself or your family down', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
    { text: 'Trouble concentrating on things, such as reading the newspaper or watching television', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
    { text: 'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
    { text: 'Thoughts that you would be better off dead or of hurting yourself in some way', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] }
  ],
  'GAD-7': [
    { text: 'Feeling nervous, anxious, or on edge', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
    { text: 'Not being able to stop or control worrying', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
    { text: 'Worrying too much about different things', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
    { text: 'Trouble relaxing', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
    { text: 'Being so restless that it is hard to sit still', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
    { text: 'Becoming easily annoyed or irritable', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] },
    { text: 'Feeling afraid, as if something awful might happen', options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'] }
  ],
  'PSS-10': [
    { text: 'In the last month, how often have you been upset because of something that happened unexpectedly?', options: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often'] },
    { text: 'In the last month, how often have you felt that you were unable to control the important things in your life?', options: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often'] },
    { text: 'In the last month, how often have you felt nervous and stressed?', options: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often'] },
    { text: 'In the last month, how often have you felt confident about your ability to handle your personal problems?', options: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often'] },
    { text: 'In the last month, how often have you felt that things were going your way?', options: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often'] },
    { text: 'In the last month, how often have you found that you could not cope with all the things that you had to do?', options: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often'] },
    { text: 'In the last month, how often have you been able to control irritations in your life?', options: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often'] },
    { text: 'In the last month, how often have you felt that you were on top of things?', options: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often'] },
    { text: 'In the last month, how often have you been angered because of things that happened that were outside of your control?', options: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often'] },
    { text: 'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?', options: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often'] }
  ],
  'ISI': [
    { text: 'Difficulty falling asleep', options: ['None', 'Mild', 'Moderate', 'Severe', 'Very Severe'] },
    { text: 'Difficulty staying asleep', options: ['None', 'Mild', 'Moderate', 'Severe', 'Very Severe'] },
    { text: 'Problems waking up too early', options: ['None', 'Mild', 'Moderate', 'Severe', 'Very Severe'] },
    { text: 'How satisfied are you with your current sleep pattern?', options: ['Very satisfied', 'Satisfied', 'Neutral', 'Dissatisfied', 'Very dissatisfied'] },
    { text: 'To what extent do you consider your sleep problem to interfere with your daily functioning?', options: ['Not at all', 'A little', 'Somewhat', 'Much', 'Very much'] },
    { text: 'How worried are you about your current sleep problem?', options: ['Not at all', 'A little', 'Somewhat', 'Much', 'Very much'] },
    { text: 'To what extent do you consider your sleep problem to interfere with your quality of life?', options: ['Not at all', 'A little', 'Somewhat', 'Much', 'Very much'] }
  ],
  'GHQ-12': [
    { text: 'Have you been able to concentrate on whatever you\'re doing?', options: ['Better than usual', 'Same as usual', 'Less than usual', 'Much less than usual'] },
    { text: 'Have you lost much sleep over worry?', options: ['Not at all', 'No more than usual', 'Rather more than usual', 'Much more than usual'] },
    { text: 'Have you felt that you are playing a useful part in things?', options: ['More so than usual', 'Same as usual', 'Less so than usual', 'Much less'] },
    { text: 'Have you felt capable of making decisions about things?', options: ['More so than usual', 'Same as usual', 'Less so than usual', 'Much less'] },
    { text: 'Have you felt under constant strain?', options: ['Not at all', 'No more than usual', 'Rather more than usual', 'Much more than usual'] },
    { text: 'Have you felt that you couldn\'t overcome your difficulties?', options: ['Not at all', 'No more than usual', 'Rather more than usual', 'Much more than usual'] },
    { text: 'Have you been able to enjoy your normal day-to-day activities?', options: ['More so than usual', 'Same as usual', 'Less so than usual', 'Much less'] },
    { text: 'Have you been able to face up to your problems?', options: ['More so than usual', 'Same as usual', 'Less so than usual', 'Much less'] },
    { text: 'Have you been feeling unhappy or depressed?', options: ['Not at all', 'No more than usual', 'Rather more than usual', 'Much more than usual'] },
    { text: 'Have you been losing confidence in yourself?', options: ['Not at all', 'No more than usual', 'Rather more than usual', 'Much more than usual'] },
    { text: 'Have you been thinking of yourself as a worthless person?', options: ['Not at all', 'No more than usual', 'Rather more than usual', 'Much more than usual'] },
    { text: 'Have you been feeling reasonably happy, all things considered?', options: ['More so than usual', 'Same as usual', 'Less so than usual', 'Much less'] }
  ]
};

export default function QuizPage() {
  const { type } = useParams();
  const navigate = useNavigate();
  const { user } = useApp();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const quiz = QUIZ_TYPES.find(q => q.type === type);
  const questions = QUIZ_QUESTIONS[type] || [];
  const totalQuestions = questions.length;

  const handleAnswer = (value) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user?._id) return;
    setLoading(true);
    
    try {
      const answerValues = questions.map((_, i) => answers[i] || 0);
      const { data } = await quizAPI.submit({
        userId: user._id,
        quizType: type,
        answers: answerValues
      });
      setResult(data);
      setSubmitted(true);
    } catch (error) {
      console.error('Quiz submission error:', error);
      const score = questions.map((_, i) => answers[i] || 0).reduce((a, b) => a + b, 0);
      setResult({ 
        score, 
        severity: 'completed', 
        recommendation: 'Thank you for completing this assessment. Please consult a mental health professional for interpretation.' 
      });
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const maxScore = type === 'PHQ-9' ? 27 : 
    type === 'GAD-7' ? 21 : 
    type === 'PSS-10' ? 40 : 
    type === 'ISI' ? 28 : 36;

  if (!quiz) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8 flex items-center justify-center">
            <Card>
              <p className="text-gray-500">Quiz not found</p>
              <Button onClick={() => navigate('/quiz')} className="mt-4">Back to Quizzes</Button>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-4 lg:p-8 lg:ml-64">
            <div className="max-w-2xl mx-auto">
              <Card className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Assessment Complete!</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">{quiz.name}</p>
                
                <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl p-6 mb-6">
                  <p className="text-5xl font-bold text-primary dark:text-primary mb-2">{result.score}</p>
                  <p className="text-gray-500 dark:text-gray-400">out of {maxScore}</p>
                  <div className="mt-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${SEVERITY_COLORS[result.severity] || ''}`}>
                      {result.severity.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="text-left bg-white dark:bg-gray-800 rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Recommendation</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{result.recommendation}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={() => navigate('/quiz')} variant="secondary" className="flex-1">
                    Take Another Quiz
                  </Button>
                  <Button onClick={() => navigate('/appointments')} className="flex-1">
                    Book Counsellor
                  </Button>
                </div>
              </Card>
            </div>
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
            <div className="flex items-center mb-6">
              <button onClick={() => navigate('/quiz')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <ArrowLeft className="w-5 h-5 text-gray-500" />
              </button>
              <div className="ml-4 flex-1">
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white">{quiz.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Question {currentQuestion + 1} of {totalQuestions}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            <Card>
              <div className="mb-8">
                <span className="text-5xl mb-4 block">{quiz.icon}</span>
                <h2 className="text-xl font-medium text-gray-800 dark:text-white">
                  {questions[currentQuestion]?.text}
                </h2>
              </div>

              <div className="space-y-3">
                {questions[currentQuestion]?.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    className={`w-full p-4 rounded-xl text-left transition-all ${
                      answers[currentQuestion] === index
                        ? 'bg-primary dark:bg-primary text-white shadow-md'
                        : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="font-medium">{option}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between mt-8">
                <Button 
                  onClick={handlePrev} 
                  disabled={currentQuestion === 0}
                  variant="ghost"
                >
                  Previous
                </Button>
                
                {currentQuestion === totalQuestions - 1 ? (
                  <Button onClick={handleSubmit} disabled={loading} icon={CheckCircle}>
                    {loading ? 'Submitting...' : 'Submit'}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleNext}
                    disabled={answers[currentQuestion] === undefined}
                    icon={ArrowRight}
                  >
                    Next
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}


