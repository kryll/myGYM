import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  glowColor?: 'blue' | 'green';
  onClick?: () => void;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function Card({
  children,
  className,
  hover = false,
  glow = false,
  glowColor = 'blue',
  onClick,
  padding = 'md',
  animated = true,
}: CardProps) {
  const base = clsx(
    'bg-dark-card border border-dark-border rounded-2xl',
    paddingClasses[padding],
    hover && 'cursor-pointer transition-all duration-300 hover:border-electric-500/30 hover:shadow-card-hover hover:bg-dark-elevated',
    glow && glowColor === 'blue' && 'shadow-glow-blue border-electric-500/20',
    glow && glowColor === 'green' && 'shadow-glow-green border-neon-500/20',
    !glow && 'shadow-card',
    className,
  );

  if (animated) {
    return (
      <motion.div
        className={base}
        onClick={onClick}
        whileHover={hover ? { y: -2 } : {}}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={base} onClick={onClick}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function CardHeader({ children, className, action }: CardHeaderProps) {
  return (
    <div className={clsx('flex items-center justify-between mb-4', className)}>
      <div className="flex-1">{children}</div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={clsx('text-lg font-semibold text-white font-display', className)}>
      {children}
    </h3>
  );
}

export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx('', className)}>{children}</div>;
}

export default Card;
