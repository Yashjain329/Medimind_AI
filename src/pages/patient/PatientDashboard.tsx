import { useState, useEffect, useMemo } from 'react';
import { CalendarDays, Clock, Pill, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAssistant } from '../../hooks/useAssistant';
import { dataService } from '../../services/data';
import { calendarService } from '../../services/calendar';
import { Card, MetricTile, Chip, Avatar, Button } from '../../components/ui';
import { AssistantPanel } from '../../components/assistant/AssistantPanel';
import type { Appointment, Prescription } from '../../types';
import styles from './PatientDashboard.module.css';

export function PatientDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      dataService.getAppointments(user.id, 'patient'),
      dataService.getPrescriptions(user.id),
    ]).then(([a, p]) => {
      setAppointments(a);
      setPrescriptions(p);
      setLoading(false);
    });
  }, [user]);

  const today = new Date().toISOString().slice(0, 10);

  const upcoming = useMemo(
    () => appointments.filter((a) => a.date >= today && a.status !== 'completed' && a.status !== 'cancelled')
                       .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)),
    [appointments, today]
  );

  const nextAppointment = upcoming[0];

  const context = useMemo(
    () => ({
      role: 'patient' as const,
      currentPage: 'dashboard',
      hasUpcomingAppointment: !!nextAppointment,
      hasPendingPrescriptions: prescriptions.length > 0,
    }),
    [nextAppointment, prescriptions.length]
  );

  const { suggestions, loading: assistLoading, dismiss } = useAssistant(context);

  const totalMeds = prescriptions.reduce((sum, rx) => sum + rx.medications.length, 0);

  if (loading) return <div className={styles.loading}>Loading dashboard…</div>;

  return (
    <div className={styles.dashboard}>
      <section className={styles.metrics}>
        <MetricTile label="Upcoming Appointments" value={upcoming.length} icon={<CalendarDays size={20} />} />
        <MetricTile label="Active Medications" value={totalMeds} icon={<Pill size={20} />} />
        <MetricTile label="Next Visit" value={nextAppointment ? formatDateShort(nextAppointment.date) : '—'} icon={<Clock size={20} />} />
      </section>

      <div className={styles.grid}>
        <div className={styles.mainCol}>
          {/* Next appointment highlight */}
          {nextAppointment && (
            <section>
              <h2 className={styles.sectionTitle}>Next Appointment</h2>
              <Card>
                <div className={styles.nextApt}>
                  <div className={styles.nextAptInfo}>
                    <Avatar name={nextAppointment.doctorName} size={48} />
                    <div>
                      <span className={styles.doctorName}>{nextAppointment.doctorName}</span>
                      <span className={styles.aptDateTime}>
                        {formatDate(nextAppointment.date)} at {nextAppointment.time}
                      </span>
                      <span className={styles.aptReason}>{nextAppointment.reason}</span>
                    </div>
                  </div>
                  <div className={styles.nextAptActions}>
                    <Chip variant={nextAppointment.status === 'confirmed' ? 'success' : 'info'} size="md">
                      {nextAppointment.status}
                    </Chip>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<ExternalLink size={14} />}
                      onClick={() => window.open(calendarService.generateAddToCalendarUrl(nextAppointment), '_blank')}
                    >
                      Add to Calendar
                    </Button>
                  </div>
                </div>
              </Card>
            </section>
          )}

          {/* Upcoming appointments */}
          <section>
            <h2 className={styles.sectionTitle}>All Upcoming</h2>
            {upcoming.length === 0 ? (
              <Card variant="filled"><p className={styles.emptyText}>No upcoming appointments.</p></Card>
            ) : (
              <div className={styles.aptList}>
                {upcoming.map((a) => (
                  <Card key={a.id} variant="filled" padding="sm">
                    <div className={styles.aptRow}>
                      <span className={styles.aptDate}>{formatDateShort(a.date)} {a.time}</span>
                      <span className={styles.aptDoc}>{a.doctorName}</span>
                      <span className={styles.aptReasonSmall}>{a.reason}</span>
                      <Chip variant={a.status === 'confirmed' ? 'success' : 'info'} size="sm">{a.status}</Chip>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Medication reminders */}
          {prescriptions.length > 0 && (
            <section>
              <h2 className={styles.sectionTitle}>Medication Reminders</h2>
              <div className={styles.medGrid}>
                {prescriptions[0]?.medications.map((m) => (
                  <Card key={m.name} variant="outlined" padding="sm">
                    <div className={styles.medCard}>
                      <Pill size={18} className={styles.medIcon} />
                      <div>
                        <span className={styles.medName}>{m.name} {m.dosage}</span>
                        <span className={styles.medFreq}>{m.frequency}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className={styles.sideCol}>
          <AssistantPanel suggestions={suggestions} loading={assistLoading} onDismiss={dismiss} />
        </aside>
      </div>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
}
function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
