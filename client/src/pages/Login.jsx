import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { userAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Brain, ArrowRight, AlertCircle } from 'lucide-react';

export default function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    try {
      const { data } = await userAPI.login({ email, password });
      login(data);
      const actualUser = data.user || data;
      toast.success(`Welcome back, ${actualUser.name}!`);
      navigate(actualUser.role === 'admin' ? '/admin' : actualUser.role === 'counsellor' ? '/counsellor' : '/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.status === 403) {
        setError('Account is deactivated. Please contact admin.');
      } else if (err.response?.status === 401) {
        setError('Invalid email or password');
      } else {
        setError('Unable to connect. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans selection:bg-primary/30 selection:text-primary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Mesh */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 dark:bg-primary/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[50%] rounded-full bg-blue-400/10 dark:bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fadeIn">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent dark:from-primary dark:to-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/20 transform hover:scale-105 transition-transform duration-300">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-gray-600 dark:text-gray-400">Continue your wellness journey with MindBridge</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm flex items-center">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 mt-2">Sign in as...</label>
              <div className="grid grid-cols-3 gap-3">
                {['student', 'counsellor', 'admin'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`px-4 py-3 rounded-2xl font-semibold capitalize transition-all duration-300 ${
                      role === r
                        ? 'bg-gradient-to-r from-primary to-accent dark:from-primary dark:to-accent text-white shadow-lg shadow-primary/20 scale-[1.02]'
                        : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 flex items-center justify-center space-x-2 px-6 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 dark:border-gray-900/30 border-t-white dark:border-t-gray-900 rounded-full animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-8 space-y-3 relative z-10">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary dark:text-primary font-bold hover:underline transition-all">
              Sign up for free
            </Link>
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            <Link to="/landing" className="hover:text-gray-800 dark:hover:text-gray-300 transition-colors">
              Return to Homepage
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


