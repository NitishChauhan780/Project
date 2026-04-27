import { Heart, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { HELPLINES } from '../../utils/constants';

export default function SOSButton() {
  const [showModal, setShowModal] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-2xl flex items-center justify-center animate-pulse-glow hover:scale-110 transition-transform"
        style={{
          animation: 'pulse-glow 2s ease-in-out infinite',
        }}
      >
        <Heart className="w-8 h-8 text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-red-600">!</span>
        </span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 rounded-3xl shadow-2xl w-full max-w-md p-6 animate-bounce-in border-2 border-red-200 dark:border-red-800">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Heart className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-3xl font-bold text-red-700 dark:text-red-300 mb-2">Need Immediate Help?</h2>
              <p className="text-gray-600 dark:text-gray-300">
                If you're in crisis or having thoughts of self-harm, please reach out to these free, confidential helplines right away:
              </p>
            </div>

            <div className="space-y-3">
              {HELPLINES.map((helpline, index) => (
                <a
                  key={index}
                  href={`tel:${helpline.number}`}
                  className="block bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-red-100 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-white">{helpline.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{helpline.timing}</p>
                    </div>
                    <div className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-xl font-bold">
                      <span>{helpline.number}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-6 p-4 bg-white/70 dark:bg-gray-800/70 rounded-2xl">
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                <strong>You are not alone.</strong> What you're feeling is temporary, and help is always available — 24 hours a day, 7 days a week.
              </p>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 rounded-xl font-semibold hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
              >
                I can manage for now
              </button>
              <button
                onClick={() => window.open('tel:9152987821')}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
              >
                Call Now
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
          }
          50% {
            box-shadow: 0 0 0 15px rgba(239, 68, 68, 0);
          }
        }
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          50% {
            transform: scale(1.02);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

