import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { userAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { Brain, ArrowRight, AlertCircle } from 'lucide-react';

export default function Signup() {
  const { login } = useApp();
  const navigate = useNavigate();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [program, setProgram] = useState('');
  const [department, setDepartment] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [section, setSection] = useState('');
  const [universityRollNo, setUniversityRollNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim()) {
      setError('Name and email are required');
      return;
    }

    if (password && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const payload = { name, email, password, role };
      if (role === 'student') {
        Object.assign(payload, { program, department, yearOfStudy, section, universityRollNo });
      }
      const { data } = await userAPI.register(payload);
      login(data);
      const actualUser = data.user || data;
      toast.success('Account created successfully!');
      navigate(actualUser.role === 'admin' ? '/admin' : actualUser.role === 'counsellor' ? '/counsellor' : '/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response?.status === 409) {
        setError('An account with this email already exists. Please sign in instead.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-sans selection:bg-primary/30 selection:text-primary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Mesh */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 dark:bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-accent/10 blur-[120px]" />
        <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full bg-emerald-400/10 dark:bg-emerald-600/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fadeIn my-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent dark:from-primary dark:to-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/20 transform hover:scale-105 transition-transform duration-300">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Join MindBridge</h1>
          <p className="text-gray-600 dark:text-gray-400">Create your account to get started</p>
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
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane.doe@university.edu"
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
              <p className="text-xs text-gray-500 mt-2 font-medium">Optional but recommended for account security</p>
            </div>

            {password && (
              <div className="animate-fadeIn">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-400"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 mt-2">I am a...</label>
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

            {role === 'student' && (
              <div className="space-y-5 pt-4 border-t border-gray-200 dark:border-gray-700 animate-fadeIn">
                <h3 className="text-sm font-bold text-primary dark:text-primary uppercase tracking-wider">Academic Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Program</label>
                    <select
                      value={program}
                      onChange={(e) => setProgram(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-primary outline-none transition-all"
                    >
                      <option value="">Select Program</option>
                      <option value="B.Tech">B.Tech</option>
                      <option value="M.Tech">M.Tech</option>
                      <option value="MBA">MBA</option>
                      <option value="B.Sc">B.Sc</option>
                      <option value="Ph.D">Ph.D</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-primary outline-none transition-all"
                    >
                      <option value="">Select Dept</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Business">Business</option>
                      <option value="Psychology">Psychology</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Year</label>
                    <select
                      value={yearOfStudy}
                      onChange={(e) => setYearOfStudy(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-primary outline-none transition-all"
                    >
                      <option value="">Select Year</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year (Final)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Section</label>
                    <input
                      type="text"
                      value={section}
                      onChange={(e) => setSection(e.target.value.toUpperCase())}
                      placeholder="e.g. A"
                      maxLength="2"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-primary outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">University Roll Number</label>
                  <input
                    type="text"
                    value={universityRollNo}
                    onChange={(e) => setUniversityRollNo(e.target.value)}
                    placeholder="e.g. 21CS01A"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary dark:focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 flex items-center justify-center space-x-2 px-6 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold hover:shadow-xl hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white/30 dark:border-gray-900/30 border-t-white dark:border-t-gray-900 rounded-full animate-spin" />
                <span>Creating account...</span>
              </div>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-8 space-y-3 relative z-10">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary dark:text-primary font-bold hover:underline transition-all">
              Sign in
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


