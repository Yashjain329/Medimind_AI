import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Users, Clock, AlertTriangle, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAssistant } from '../../hooks/useAssistant';
import { dataService } from '../../services/data';
import { Card, MetricTile, Chip, Avatar } from '../../components/ui';
import { AssistantPanel } from '../../components/assistant/AssistantPanel';
import type { Appointment, Patient } from '../../types';
import styles from './DoctorDashboard.module.css';

export function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      dataService.getAppointments(user.id, 'doctor'),
      dataService.getPatients(),
    ]).then(([apts, pats]) => {
      setAppointments(apts);
      setPatients(pats);
      setLoading(false);
    });
  }, [user]);

  const today = new Date().toISOString().slice(0, 10);

  const todayAppointments = useMemo(
    () => appointments.filter((a) => a.date === today),
    [appointments, today]
  );

  const upcomingAppointments = useMemo(
    () => appointments.filter((a) => a.date >= today && a.status !== 'completed' && a.status !== 'cancelled'),
    [appointments, today]
  );

  const highRiskPatients = useMemo(
    () => patients.filter((p) => p.riskLevel === 'high'),
    [patients]
  );

  const assistantContext = useMemo(
    () => ({
      role: 'doctor' as const,
      currentPage: 'dashboard',
      hasUpcomingAppointment: upcomingAppointments.length > 0,
    }),
    [upcomingAppointments.length]
  );

  const { suggestions, loading: assistLoading, dismiss } = useAssistant(assistantContext);

  const statusVariant = (s: string) => {
    switch (s) {
      case 'confirmed': return 'success' as const;
      case 'scheduled': return 'info' as const;
      case 'cancelled': return 'error' as const;
      case 'completed': return 'default' as const;
      default: return 'default' as const;
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading dashboard…</div>;
  }

  return (
    <div className={styles.dashboard}>
      <section className={styles.metrics} aria-label="Quick statistics">
        <MetricTile label="Today's Appointments" value={todayAppointments.length} icon={<CalendarDays size={20} />} />
        <MetricTile label="Total Patients" value={patients.length} icon={<Users size={20} />} />
        <MetricTile label="Upcoming" value={upcomingAppointments.length} icon={<Clock size={20} />} />
        <MetricTile
          label="High Risk"
          value={highRiskPatients.length}
          icon={<AlertTriangle size={20} />}
          trend={highRiskPatients.length > 0 ? 'up' : 'stable'}
        />
      </section>

      <div className={styles.grid}>
        <section className={styles.mainCol}>
          <h2 className={styles.sectionTitle}>Today's Appointments</h2>
          {todayAppointments.length === 0 ? (
            <Card variant="filled" padding="lg">
              <p className={styles.emptyText}>No appointments scheduled for today.</p>
            </Card>
          ) : (
            <div className={styles.appointmentList}>
              {todayAppointments.map((apt) => (
                <Card
                  key={apt.id}
                  hoverable
                  onClick={() => navigate(`/doctor/patients/${apt.patientId}`)}
                >
                  <div className={styles.aptCard}>
                    <div className={styles.aptTime}>
                      <Activity size={16} />
                      <span>{apt.time}</span>
                    </div>
                    <div className={styles.aptInfo}>
                      <div className={styles.aptHeader}>
                        <Avatar name={apt.patientName} size={32} />
                        <div>
                          <span className={styles.aptName}>{apt.patientName}</span>
                          <span className={styles.aptReason}>{apt.reason}</span>
                        </div>
                      </div>
                      <Chip variant={statusVariant(apt.status)} size="sm">
                        {apt.status}
                      </Chip>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <aside className={styles.sideCol}>
          <AssistantPanel
            suggestions={suggestions}
            loading={assistLoading}
            onDismiss={dismiss}
          />

          <div className={styles.riskSection}>
            <h3 className={styles.sectionTitle}>High-Risk Patients</h3>
            {highRiskPatients.length === 0 ? (
              <p className={styles.emptyText}>No high-risk patients.</p>
            ) : (
              <div className={styles.riskList}>
                {highRiskPatients.map((p) => (
                  <Card
                    key={p.id}
                    variant="outlined"
                    padding="sm"
                    hoverable
                    onClick={() => navigate(`/doctor/patients/${p.id}`)}
                  >
                    <div className={styles.riskCard}>
                      <Avatar name={p.displayName} size={28} />
                      <div>
                        <span className={styles.riskName}>{p.displayName}</span>
                        <span className={styles.riskConditions}>{p.conditions.join(', ')}</span>
                      </div>
                      <Chip variant="error" size="sm">High</Chip>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
