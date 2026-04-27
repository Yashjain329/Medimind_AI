import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, Thermometer, Droplets, Weight, Wind } from 'lucide-react';
import { useAssistant } from '../../hooks/useAssistant';
import { dataService } from '../../services/data';
import { Card, Chip, MetricTile, Avatar, Button } from '../../components/ui';
import { AssistantPanel } from '../../components/assistant/AssistantPanel';
import type { Patient, Appointment, Prescription, VisitSummary } from '../../types';
import styles from './PatientDetail.module.css';

export function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [visits, setVisits] = useState<VisitSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      dataService.getPatient(id),
      dataService.getAppointments(id, 'patient'),
      dataService.getPrescriptions(id),
      dataService.getVisitSummaries(id),
    ]).then(([p, a, rx, vs]) => {
      setPatient(p);
      setAppointments(a);
      setPrescriptions(rx);
      setVisits(vs);
    }).catch((err) => {
      console.error('[PatientDetail] Failed to load data:', err);
    }).finally(() => {
      setLoading(false);
    });
  }, [id]);

  const daysAgo = patient?.lastVisit
    ? Math.floor((Date.now() - new Date(patient.lastVisit).getTime()) / 86400000)
    : undefined;

  const context = useMemo(
    () => ({
      role: 'doctor' as const,
      currentPage: 'patient-detail',
      selectedPatientId: id,
      patientRiskLevel: patient?.riskLevel,
      lastVisitDaysAgo: daysAgo,
    }),
    [id, patient?.riskLevel, daysAgo]
  );

  const { suggestions, loading: assistLoading, dismiss } = useAssistant(context);

  const latestVitals = visits[0]?.vitals;

  if (loading) return <div className={styles.loading}>Loading patient details…</div>;
  if (!patient) return <div className={styles.loading}>Patient not found.</div>;

  const riskVar = patient.riskLevel === 'high' ? 'error' : patient.riskLevel === 'moderate' ? 'warning' : 'success';

  return (
    <div className={styles.page}>
      <Button variant="tertiary" size="sm" icon={<ArrowLeft size={18} />} onClick={() => navigate(-1)}>
        Back
      </Button>

      <div className={styles.profileSection}>
        <Avatar name={patient.displayName} size={64} />
        <div className={styles.profileInfo}>
          <h2 className={styles.profileName}>{patient.displayName}</h2>
          <p className={styles.profileMeta}>
            {patient.gender}, {getAge(patient.dateOfBirth)} yrs • {patient.bloodType} • {patient.phone}
          </p>
          <div className={styles.chips}>
            <Chip variant={riskVar as 'error' | 'warning' | 'success'} size="md">{patient.riskLevel} risk</Chip>
            {patient.allergies.map((a) => (<Chip key={a} variant="warning" size="sm">⚠ {a}</Chip>))}
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.mainCol}>
          {/* Vitals */}
          {latestVitals && (
            <section>
              <h3 className={styles.sectionTitle}>Latest Vitals</h3>
              <div className={styles.vitalsGrid}>
                <MetricTile label="Blood Pressure" value={latestVitals.bloodPressure} unit="mmHg" icon={<Heart size={18} />} />
                <MetricTile label="Heart Rate" value={latestVitals.heartRate} unit="bpm" icon={<Heart size={18} />} />
                <MetricTile label="Temperature" value={latestVitals.temperature} unit="°F" icon={<Thermometer size={18} />} />
                <MetricTile label="Weight" value={latestVitals.weight} unit="kg" icon={<Weight size={18} />} />
                <MetricTile label="SpO₂" value={latestVitals.oxygenSaturation} unit="%" icon={<Wind size={18} />} />
              </div>
            </section>
          )}

          {/* Conditions */}
          <section>
            <h3 className={styles.sectionTitle}>Conditions</h3>
            <div className={styles.conditions}>
              {patient.conditions.length ? patient.conditions.map((c) => (
                <Chip key={c} variant="info" size="md">{c}</Chip>
              )) : <p className={styles.muted}>No known conditions</p>}
            </div>
          </section>

          {/* Visit History */}
          <section>
            <h3 className={styles.sectionTitle}>Visit History</h3>
            {visits.length === 0 ? <p className={styles.muted}>No visits recorded.</p> : (
              <div className={styles.visitList}>
                {visits.map((v) => (
                  <Card key={v.id} variant="filled" padding="md">
                    <div className={styles.visitHeader}>
                      <span className={styles.visitDate}>{formatDate(v.date)}</span>
                      <span className={styles.visitDoctor}>Dr. {v.doctorName.replace('Dr. ', '')}</span>
                    </div>
                    <p className={styles.visitDiag}>{v.diagnosis}</p>
                    <p className={styles.visitTreat}>{v.treatment}</p>
                    {v.followUpDate && (
                      <p className={styles.followUp}>Follow-up: {formatDate(v.followUpDate)}</p>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Appointments */}
          <section>
            <h3 className={styles.sectionTitle}>Appointments</h3>
            <div className={styles.aptList}>
              {appointments.slice(0, 5).map((a) => (
                <Card key={a.id} variant="outlined" padding="sm">
                  <div className={styles.aptRow}>
                    <span className={styles.aptDate}>{formatDate(a.date)} at {a.time}</span>
                    <span className={styles.aptReason}>{a.reason}</span>
                    <Chip variant={a.status === 'completed' ? 'success' : a.status === 'cancelled' ? 'error' : 'info'} size="sm">
                      {a.status}
                    </Chip>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Medications */}
          <section>
            <h3 className={styles.sectionTitle}>Current Medications</h3>
            {prescriptions.length === 0 ? <p className={styles.muted}>No prescriptions.</p> : (
              <div className={styles.medList}>
                {prescriptions[0]?.medications.map((m) => (
                  <Card key={m.name} variant="filled" padding="sm">
                    <div className={styles.medCard}>
                      <Droplets size={16} className={styles.medIcon} />
                      <div>
                        <span className={styles.medName}>{m.name} — {m.dosage}</span>
                        <span className={styles.medFreq}>{m.frequency} • {m.duration}</span>
                        {m.instructions && <span className={styles.medInstr}>{m.instructions}</span>}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className={styles.sideCol}>
          <AssistantPanel suggestions={suggestions} loading={assistLoading} onDismiss={dismiss} />
        </aside>
      </div>
    </div>
  );
}

function getAge(dob: string): number {
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
