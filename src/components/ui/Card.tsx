import type { ReactNode, HTMLAttributes } from 'react';
import styles from './Card.module.css';

type CardVariant = 'elevated' | 'filled' | 'outlined';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  children: ReactNode;
}

export function Card({ variant = 'elevated', padding = 'md', hoverable, children, className, ...props }: CardProps) {
  return (
    <div
      className={`${styles.card} ${styles[variant]} ${styles[`pad${padding.charAt(0).toUpperCase() + padding.slice(1)}`]} ${hoverable ? styles.hoverable : ''} ${className ?? ''}`}
      {...props}
    >
      {children}
    </div>
  );
}
