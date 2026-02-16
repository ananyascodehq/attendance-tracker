'use client';

import { useEffect } from 'react';

interface CelebrationAnimationProps {
  type: 'subject' | 'overall';
  subjectName?: string;
  percentage: number;
  onComplete: () => void;
}

export const CelebrationAnimation = ({ 
  type, 
  subjectName, 
  percentage, 
  onComplete 
}: CelebrationAnimationProps) => {
  useEffect(() => {
    // Auto-dismiss after 4 seconds
    const timer = setTimeout(onComplete, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const message = type === 'subject' 
    ? `${subjectName} crossed ${percentage}%! 🎉`
    : `Overall attendance hit ${percentage}%! 🎊`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/10 animate-fade-in" />
      
      {/* Confetti particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="confetti-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-10px',
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][Math.floor(Math.random() * 5)],
              width: `${6 + Math.random() * 8}px`,
              height: `${6 + Math.random() * 8}px`,
            }}
          />
        ))}
      </div>

      {/* Celebration card */}
      <div className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md mx-4 animate-celebrate pointer-events-auto">
        <div className="text-center">
          {/* Animated emoji */}
          <div className="text-6xl mb-4 animate-bounce-slow">
            {type === 'subject' ? '🎯' : '🎊'}
          </div>
          
          {/* Message */}
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {type === 'subject' ? 'Great Progress!' : 'Milestone Reached!'}
          </h3>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            {message}
          </p>

          {/* Close button */}
          <button
            onClick={onComplete}
            className="mt-6 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
          >
            Awesome!
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes celebrate {
          0% {
            transform: scale(0.5) rotate(-5deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.05) rotate(2deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-celebrate {
          animation: celebrate 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .confetti-particle {
          position: absolute;
          border-radius: 50%;
          animation: confetti-fall linear forwards;
          opacity: 0.8;
        }
      `}</style>
    </div>
  );
};
