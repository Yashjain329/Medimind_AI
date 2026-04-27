import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/data';
import { calendarService } from '../../services/calendar';
import { Card, Chip, Avatar, Button } from '../../components/ui';
import type { Appointment } from '../../types';
import styles from './DoctorAppointments.module.css';

export function DoctorAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming'>('all');

  useEffect(() => {
    if (!user) return;
    dataService.getAppointments(user.id, 'doctor').then((a) => {
      setAppointments(a);
    }).catch((err) => {
      console.error('[DoctorAppointments] Failed to load appointments:', err);
    }).finally(() => {
      setLoading(false);
    });
  }, [user]);

  const today = new Date().toISOString().slice(0, 10);

  const filtered = (() => {
    switch (filter) {
      case 'today': return appointments.filter((a) => a.date === today);
      case 'upcoming': return appointments.filter((a) => a.date >= today && a.status !== 'completed' && a.status !== 'cancelled');
      default: return [...appointments].sort((a, b) => b.date.localeCompare(a.date));
    }
  })();

  const statusVar = (s: string) => {
    switch (s) {
      case 'confirmed': return 'success' as const;
      case 'scheduled': return 'info' as const;
      case 'completed': return 'default' as const;
      case 'cancelled': return 'error' as const;
      default: return 'default' as const;
    }
  };

  if (loading) return <div className={styles.loading}>Loading…</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Appointments</h2>
        <div className={styles.filters}>
          {(['all', 'today', 'upcoming'] as const).map((f) => (
            <Button key={f} variant={filter === f ? 'primary' : 'tertiary'} size="sm" onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card variant="filled"><p className={styles.empty}>No appointments match the filter.</p></Card>
      ) : (
        <div className={styles.list}>
          {filtered.map((a) => (
            <Card key={a.id}>
              <div className={styles.aptCard}>
                <div className={styles.aptTime}>
                  <CalendarIcon size={16} />
                  <span>{a.date}</span>
                  <span>{a.time}</span>
                </div>
                <Avatar name={a.patientName} size={36} />
                <div className={styles.aptInfo}>
                  <span className={styles.aptName}>{a.patientName}</span>
                  <span className={styles.aptReason}>{a.reason}</span>
                  {a.notes && <span className={styles.aptNotes}>{a.notes}</span>}
                </div>
                <div className={styles.aptActions}>
                  <Chip variant={statusVar(a.status)} size="md">{a.status}</Chip>
                  <Button
                    variant="tertiary"
                    size="sm"
                    icon={<ExternalLink size={14} />}
                    onClick={() => window.open(calendarService.generateAddToCalendarUrl(a), '_blank')}
                  >
                    Calendar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
