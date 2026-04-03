import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/data';
import { calendarService } from '../../services/calendar';
import { Card, Chip, Avatar, Button } from '../../components/ui';
import type { Appointment } from '../../types';
import styles from './MyAppointments.module.css';

export function MyAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    dataService.getAppointments(user.id, 'patient').then((a) => {
      setAppointments(a);
      setLoading(false);
    });
  }, [user]);

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = appointments.filter((a) => a.date >= today && a.status !== 'completed' && a.status !== 'cancelled');
  const past = appointments.filter((a) => a.date < today || a.status === 'completed' || a.status === 'cancelled');

  const statusVar = (s: string) => {
    switch (s) {
      case 'confirmed': return 'success' as const;
      case 'scheduled': return 'info' as const;
      case 'completed': return 'default' as const;
      case 'cancelled': return 'error' as const;
      default: return 'default' as const;
    }
  };

  if (loading) return <div className={styles.loading}>Loading appointments…</div>;

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>My Appointments</h2>

      <section>
        <h3 className={styles.sectionTitle}>Upcoming ({upcoming.length})</h3>
        {upcoming.length === 0 ? (
          <Card variant="filled"><p className={styles.empty}>No upcoming appointments.</p></Card>
        ) : (
          <div className={styles.list}>
            {upcoming.map((a) => (
              <Card key={a.id}>
                <div className={styles.aptCard}>
                  <Avatar name={a.doctorName} size={40} />
                  <div className={styles.aptInfo}>
                    <span className={styles.aptDoctor}>{a.doctorName}</span>
                    <span className={styles.aptDate}>{formatDate(a.date)} at {a.time}</span>
                    <span className={styles.aptReason}>{a.reason}</span>
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
      </section>

      {past.length > 0 && (
        <section>
          <h3 className={styles.sectionTitle}>Past ({past.length})</h3>
          <div className={styles.list}>
            {past.map((a) => (
              <Card key={a.id} variant="filled">
                <div className={styles.aptCard}>
                  <Avatar name={a.doctorName} size={36} />
                  <div className={styles.aptInfo}>
                    <span className={styles.aptDoctor}>{a.doctorName}</span>
                    <span className={styles.aptDate}>{formatDate(a.date)} at {a.time}</span>
                    <span className={styles.aptReason}>{a.reason}</span>
                    {a.notes && <span className={styles.aptNotes}>{a.notes}</span>}
                  </div>
                  <Chip variant={statusVar(a.status)} size="sm">{a.status}</Chip>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}
