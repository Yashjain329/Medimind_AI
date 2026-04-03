import type { ReactNode } from 'react';
import styles from './Chip.module.css';

type ChipVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

interface ChipProps {
  variant?: ChipVariant;
  children: ReactNode;
  icon?: ReactNode;
  size?: 'sm' | 'md';
}

export function Chip({ variant = 'default', children, icon, size = 'sm' }: ChipProps) {
  return (
    <span className={`${styles.chip} ${styles[variant]} ${styles[size]}`}>
      {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}
