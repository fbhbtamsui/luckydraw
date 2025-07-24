import React, { useEffect } from 'react';
import type { Participant } from '../App.tsx';
import { Crown } from './Icons.tsx';

declare var confetti: any;

interface WinnerModalProps {
  winners: Participant[];
  onClose: () => void;
}

const WinnerModal: React.FC<WinnerModalProps> = ({ winners, onClose }) => {

  useEffect(() => {
    if (typeof confetti === 'function') {
      const duration = 2.5 * 1000;
      const end = Date.now() + duration;
      const colors = ['#10b981', '#f59e0b', '#ffffff', '#fbbf24'];

      // Initial burst for a big celebration
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: colors,
        scalar: 1.2
      });

      // Side cannons for continuous effect
      (function frame() {
        // left
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: colors
        });
        // right
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'Enter') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    // Backdrop
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" 
        onClick={onClose}
    >
      {/* Modal Content */}
      <div 
        className="glass-panel p-8 md:p-12 rounded-2xl w-full max-w-lg mx-4 text-center transform transition-all animate-jump-in"
        onClick={(e) => e.stopPropagation()}
      >
        <Crown className="mx-auto text-yellow-400 drop-shadow-lg mb-4" size={60} />
        <h2 className="text-4xl md:text-5xl font-black text-teal-800 text-shadow-lg mb-6 tracking-wide">請上台抽紅包</h2>
        
        <div className="space-y-3 max-h-[40vh] overflow-y-auto px-4">
          {winners.map((winner, index) => (
            <div 
              key={winner.id} 
              className="bg-white/90 rounded-xl p-4 text-3xl md:text-4xl font-bold text-emerald-600 shadow-lg animate-fade-in-up" 
              style={{animationDelay: `${index * 200 + 300}ms`}}
            >
              {winner.name}
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-10 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-10 rounded-full transition-all duration-300 text-xl shadow-lg animate-fade-in-up"
          style={{animationDelay: `${winners.length * 200 + 500}ms`}}
        >
          關閉
        </button>
      </div>
    </div>
  );
};

export default WinnerModal;