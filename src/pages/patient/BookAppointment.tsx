import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/data';
import { Card, Button, Input } from '../../components/ui';
import type { Doctor } from '../../types';
import styles from './BookAppointment.module.css';

type Step = 'doctor' | 'datetime' | 'confirm' | 'done';

export function BookAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [step, setStep] = useState<Step>('doctor');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    dataService.getDoctors().then(setDoctors);
  }, []);

  const handleSubmit = async () => {
    if (!user || !selectedDoctor || !selectedDate || !selectedSlot) return;
    setSubmitting(true);
    try {
      await dataService.createAppointment({
        patientId: user.id,
        doctorId: selectedDoctor.id,
        patientName: user.displayName,
        doctorName: selectedDoctor.displayName,
        date: selectedDate,
        time: selectedSlot,
        duration: 30,
        reason: reason || 'General consultation',
        status: 'scheduled',
      });
      setStep('done');
    } catch (err) {
      console.error('Failed to create appointment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Book Appointment</h2>

      {/* Progress */}
      <div className={styles.progress}>
        {(['doctor', 'datetime', 'confirm'] as const).map((s, i) => (
          <div key={s} className={`${styles.step} ${step === s ? styles.active : ''} ${i < ['doctor', 'datetime', 'confirm'].indexOf(step) ? styles.completed : ''}`}>
            <span className={styles.stepNum}>{i + 1}</span>
            <span className={styles.stepLabel}>{s === 'doctor' ? 'Choose Doctor' : s === 'datetime' ? 'Date & Time' : 'Confirm'}</span>
          </div>
        ))}
      </div>

      {/* Step: Choose Doctor */}
      {step === 'doctor' && (
        <div className={styles.docGrid}>
          {doctors.map((doc) => (
            <Card
              key={doc.id}
              hoverable
              variant={selectedDoctor?.id === doc.id ? 'outlined' : 'elevated'}
              onClick={() => setSelectedDoctor(doc)}
              className={selectedDoctor?.id === doc.id ? styles.selected : ''}
            >
              <div className={styles.docCard}>
                <h4 className={styles.docName}>{doc.displayName}</h4>
                <span className={styles.docSpec}>{doc.specialty}</span>
                <span className={styles.docQual}>{doc.qualifications}</span>
                <span className={styles.docExp}>{doc.yearsOfExperience} years experience</span>
              </div>
            </Card>
          ))}
        </div>
      )}
      {step === 'doctor' && (
        <Button onClick={() => setStep('datetime')} disabled={!selectedDoctor} size="lg">
          Continue
        </Button>
      )}

      {/* Step: Date & Time */}
      {step === 'datetime' && selectedDoctor && (
        <div className={styles.dateTimeSection}>
          <Input
            label="Select Date"
            type="date"
            value={selectedDate}
            onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(''); }}
            min={todayStr}
          />
          {selectedDate && (
            <>
              <p className={styles.slotLabel}>Available Slots</p>
              <div className={styles.slotGrid}>
                {selectedDoctor.availableSlots.map((slot) => (
                  <button
                    key={slot}
                    className={`${styles.slot} ${selectedSlot === slot ? styles.slotActive : ''}`}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </>
          )}
          <Input
            label="Reason for Visit"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe your symptoms or reason…"
          />
          <div className={styles.actions}>
            <Button variant="tertiary" onClick={() => setStep('doctor')}>Back</Button>
            <Button onClick={() => setStep('confirm')} disabled={!selectedDate || !selectedSlot}>Continue</Button>
          </div>
        </div>
      )}

      {/* Step: Confirm */}
      {step === 'confirm' && selectedDoctor && (
        <div className={styles.confirmSection}>
          <Card>
            <h3 className={styles.confirmTitle}>Appointment Summary</h3>
            <div className={styles.confirmGrid}>
              <div><span className={styles.confirmLabel}>Doctor</span><span>{selectedDoctor.displayName}</span></div>
              <div><span className={styles.confirmLabel}>Specialty</span><span>{selectedDoctor.specialty}</span></div>
              <div><span className={styles.confirmLabel}>Date</span><span>{new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
              <div><span className={styles.confirmLabel}>Time</span><span>{selectedSlot}</span></div>
              <div><span className={styles.confirmLabel}>Reason</span><span>{reason || 'General consultation'}</span></div>
            </div>
          </Card>
          <div className={styles.actions}>
            <Button variant="tertiary" onClick={() => setStep('datetime')}>Back</Button>
            <Button onClick={handleSubmit} loading={submitting} size="lg">Confirm Booking</Button>
          </div>
        </div>
      )}

      {/* Step: Done */}
      {step === 'done' && (
        <div className={styles.doneSection}>
          <CheckCircle size={64} className={styles.doneIcon} />
          <h3 className={styles.doneTitle}>Appointment Booked!</h3>
          <p className={styles.doneText}>
            Your appointment with {selectedDoctor?.displayName} on {selectedDate} at {selectedSlot} has been scheduled.
          </p>
          <div className={styles.actions}>
            <Button onClick={() => navigate('/patient/appointments')}>View Appointments</Button>
            <Button variant="secondary" onClick={() => navigate('/patient')}>Back to Dashboard</Button>
          </div>
        </div>
      )}
    </div>
  );
}
