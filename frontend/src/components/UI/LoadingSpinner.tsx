import React from 'react';
import { clsx } from 'clsx';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'electric' | 'neon' | 'white';
  className?: string;
  label?: string;
}

const sizeMap = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
  xl: 'w-16 h-16 border-4',
};

const colorMap = {
  electric: 'border-electric-500/20 border-t-electric-500',
  neon: 'border-neon-500/20 border-t-neon-500',
  white: 'border-white/20 border-t-white',
};

export function LoadingSpinner({
  size = 'md',
  color = 'electric',
  className,
  label,
}: LoadingSpinnerProps) {
  return (
    <div className={clsx('flex flex-col items-center justify-center gap-3', className)}>
      <div
        className={clsx(
          'rounded-full animate-spin',
          sizeMap[size],
          colorMap[color],
        )}
      />
      {label && <p className="text-sm text-gray-400">{label}</p>}
    </div>
  );
}

export function PageLoader({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" label={label} />
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="fixed inset-0 bg-dark-bg flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-electric-500/20 border-t-electric-500 rounded-full animate-spin" />
        <div className="font-display text-2xl font-bold bg-gradient-to-r from-electric-500 to-neon-500 bg-clip-text text-transparent">
          myGYM
        </div>
      </div>
    </div>
  );
}

export default LoadingSpinner;
