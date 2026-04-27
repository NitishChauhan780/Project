import { HELPLINES } from '../../utils/constants';
import { Phone, X, Heart } from 'lucide-react';

export default function CrisisAlert({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fadeIn border-2 border-red-200 dark:border-red-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-soft">
            <Heart className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-red-700 dark:text-red-300 mb-2">You Are Not Alone</h2>
          <p className="text-gray-600 dark:text-gray-300">
            If you're in crisis or having thoughts of self-harm, please reach out to these free, confidential helplines:
          </p>
        </div>

        <div className="space-y-3">
          {HELPLINES.map((helpline, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-red-100 dark:border-red-900"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">{helpline.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{helpline.timing}</p>
                </div>
                <a
                  href={`tel:${helpline.number}`}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span className="font-bold">{helpline.number}</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
          <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
            <strong>Remember:</strong> What you're feeling is temporary. Help is always available, 24/7. You deserve support.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 px-4 py-3 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 rounded-xl font-medium hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
        >
          I understand, thank you
        </button>
      </div>
    </div>
  );
}

