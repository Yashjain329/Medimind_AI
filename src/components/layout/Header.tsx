import { Moon, Sun, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Avatar } from '../ui/Avatar';
import styles from './Header.module.css';

export function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={styles.header} role="banner">
      <div className={styles.left}>
        <h1 className={styles.greeting}>
          {getGreeting()}, <span className={styles.name}>{user?.displayName?.split(' ')[0]}</span>
        </h1>
      </div>

      <div className={styles.right}>
        <button
          className={styles.iconBtn}
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <div className={styles.userInfo}>
          <Avatar name={user?.displayName ?? 'User'} photoURL={user?.photoURL} size={36} />
          <div className={styles.userText}>
            <span className={styles.userName}>{user?.displayName}</span>
            <span className={styles.userRole}>{user?.role === 'doctor' ? 'Doctor' : 'Patient'}</span>
          </div>
        </div>

        <button className={styles.iconBtn} onClick={logout} aria-label="Sign out" title="Sign out">
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
