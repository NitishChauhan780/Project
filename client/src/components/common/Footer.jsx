import { Brain, Heart, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Footer() {
  const { user } = useApp();

  const marginClass = user ? 'lg:ml-64' : '';

  return (
    <footer className={`py-6 px-4 border-t border-gray-100 dark:border-gray-800 bg-card-light/80 dark:bg-card-dark/80 backdrop-blur-sm ${marginClass} transition-all duration-300 z-20 relative`}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 opacity-70">
          <Brain className="w-5 h-5 text-primary" />
          <span className="font-medium text-gray-600 dark:text-gray-400">MindBridge © {new Date().getFullYear()}</span>
        </div>
        
        <div className="flex items-center space-x-5 text-sm text-gray-500 dark:text-gray-400">
          <span className="hidden sm:inline">Built with <Heart className="w-4 h-4 inline text-danger mx-0.5" /> for Students</span>
          <span className="hidden sm:inline">|</span>
          <a href="tel:18005990019" className="flex items-center text-danger hover:text-red-600 font-medium transition-colors">
            <Phone className="w-4 h-4 mr-1" /> Crisis: 1800-599-0019
          </a>
        </div>
      </div>
    </footer>
  );
}

