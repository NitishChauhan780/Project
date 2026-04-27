import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/common/Sidebar';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useApp } from '../../context/AppContext';
import { adminUsersAPI, moodAPI, quizAPI, journalAPI } from '../../services/api';
import { User, ChevronRight, TrendingUp, FileText, MessageCircle, Calendar, Search } from 'lucide-react';

export default function StudentHistory() {
  const { user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentData(selectedStudent._id);
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      const { data } = await adminUsersAPI.getAll();
      const studentList = data.filter(u => u.role === 'student');
      setStudents(studentList);
      
      // Auto-select student from location state if available
      if (location.state?.selectStudentId) {
        const studentToSelect = studentList.find(s => s._id === location.state.selectStudentId);
        if (studentToSelect) {
          setSelectedStudent(studentToSelect);
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentData = async (studentId) => {
    try {
      const [moodRes, quizRes, journalRes] = await Promise.all([
        moodAPI.getAll(studentId),
        quizAPI.getAll(studentId),
        journalAPI.getAll(studentId)
      ]);

      const moodEntries = moodRes.data;
      const avgMood = moodEntries.length > 0
        ? (moodEntries.reduce((sum, m) => sum + m.mood, 0) / moodEntries.length).toFixed(1)
        : 'N/A';
      const currentStreak = moodEntries[0]?.streak || 0;

      setStudentData({
        moods: moodEntries.slice(0, 14),
        quizzes: quizRes.data,
        journals: journalRes.data,
        stats: {
          totalMoods: moodEntries.length,
          totalQuizzes: quizRes.data.length,
          totalJournals: journalRes.data.length,
          avgMood,
          currentStreak
        }
      });
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

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
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Student History</h1>
              <p className="text-gray-500 dark:text-gray-400">View student activity and progress</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-1 p-0">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search students..."
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                    />
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {filteredStudents.map(student => (
                    <div
                      key={student._id}
                      onClick={() => setSelectedStudent(student)}
                      className={`p-4 cursor-pointer border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                        selectedStudent?._id === student._id ? 'bg-primary/10 dark:bg-primary/10' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 dark:text-white">{student.name}</p>
                          <p className="text-sm text-gray-500">{student.email}</p>
                          {student.department && (
                             <span className="text-[10px] uppercase font-bold text-primary dark:text-primary mt-1 inline-block bg-primary/10 px-2 py-0.5 rounded-full">
                               {student.department} • Y{student.yearOfStudy}
                             </span>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="lg:col-span-2">
                {selectedStudent ? (
                  studentData ? (
                    <div>
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                          <span className="text-2xl text-white font-bold">
                            {selectedStudent.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-800 dark:text-white">{selectedStudent.name}</h2>
                          <p className="text-gray-500">{selectedStudent.email}</p>
                          {selectedStudent.department && (
                            <p className="text-sm font-medium text-primary dark:text-primary mt-1">
                              {selectedStudent.program} • {selectedStudent.department} • Year {selectedStudent.yearOfStudy}
                            </p>
                          )}
                          <p className="text-sm text-gray-400 mt-1">
                            Member since {new Date(selectedStudent.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                          <TrendingUp className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                          <p className="text-2xl font-bold text-gray-800 dark:text-white">{studentData.stats.avgMood}</p>
                          <p className="text-sm text-gray-500">Avg Mood</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                          <FileText className="w-6 h-6 text-orange-500 mx-auto mb-1" />
                          <p className="text-2xl font-bold text-gray-800 dark:text-white">{studentData.stats.currentStreak}</p>
                          <p className="text-sm text-gray-500">Day Streak</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                          <MessageCircle className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                          <p className="text-2xl font-bold text-gray-800 dark:text-white">{studentData.stats.totalQuizzes}</p>
                          <p className="text-sm text-gray-500">Quizzes</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                          <FileText className="w-6 h-6 text-green-500 mx-auto mb-1" />
                          <p className="text-2xl font-bold text-gray-800 dark:text-white">{studentData.stats.totalJournals}</p>
                          <p className="text-sm text-gray-500">Journals</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-800 dark:text-white">Recent Mood Entries</h3>
                        {studentData.moods.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {studentData.moods.map((mood, i) => (
                              <div
                                key={i}
                                className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center"
                                title={new Date(mood.date).toLocaleDateString()}
                              >
                                <span className="text-2xl">
                                  {mood.mood === 5 ? '😄' : mood.mood === 4 ? '🙂' : mood.mood === 3 ? '😐' : mood.mood === 2 ? '😔' : '😢'}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No mood entries yet</p>
                        )}

                        <h3 className="font-semibold text-gray-800 dark:text-white">Recent Quizzes</h3>
                        {studentData.quizzes.length > 0 ? (
                          <div className="space-y-2">
                            {studentData.quizzes.slice(0, 5).map((quiz, i) => (
                              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <div>
                                  <p className="font-medium text-gray-800 dark:text-white">{quiz.quizType}</p>
                                  <p className="text-sm text-gray-500">{new Date(quiz.date).toLocaleDateString()}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm ${
                                  quiz.severity === 'minimal' || quiz.severity === 'mild' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                                  quiz.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                }`}>
                                  {quiz.severity}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No quizzes taken yet</p>
                        )}

                        <h3 className="font-semibold text-gray-800 dark:text-white">Recent Journal Entries</h3>
                        {studentData.journals.length > 0 ? (
                          <div className="space-y-2">
                            {studentData.journals.slice(0, 3).map((journal, i) => (
                              <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p className="text-gray-800 dark:text-white">{journal.content?.substring(0, 150)}...</p>
                                <p className="text-sm text-gray-500 mt-1">
                                  {new Date(journal.date).toLocaleDateString()}
                                  {journal.sentimentScore && ` • Sentiment: ${(journal.sentimentScore * 100).toFixed(0)}% positive`}
                                </p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No journal entries yet</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <User className="w-16 h-16 mb-4 opacity-50" />
                    <p>Select a student to view their history</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


