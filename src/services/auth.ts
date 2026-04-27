/**
 * Authentication Service
 * Supports both Firebase Auth and mock authentication.
 * Toggle via VITE_USE_MOCK_DATA env var or automatic detection.
 */
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';
import type { User, AuthService } from '../types';
import { mockDoctors, mockPatients, demoAccounts } from '../mock/data';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true' || 
                localStorage.getItem('USE_MOCK') === 'true' || 
                !isFirebaseConfigured;

// If Firebase is properly configured and no explicit mock override in .env,
// clear any stale USE_MOCK flag so Firebase is used on the next load.
if (isFirebaseConfigured && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
  localStorage.removeItem('USE_MOCK');
}

/**
 * Maps a Firebase user + Firestore profile doc to our User type.
 */
async function mapFirebaseUser(fbUser: FirebaseUser): Promise<User> {
  // Try fetching the user profile from Firestore
  if (db) {
    try {
      const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          id: fbUser.uid,
          email: fbUser.email ?? '',
          displayName: data['displayName'] ?? fbUser.displayName ?? 'User',
          role: data['role'] ?? 'patient',
          photoURL: data['photoURL'] ?? fbUser.photoURL ?? undefined,
          createdAt: data['createdAt'] ?? new Date().toISOString(),
        };
      }
    } catch {
      // Firestore not available — fall through to demo/default mapping
      console.warn('[Firebase] Firestore unavailable, using fallback profile mapping');
    }
  }

  // Fallback: check if this is a known demo account to get the correct role
  const allMockUsers = [...mockDoctors, ...mockPatients];
  const matchedMock = allMockUsers.find((u) => u.email === fbUser.email);

  return {
    id: fbUser.uid,
    email: fbUser.email ?? '',
    displayName: matchedMock?.displayName ?? fbUser.displayName ?? 'User',
    role: matchedMock?.role ?? 'patient',
    photoURL: fbUser.photoURL ?? undefined,
    createdAt: new Date().toISOString(),
  };
}

/* ============================================================
   Mock Auth Implementation
   ============================================================ */
class MockAuthServiceImpl implements AuthService {
  private currentUser: User | null = null;
  private listeners: Set<(user: User | null) => void> = new Set();

  async login(email: string, _password: string): Promise<User> {
    // Find matching user in mock data
    const allUsers = [...mockDoctors, ...mockPatients];
    const user = allUsers.find((u) => u.email === email);

    if (!user) {
      throw new Error('Invalid credentials. Try demo accounts.');
    }

    this.currentUser = user;
    this.notifyListeners();
    return user;
  }

  async loginWithGoogle(): Promise<User> {
    // Mock Google login → default to doctor demo account
    const user = mockDoctors[0];
    if (!user) throw new Error('No mock doctor available');
    this.currentUser = user;
    this.notifyListeners();
    return user;
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    this.notifyListeners();
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    this.listeners.add(callback);
    // Immediately fire with current state
    callback(this.currentUser);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach((cb) => cb(this.currentUser));
  }
}

/* ============================================================
   Firebase Auth Implementation
   ============================================================ */
class FirebaseAuthServiceImpl implements AuthService {
  private currentUser: User | null = null;

  async login(email: string, password: string): Promise<User> {
    if (!auth) throw new Error('Firebase Auth not initialized');
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = await mapFirebaseUser(cred.user);
      this.currentUser = user;
      // Clear any stale mock flag so we stay on Firebase mode
      localStorage.removeItem('USE_MOCK');
      return user;
    } catch (error: any) {
      // Auto-create demo accounts if they don't exist
      const isDemo = Object.values(demoAccounts).some(a => a.email === email);
      if (isDemo && (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/invalid-login-credentials')) {
        const newCred = await createUserWithEmailAndPassword(auth, email, password);
        const user = await mapFirebaseUser(newCred.user);
        this.currentUser = user;
        // Clear any stale mock flag
        localStorage.removeItem('USE_MOCK');
        return user;
      }
      throw error;
    }
  }

  async loginWithGoogle(): Promise<User> {
    if (!auth) throw new Error('Firebase Auth not initialized');
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const user = await mapFirebaseUser(cred.user);
    this.currentUser = user;
    return user;
  }

  async logout(): Promise<void> {
    if (!auth) throw new Error('Firebase Auth not initialized');
    await signOut(auth);
    this.currentUser = null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    if (!auth) {
      callback(null);
      return () => {};
    }

    return firebaseOnAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const user = await mapFirebaseUser(fbUser);
          this.currentUser = user;
          callback(user);
        } catch {
          callback(null);
        }
      } else {
        this.currentUser = null;
        callback(null);
      }
    });
  }
}

/* ============================================================
   Export the appropriate implementation
   ============================================================ */
export const authService: AuthService = useMock
  ? new MockAuthServiceImpl()
  : new FirebaseAuthServiceImpl();

export { demoAccounts };
