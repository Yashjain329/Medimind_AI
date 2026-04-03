import { useState, useEffect } from 'react';
import { Pill } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/data';
import { Card, Chip } from '../../components/ui';
import type { Prescription, VisitSummary } from '../../types';
import styles from './Prescriptions.module.css';

export function Prescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [visits, setVisits] = useState<VisitSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      dataService.getPrescriptions(user.id),
      dataService.getVisitSummaries(user.id),
    ]).then(([rx, vs]) => {
      setPrescriptions(rx);
      setVisits(vs);
      setLoading(false);
    });
  }, [user]);

  if (loading) return <div className={styles.loading}>Loading health records…</div>;

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Prescriptions & Health Records</h2>

      {/* Prescriptions */}
      <section>
        <h3 className={styles.sectionTitle}>Prescriptions</h3>
        {prescriptions.length === 0 ? (
          <Card variant="filled"><p className={styles.empty}>No prescriptions found.</p></Card>
        ) : (
          <div className={styles.list}>
            {prescriptions.map((rx) => (
              <Card key={rx.id}>
                <div className={styles.rxHeader}>
                  <span className={styles.rxDate}>{formatDate(rx.date)}</span>
                  <span className={styles.rxDoctor}>{rx.doctorName}</span>
                </div>
                <div className={styles.medList}>
                  {rx.medications.map((m) => (
                    <div key={m.name} className={styles.medRow}>
                      <Pill size={16} className={styles.medIcon} />
                      <div className={styles.medInfo}>
                        <span className={styles.medName}>{m.name} — {m.dosage}</span>
                        <span className={styles.medDetails}>{m.frequency} • {m.duration}</span>
                        {m.instructions && <span className={styles.medInstr}>{m.instructions}</span>}
                      </div>
                    </div>
                  ))}
                </div>
                {rx.notes && <p className={styles.rxNotes}>{rx.notes}</p>}
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Visit summaries */}
      <section>
        <h3 className={styles.sectionTitle}>Visit Summaries</h3>
        {visits.length === 0 ? (
          <Card variant="filled"><p className={styles.empty}>No visit records found.</p></Card>
        ) : (
          <div className={styles.list}>
            {visits.map((v) => (
              <Card key={v.id} variant="filled">
                <div className={styles.visitHeader}>
                  <span className={styles.visitDate}>{formatDate(v.date)}</span>
                  <span className={styles.visitDoc}>{v.doctorName}</span>
                </div>
                <p className={styles.visitDiag}>{v.diagnosis}</p>
                <div className={styles.symptoms}>
                  {v.symptoms.map((s) => (<Chip key={s} size="sm">{s}</Chip>))}
                </div>
                <p className={styles.visitTreat}>{v.treatment}</p>
                {v.followUpDate && (
                  <Chip variant="info" size="sm">Follow-up: {formatDate(v.followUpDate)}</Chip>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
