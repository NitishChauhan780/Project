import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useApp } from '../context/AppContext';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Card from '../components/common/Card';
import CrisisAlert from '../components/common/CrisisAlert';
import { aiAPI, chatHistoryAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { MessageCircle, Send as SendIcon, Sparkles, Phone, Loader, Trash2 } from 'lucide-react';

export default function MindBotPage() {
  const { user } = useApp();
  const toast = useToast();
  const [messages, setMessages] = useState([
    {
      role: 'model',
      content: "Hello! I'm MindBot, your mental health support companion. I'm here to listen, support you, and help you navigate through difficult times. How are you feeling today? 😊",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (user?._id && !user._id.startsWith('temp-')) {
      loadChatHistory();
    } else {
      setHistoryLoaded(true);
    }
  }, [user]);

  const loadChatHistory = async () => {
    try {
      const { data } = await chatHistoryAPI.get(user._id);
      if (data && data.length > 0) {
        const historyMessages = data.map(m => ({
          role: m.role === 'assistant' ? 'model' : m.role,
          content: m.content,
          timestamp: new Date(m.timestamp)
        }));
        setMessages(historyMessages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setHistoryLoaded(true);
    }
  };

  const saveMessage = async (role, content) => {
    if (!user?._id || user._id.startsWith('temp-')) return;
    try {
      await chatHistoryAPI.add(user._id, role, content);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const clearChat = async () => {
    if (!confirm('Are you sure you want to clear chat history?')) return;
    try {
      await chatHistoryAPI.clear(user._id);
      setMessages([{
        role: 'model',
        content: "Chat history cleared. How are you feeling today? 😊",
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error clearing chat:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    saveMessage('user', input);

    try {
      const history = messages.slice(-20).map(m => ({ role: m.role === 'model' ? 'assistant' : m.role, content: m.content }));
      const { data } = await aiAPI.chat(input, history, user);
      
      const botMessage = {
        role: 'model',
        content: data.message,
        isCrisis: data.isCrisis,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      saveMessage('assistant', data.message);

      if (data.isCrisis) {
        setShowCrisis(true);
        toast.warning('Crisis detection: Please consider reaching out to support');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const backendMessage = error.response?.data?.message || 'Unable to get response. Please try again.';
      toast.error(backendMessage);
      
      const errorMessage = {
        role: 'model',
        content: `I'm having trouble responding right now. \n\n**Technical Details:** ${backendMessage}\n\nIf you need immediate help, please reach out to our crisis helpline. You are not alone. 💙`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "I'm feeling stressed about placements",
    "I'm having trouble sleeping lately",
    "How to handle academic pressure?",
    "I feel lonely in the hostel",
    "How to talk to my parents about mental health?",
    "Need some quick self-care tips"
  ];

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 lg:ml-64">
          <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                  <MessageCircle className="w-7 h-7 mr-2 text-primary dark:text-primary" />
                  MindBot
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">AI-powered 24/7 mental health support</p>
              </div>
              <div className="flex items-center space-x-2">
                {user?._id && !user._id.startsWith('temp-') && historyLoaded && messages.length > 1 && (
                  <button
                    onClick={clearChat}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Clear chat history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setShowCrisis(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span className="font-medium">Crisis Help</span>
                </button>
              </div>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-4 p-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-primary dark:bg-primary text-white'
                          : msg.isCrisis
                          ? 'bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white'
                      }`}
                    >
                      <div className="prose dark:prose-invert max-w-none">
                        <ReactMarkdown 
                          components={{
                            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                            li: ({node, ...props}) => <li className="mb-1" {...props} />,
                            strong: ({node, ...props}) => <span className="font-bold text-primary dark:text-primary" {...props} />,
                            a: ({node, ...props}) => (
                              <Link 
                                to={props.href} 
                                className="text-primary dark:text-primary underline hover:opacity-80 font-medium"
                              >
                                {props.children}
                              </Link>
                            )
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                      <p className={`text-[10px] mt-2 ${
                        msg.role === 'user' ? 'text-white/70' : 'text-gray-400'
                      }`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-primary dark:text-primary animate-pulse" />
                        <span className="text-gray-500 dark:text-gray-400">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message... (supports Hindi/Hinglish)"
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-primary transition-all"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="px-6 py-3 bg-primary dark:bg-primary text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
                  >
                    {loading ? <Loader className="w-5 h-5 animate-spin" /> : <SendIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </Card>

            <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              <p>
                MindBot is an AI assistant and not a replacement for professional help.
                <button 
                  onClick={() => setShowCrisis(true)}
                  className="text-red-500 hover:underline ml-1"
                >
                  Need immediate help?
                </button>
              </p>
            </div>
          </div>
        </main>
      </div>
      
      {showCrisis && <CrisisAlert onClose={() => setShowCrisis(false)} />}
    </div>
  );
}


