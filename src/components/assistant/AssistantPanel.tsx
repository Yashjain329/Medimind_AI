import { useNavigate } from 'react-router-dom';
import { X, Sparkles } from 'lucide-react';
import * as icons from 'lucide-react';
import type { AssistantSuggestion } from '../../types';
import styles from './AssistantPanel.module.css';

interface AssistantPanelProps {
  suggestions: AssistantSuggestion[];
  loading: boolean;
  onDismiss: (id: string) => void;
  onAction?: (suggestion: AssistantSuggestion) => void;
}

export function AssistantPanel({ suggestions, loading, onDismiss, onAction }: AssistantPanelProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <Sparkles size={18} className={styles.sparkle} />
          <span className={styles.title}>Smart Assistant</span>
        </div>
        <div className={styles.loading}>Analyzing context…</div>
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  const handleAction = (s: AssistantSuggestion) => {
    if (onAction) {
      onAction(s);
      return;
    }
    if (s.action === 'navigate' && s.actionPayload?.['to']) {
      navigate(s.actionPayload['to']);
    }
  };

  return (
    <div className={styles.panel} role="complementary" aria-label="Smart assistant suggestions">
      <div className={styles.header}>
        <Sparkles size={18} className={styles.sparkle} />
        <span className={styles.title}>Smart Assistant</span>
      </div>
      <div className={styles.list}>
        {suggestions.map((s, i) => {
          const IconComponent = (icons as unknown as Record<string, React.ComponentType<{ size?: number }>>)[s.icon] ?? Sparkles;
          return (
            <div
              key={s.id}
              className={`${styles.card} ${styles[s.priority]}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <button
                className={styles.cardAction}
                onClick={() => handleAction(s)}
                aria-label={s.title}
              >
                <span className={styles.cardIcon}>
                  <IconComponent size={18} />
                </span>
                <div className={styles.cardText}>
                  <span className={styles.cardTitle}>{s.title}</span>
                  <span className={styles.cardDesc}>{s.description}</span>
                </div>
              </button>
              <button
                className={styles.dismiss}
                onClick={() => onDismiss(s.id)}
                aria-label={`Dismiss: ${s.title}`}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
