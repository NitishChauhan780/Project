import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import Card from '../components/common/Card';
import { QUIZ_TYPES, SEVERITY_COLORS } from '../utils/constants';
import { ClipboardList, ArrowRight, Clock, Info } from 'lucide-react';

export default function QuizList() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-8 lg:ml-64">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Mental Health Assessments</h1>
              <p className="text-gray-500 dark:text-gray-400">
                Take these validated screening tools to understand your mental health better
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-8 flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700 dark:text-blue-300">
                These assessments are screening tools only and not a diagnosis. If you have concerns, please speak with a mental health professional.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {QUIZ_TYPES.map((quiz) => {
                const maxScore = quiz.type === 'PHQ-9' ? 27 : 
                  quiz.type === 'GAD-7' ? 21 : 
                  quiz.type === 'PSS-10' ? 40 : 
                  quiz.type === 'ISI' ? 28 : 36;
                
                return (
                  <Link key={quiz.type} to={`/quiz/${quiz.type}`}>
                    <Card className="h-full hover:shadow-xl transition-shadow cursor-pointer group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-accent/20 dark:from-primary/20 dark:to-accent/20 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">{quiz.icon}</span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary dark:group-hover:text-primary transition-colors" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">{quiz.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{quiz.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center">
                          <ClipboardList className="w-4 h-4 mr-1" />
                          {quiz.questions} questions
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          ~5 min
                        </span>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500 dark:text-gray-400">Score Range</span>
                          <span className="font-medium text-gray-700 dark:text-gray-300">0 - {maxScore}</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}


