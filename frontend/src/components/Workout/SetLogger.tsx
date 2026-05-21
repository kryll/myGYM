import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Check, Timer } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '@/components/UI/Button';
import type { SessionSet } from '@/types';

interface SetLoggerProps {
  setNumber: number;
  set?: SessionSet;
  previousSet?: SessionSet;
  onLog: (data: Partial<SessionSet>) => void;
  onStartRest: (seconds: number) => void;
  trackWeight?: boolean;
  trackReps?: boolean;
  trackDuration?: boolean;
  defaultRest?: number;
  isActive?: boolean;
}

function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  unit,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          className="w-8 h-8 rounded-lg bg-dark-elevated border border-dark-border text-gray-400 hover:text-white hover:border-electric-500/50 transition-all flex items-center justify-center"
        >
          <Minus size={14} />
        </button>
        <div className="relative">
          <input
            type="number"
            value={value}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)));
            }}
            min={min}
            max={max}
            step={step}
            className="w-16 h-10 bg-dark-elevated border border-dark-border rounded-xl text-center text-white font-mono font-semibold text-base outline-none focus:border-electric-500/70 transition-colors"
          />
          {unit && (
            <span className="absolute -right-6 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              {unit}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + step))}
          className="w-8 h-8 rounded-lg bg-dark-elevated border border-dark-border text-gray-400 hover:text-white hover:border-electric-500/50 transition-all flex items-center justify-center"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

export function SetLogger({
  setNumber,
  set,
  previousSet,
  onLog,
  onStartRest,
  trackWeight = true,
  trackReps = true,
  trackDuration = false,
  defaultRest = 90,
  isActive = true,
}: SetLoggerProps) {
  const [weight, setWeight] = useState(previousSet?.weight ?? 0);
  const [reps, setReps] = useState(previousSet?.reps ?? 10);
  const [duration, setDuration] = useState(previousSet?.duration ?? 30);
  const [rpe, setRpe] = useState(7);

  const isCompleted = set?.isCompleted ?? false;

  const handleLog = () => {
    const data: Partial<SessionSet> = {
      setNumber,
      reps: trackReps ? reps : undefined,
      weight: trackWeight ? weight : undefined,
      duration: trackDuration ? duration : undefined,
      rpe,
      isCompleted: true,
      completedAt: new Date().toISOString(),
    };
    onLog(data);
    onStartRest(defaultRest);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'p-4 rounded-2xl border transition-all duration-300',
        isCompleted
          ? 'bg-neon-500/5 border-neon-500/20'
          : isActive
          ? 'bg-electric-500/5 border-electric-500/30'
          : 'bg-dark-elevated border-dark-border',
      )}
    >
      {/* Set number */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className={clsx(
              'w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm',
              isCompleted
                ? 'bg-neon-500/20 text-neon-400'
                : isActive
                ? 'bg-electric-500/20 text-electric-400'
                : 'bg-dark-muted text-gray-400',
            )}
          >
            {isCompleted ? <Check size={16} /> : setNumber}
          </div>
          <span className="text-sm font-medium text-gray-300">Serie {setNumber}</span>
        </div>

        {previousSet && (
          <span className="text-xs text-gray-500">
            Anterior:{' '}
            {previousSet.weight && `${previousSet.weight}kg × `}
            {previousSet.reps && `${previousSet.reps} reps`}
          </span>
        )}
      </div>

      {/* Inputs */}
      {!isCompleted && isActive && (
        <div className="flex items-end justify-center gap-6 mb-4">
          {trackWeight && (
            <NumberInput
              label="Peso"
              value={weight}
              onChange={setWeight}
              min={0}
              max={500}
              step={2.5}
              unit="kg"
            />
          )}
          {trackReps && (
            <NumberInput
              label="Reps"
              value={reps}
              onChange={setReps}
              min={1}
              max={100}
            />
          )}
          {trackDuration && (
            <NumberInput
              label="Tiempo"
              value={duration}
              onChange={setDuration}
              min={5}
              max={3600}
              step={5}
              unit="s"
            />
          )}
        </div>
      )}

      {/* RPE slider */}
      {!isCompleted && isActive && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500">Esfuerzo (RPE)</span>
            <span className="text-xs font-medium text-electric-400">{rpe}/10</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={rpe}
            onChange={(e) => setRpe(parseInt(e.target.value))}
            className="w-full accent-electric-500"
          />
        </div>
      )}

      {/* Completed display */}
      {isCompleted && (
        <div className="flex items-center gap-4 text-sm">
          {set?.weight && (
            <span className="text-gray-300">
              <span className="font-semibold text-white">{set.weight}</span> kg
            </span>
          )}
          {set?.reps && (
            <span className="text-gray-300">
              <span className="font-semibold text-white">{set.reps}</span> reps
            </span>
          )}
          {set?.duration && (
            <span className="text-gray-300">
              <span className="font-semibold text-white">{set.duration}</span>s
            </span>
          )}
          {set?.rpe && (
            <span className="text-gray-500">RPE {set.rpe}</span>
          )}
        </div>
      )}

      {/* Action buttons */}
      {!isCompleted && isActive && (
        <div className="flex gap-2 mt-2">
          <Button
            onClick={handleLog}
            variant="success"
            size="sm"
            fullWidth
            leftIcon={<Check size={16} />}
          >
            Completar serie
          </Button>
          <button
            onClick={() => onStartRest(defaultRest)}
            className="px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-dark-elevated border border-dark-border rounded-xl transition-all hover:border-electric-500/30 flex items-center gap-1.5"
          >
            <Timer size={14} />
            {Math.floor(defaultRest / 60) > 0
              ? `${Math.floor(defaultRest / 60)}m descanso`
              : `${defaultRest}s descanso`}
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default SetLogger;
