import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { journalAPI } from '../services/api';
import { BookOpen, Send, Sparkles, Clock } from 'lucide-react';

export default function JournalPage() {
  const { user } = useApp();
  const [entries, setEntries] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, [user]);

  const fetchEntries = async () => {
    if (!user?._id) return;
    try {
      const { data } = await journalAPI.getAll(user._id);
      setEntries(data);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!content.trim() || !user?._id) return;
    setAnalyzing(true);
    
    try {
      const { data } = await journalAPI.create({
        userId: user._id,
        content
      });
      setCurrentAnalysis(data);
      setEntries(prev => [data, ...prev]);
      setContent('');
    } catch (error) {
      console.error('Error creating entry:', error);
      setCurrentAnalysis({
        sentiment: 'neutral',
        sentimentScore: 0.5,
        emotions: ['thoughtful'],
        insight: 'Thank you for sharing your thoughts. Taking time to reflect is a great practice for mental wellness.'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-500 bg-green-100 dark:bg-green-900';
      case 'negative': return 'text-red-500 bg-red-100 dark:bg-red-900';
      default: return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900';
    }
  };

  const getEmotionEmoji = (emotion) => {
    const emojis = {
      joy: '😊', sadness: '😢', anxiety: '😰', anger: '😠', fear: '😨',
      hope: '🌟', gratitude: '🙏', frustration: '😤', loneliness: '😔'
    };
    return emojis[emotion] || '💭';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
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
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">AI-Powered Journal</h1>
              <p className="text-gray-500 dark:text-gray-400">
                Express your thoughts freely. Our AI will help you understand your feelings.
              </p>
            </div>

            <Card className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="w-5 h-5 text-primary dark:text-primary" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Write Today's Entry</h2>
              </div>
              
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind today? Write freely - about your day, your feelings, your challenges, or anything you'd like to express..."
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-primary transition-all resize-none"
              />
              
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Your entries are completely private and only visible to you.
                </p>
                <Button 
                  onClick={handleAnalyze} 
                  disabled={!content.trim() || analyzing}
                  icon={Sparkles}
                >
                  {analyzing ? 'Analyzing...' : 'Analyze with AI'}
                </Button>
              </div>
            </Card>

            {currentAnalysis && (
              <Card className="mb-8 bg-gradient-to-br from-primary/5 to-accent/5">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-accent" />
                  AI Analysis
                </h3>
                
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Sentiment</p>
                    <span className={`px-4 py-2 rounded-full text-sm font-medium ${getSentimentColor(currentAnalysis.sentiment)}`}>
                      {currentAnalysis.sentiment?.toUpperCase()}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Score: {(currentAnalysis.sentimentScore * 100).toFixed(0)}%
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl md:col-span-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Detected Emotions</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {currentAnalysis.emotions?.map((emotion, i) => (
                        <span key={i} className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm">
                          {getEmotionEmoji(emotion)} {emotion}
                        </span>
                      )) || <span className="text-gray-500">None detected</span>}
                    </div>
                  </div>
                </div>

                <div className="bg-white/50 dark:bg-gray-800/50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">💙 AI's Insight</p>
                  <p className="text-gray-700 dark:text-gray-300 italic">
                    {currentAnalysis.insight}
                  </p>
                </div>

                <Button 
                  onClick={() => setCurrentAnalysis(null)} 
                  variant="ghost" 
                  className="w-full mt-4"
                >
                  Clear Analysis
                </Button>
              </Card>
            )}

            <Card title="Your Journal History" subtitle={`${entries.length} entries`}>
              {entries.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {entries.map((entry) => (
                    <div key={entry._id} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(entry.date).toLocaleDateString('en-US', {
                              weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(entry.sentiment)}`}>
                          {entry.sentiment}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 mb-3">{entry.content}</p>
                      {entry.insight && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic border-l-2 border-accent pl-3">
                          {entry.insight}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No journal entries yet. Start writing to see your history here.</p>
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}


