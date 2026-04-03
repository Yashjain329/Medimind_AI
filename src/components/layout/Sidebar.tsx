import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CalendarPlus,
  FileText,
  Pill,
  Sparkles,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';

const doctorLinks = [
  { to: '/doctor', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/doctor/patients', icon: Users, label: 'Patients', end: false },
  { to: '/doctor/appointments', icon: Calendar, label: 'Appointments', end: false },
  { to: '/doctor/settings', icon: Settings, label: 'Settings', end: false },
];

const patientLinks = [
  { to: '/patient', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/patient/book', icon: CalendarPlus, label: 'Book Appointment', end: false },
  { to: '/patient/appointments', icon: Calendar, label: 'My Appointments', end: false },
  { to: '/patient/prescriptions', icon: Pill, label: 'Prescriptions', end: false },
  { to: '/patient/records', icon: FileText, label: 'Health Records', end: false },
  { to: '/patient/settings', icon: Settings, label: 'Settings', end: false },
];

export function Sidebar() {
  const { user } = useAuth();
  const links = user?.role === 'doctor' ? doctorLinks : patientLinks;

  return (
    <aside className={styles.sidebar} aria-label="Main navigation">
      <div className={styles.brand}>
        <Sparkles size={24} className={styles.brandIcon} />
        <span className={styles.brandText}>MediConnect</span>
      </div>

      <nav className={styles.nav}>
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <p className={styles.footerText}>
          {user?.role === 'doctor' ? '🩺 Doctor Portal' : '👤 Patient Portal'}
        </p>
      </div>
    </aside>
  );
}
