import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { dataService } from '../../services/data';
import { Card, Chip, Avatar, SearchBar, Button } from '../../components/ui';
import type { Patient, RiskLevel } from '../../types';
import styles from './PatientList.module.css';

export function PatientList() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dataService.getPatients().then((p) => {
      setPatients(p);
    }).catch((err) => {
      console.error('[PatientList] Failed to load patients:', err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let result = patients;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.displayName.toLowerCase().includes(q) ||
          p.conditions.some((c) => c.toLowerCase().includes(q)) ||
          p.bloodType.toLowerCase().includes(q)
      );
    }
    if (riskFilter !== 'all') {
      result = result.filter((p) => p.riskLevel === riskFilter);
    }
    return result;
  }, [patients, search, riskFilter]);

  const riskVariant = (r: RiskLevel) => {
    switch (r) {
      case 'high': return 'error' as const;
      case 'moderate': return 'warning' as const;
      case 'low': return 'success' as const;
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading patients…</div>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Patients</h2>
        <span className={styles.count}>{filtered.length} patients</span>
      </div>

      <div className={styles.controls}>
        <div className={styles.searchWrap}>
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name, condition…" />
        </div>
        <div className={styles.filters}>
          <Filter size={16} className={styles.filterIcon} />
          {(['all', 'high', 'moderate', 'low'] as const).map((level) => (
            <Button
              key={level}
              variant={riskFilter === level ? 'primary' : 'tertiary'}
              size="sm"
              onClick={() => setRiskFilter(level)}
            >
              {level === 'all' ? 'All' : level.charAt(0).toUpperCase() + level.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card variant="filled" padding="lg">
          <p className={styles.emptyText}>No patients found matching your search.</p>
        </Card>
      ) : (
        <div className={styles.list}>
          {filtered.map((p) => (
            <Card key={p.id} hoverable onClick={() => navigate(`/doctor/patients/${p.id}`)}>
              <div className={styles.patientCard}>
                <Avatar name={p.displayName} size={44} />
                <div className={styles.patientInfo}>
                  <span className={styles.patientName}>{p.displayName}</span>
                  <span className={styles.patientMeta}>
                    {p.gender}, {getAge(p.dateOfBirth)} yrs • {p.bloodType}
                  </span>
                  {p.conditions.length > 0 && (
                    <div className={styles.conditions}>
                      {p.conditions.map((c) => (
                        <Chip key={c} size="sm">{c}</Chip>
                      ))}
                    </div>
                  )}
                </div>
                <div className={styles.patientRight}>
                  <Chip variant={riskVariant(p.riskLevel)} size="md">
                    {p.riskLevel} risk
                  </Chip>
                  {p.lastVisit && (
                    <span className={styles.lastVisit}>Last visit: {formatDate(p.lastVisit)}</span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function getAge(dob: string): number {
  const d = new Date(dob);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
