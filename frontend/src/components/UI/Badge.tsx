import React from 'react';
import { clsx } from 'clsx';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
type BadgeSize = 'xs' | 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-dark-muted text-gray-300 border border-dark-border',
  primary: 'bg-electric-500/15 text-electric-400 border border-electric-500/30',
  success: 'bg-neon-500/15 text-neon-400 border border-neon-500/30',
  warning: 'bg-warning/15 text-warning border border-warning/30',
  danger: 'bg-danger/15 text-danger border border-danger/30',
  info: 'bg-info/15 text-info border border-info/30',
  outline: 'bg-transparent text-gray-300 border border-dark-border',
};

const sizeClasses: Record<BadgeSize, string> = {
  xs: 'px-1.5 py-0.5 text-xs',
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-gray-400',
  primary: 'bg-electric-400',
  success: 'bg-neon-400',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  outline: 'bg-gray-400',
};

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 font-medium rounded-full',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {dot && (
        <span
          className={clsx('w-1.5 h-1.5 rounded-full animate-pulse', dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: 'beginner' | 'intermediate' | 'advanced' }) {
  const config = {
    beginner: { label: 'Principiante', variant: 'success' as BadgeVariant },
    intermediate: { label: 'Intermedio', variant: 'warning' as BadgeVariant },
    advanced: { label: 'Avanzado', variant: 'danger' as BadgeVariant },
  };

  const { label, variant } = config[difficulty];
  return <Badge variant={variant}>{label}</Badge>;
}

export function EnvironmentBadge({ environment }: { environment: string }) {
  const config: Record<string, { label: string; variant: BadgeVariant }> = {
    gym: { label: 'Gimnasio', variant: 'primary' },
    home: { label: 'Casa', variant: 'success' },
    outdoor: { label: 'Exterior', variant: 'info' },
    mixed: { label: 'Mixto', variant: 'default' },
  };

  const { label, variant } = config[environment] ?? { label: environment, variant: 'default' as BadgeVariant };
  return <Badge variant={variant}>{label}</Badge>;
}

export default Badge;
