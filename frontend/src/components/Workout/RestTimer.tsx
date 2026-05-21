import { motion, AnimatePresence } from 'framer-motion';
import { SkipForward, Plus } from 'lucide-react';
import { CircularProgress } from '@/components/UI/ProgressBar';

interface RestTimerProps {
  isVisible: boolean;
  timeRemaining: number;
  totalTime: number;
  onSkip: () => void;
  onAddTime: (seconds: number) => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function RestTimer({ isVisible, timeRemaining, totalTime, onSkip, onAddTime }: RestTimerProps) {
  const percentage = totalTime > 0 ? ((totalTime - timeRemaining) / totalTime) * 100 : 0;
  const isAlmostDone = timeRemaining <= 10;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <div
            className={`p-5 rounded-2xl border shadow-card-hover backdrop-blur-sm transition-all duration-300 ${
              isAlmostDone
                ? 'bg-neon-500/10 border-neon-500/40 shadow-neon'
                : 'bg-dark-card/90 border-dark-border'
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Circular progress */}
              <CircularProgress
                value={percentage}
                size={72}
                strokeWidth={5}
                color={isAlmostDone ? '#39FF14' : '#00D4FF'}
              >
                <span
                  className={`text-sm font-mono font-bold ${
                    isAlmostDone ? 'text-neon-400' : 'text-white'
                  }`}
                >
                  {formatTime(timeRemaining)}
                </span>
              </CircularProgress>

              {/* Info */}
              <div>
                <p className="text-sm font-medium text-white mb-1">Descansando</p>
                <p className="text-xs text-gray-400 mb-3">Próxima serie en breve</p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={onSkip}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-electric-500/15 text-electric-400 text-xs rounded-lg border border-electric-500/30 hover:bg-electric-500/25 transition-all"
                  >
                    <SkipForward size={12} />
                    Saltar
                  </button>
                  <button
                    onClick={() => onAddTime(30)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-elevated text-gray-400 text-xs rounded-lg border border-dark-border hover:text-white hover:border-electric-500/30 transition-all"
                  >
                    <Plus size={12} />
                    +30s
                  </button>
                </div>
              </div>
            </div>

            {/* Pulsing ring when almost done */}
            {isAlmostDone && (
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl border-2 border-neon-500/30 pointer-events-none"
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default RestTimer;
