import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/data';
import styles from './PatientSettings.module.css';
import type { Patient } from '../../types';

export function PatientSettings() {
  const { user } = useAuth();
  const [phone, setPhone] = useState((user as Patient)?.phone || '');
  const [emergencyContact, setEmergencyContact] = useState((user as Patient)?.emergencyContact || '');
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage('');
    try {
      const updates: Partial<Patient> = { phone, emergencyContact };
      if (avatarFile) {
        updates.photoURL = await dataService.uploadAvatar(user.id, avatarFile);
      }
      await dataService.updatePatient(user.id, updates);
      setMessage('Settings updated successfully!');
    } catch (err: any) {
      setMessage(`Error: ${err.message || 'Failed to update'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Patient Settings</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label>Avatar / Profile Photo</label>
          <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
        </div>
        <div className={styles.field}>
          <label>Phone Number</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label>Emergency Contact</label>
          <input value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} />
        </div>
        <button type="submit" disabled={loading} className={styles.btn}>
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
        {message && <p className={styles.message}>{message}</p>}
      </form>
    </div>
  );
}
