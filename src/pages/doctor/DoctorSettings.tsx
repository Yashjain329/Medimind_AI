import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/data';
import styles from './DoctorSettings.module.css';
import type { Doctor } from '../../types';

export function DoctorSettings() {
  const { user } = useAuth();
  const [specialty, setSpecialty] = useState((user as Doctor)?.specialty || '');
  const [clinicAddress, setClinicAddress] = useState((user as Doctor)?.clinicAddress || '');
  const [bio, setBio] = useState((user as Doctor)?.bio || '');
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage('');
    try {
      const updates: Partial<Doctor> = { specialty, clinicAddress, bio };
      if (avatarFile) {
        updates.photoURL = await dataService.uploadAvatar(user.id, avatarFile);
      }
      await dataService.updateDoctor(user.id, updates);
      setMessage('Settings updated successfully!');
    } catch (err: any) {
      setMessage(`Error: ${err.message || 'Failed to update'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Doctor Settings</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label>Avatar / Profile Photo</label>
          <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
        </div>
        <div className={styles.field}>
          <label>Specialty</label>
          <input value={specialty} onChange={e => setSpecialty(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label>Clinic Address</label>
          <input value={clinicAddress} onChange={e => setClinicAddress(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label>Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={4} />
        </div>
        <button type="submit" disabled={loading} className={styles.btn}>
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
        {message && <p className={styles.message}>{message}</p>}
      </form>
    </div>
  );
}
