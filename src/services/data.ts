/**
 * Data Service
 * Supports both Firestore and mock in-memory data.
 * Toggle via VITE_USE_MOCK_DATA or automatic Firebase detection.
 */
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, isFirebaseConfigured } from './firebase';
import type {
  DataService,
  Doctor,
  Patient,
  Appointment,
  Prescription,
  VisitSummary,
  UserRole,
} from '../types';
import {
  mockDoctors,
  mockPatients,
  mockAppointments,
  mockPrescriptions,
  mockVisitSummaries,
} from '../mock/data';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true' || 
                localStorage.getItem('USE_MOCK') === 'true' || 
                !isFirebaseConfigured;

/* ============================================================
   Mock Data Implementation
   ============================================================ */
class MockDataServiceImpl implements DataService {
  private appointments = [...mockAppointments];

  async getDoctors(): Promise<Doctor[]> {
    return mockDoctors;
  }

  async getDoctor(id: string): Promise<Doctor | null> {
    return mockDoctors.find((d) => d.id === id) ?? null;
  }

  async updateDoctor(id: string, data: Partial<Doctor>): Promise<void> {
    const idx = mockDoctors.findIndex((d) => d.id === id);
    if (idx !== -1) mockDoctors[idx] = { ...mockDoctors[idx], ...data } as Doctor;
  }

  async getPatients(): Promise<Patient[]> {
    return mockPatients;
  }

  async getPatient(id: string): Promise<Patient | null> {
    return mockPatients.find((p) => p.id === id) ?? null;
  }

  async updatePatient(id: string, data: Partial<Patient>): Promise<void> {
    const idx = mockPatients.findIndex((p) => p.id === id);
    if (idx !== -1) mockPatients[idx] = { ...mockPatients[idx], ...data } as Patient;
  }

  async searchPatients(q: string): Promise<Patient[]> {
    const lower = q.toLowerCase();
    return mockPatients.filter(
      (p) =>
        p.displayName.toLowerCase().includes(lower) ||
        p.email.toLowerCase().includes(lower) ||
        p.conditions.some((c) => c.toLowerCase().includes(lower))
    );
  }

  async getAppointments(userId: string, role: UserRole): Promise<Appointment[]> {
    const key = role === 'doctor' ? 'doctorId' : 'patientId';
    return this.appointments
      .filter((a) => a[key] === userId)
      .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
  }

  async getAppointment(id: string): Promise<Appointment | null> {
    return this.appointments.find((a) => a.id === id) ?? null;
  }

  async createAppointment(data: Omit<Appointment, 'id' | 'createdAt'>): Promise<Appointment> {
    const newApt: Appointment = {
      ...data,
      id: `apt-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.appointments.push(newApt);
    return newApt;
  }

  async updateAppointment(id: string, data: Partial<Appointment>): Promise<void> {
    const idx = this.appointments.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Appointment not found');
    this.appointments[idx] = { ...this.appointments[idx]!, ...data };
  }

  async getPrescriptions(patientId: string): Promise<Prescription[]> {
    return mockPrescriptions.filter((p) => p.patientId === patientId);
  }

  async getVisitSummaries(patientId: string): Promise<VisitSummary[]> {
    return mockVisitSummaries.filter((v) => v.patientId === patientId);
  }

  async uploadAvatar(_userId: string, file: File): Promise<string> {
    return URL.createObjectURL(file);
  }
}

/* ============================================================
   Firestore Data Implementation
   ============================================================ */
class FirestoreDataServiceImpl implements DataService {
  private getCollection(name: string) {
    if (!db) throw new Error('Firestore not initialized');
    return collection(db, name);
  }

  private getDocRef(collectionName: string, id: string) {
    if (!db) throw new Error('Firestore not initialized');
    return doc(db, collectionName, id);
  }

  async getDoctors(): Promise<Doctor[]> {
    const snap = await getDocs(query(this.getCollection('doctors'), orderBy('displayName')));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Doctor));
  }

  async getDoctor(id: string): Promise<Doctor | null> {
    const snap = await getDoc(this.getDocRef('doctors', id));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Doctor) : null;
  }

  async updateDoctor(id: string, data: Partial<Doctor>): Promise<void> {
    await updateDoc(this.getDocRef('doctors', id), data);
  }

  async getPatients(): Promise<Patient[]> {
    const snap = await getDocs(query(this.getCollection('patients'), orderBy('displayName')));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Patient));
  }

  async getPatient(id: string): Promise<Patient | null> {
    const snap = await getDoc(this.getDocRef('patients', id));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Patient) : null;
  }

  async updatePatient(id: string, data: Partial<Patient>): Promise<void> {
    await updateDoc(this.getDocRef('patients', id), data);
  }

  async searchPatients(q: string): Promise<Patient[]> {
    // Firestore doesn't support full-text search natively.
    // For production, integrate Algolia or Typesense.
    // Here we fetch all and filter client-side (suitable for small datasets).
    const all = await this.getPatients();
    const lower = q.toLowerCase();
    return all.filter(
      (p) =>
        p.displayName.toLowerCase().includes(lower) ||
        p.email.toLowerCase().includes(lower)
    );
  }

  async getAppointments(userId: string, role: UserRole): Promise<Appointment[]> {
    const field = role === 'doctor' ? 'doctorId' : 'patientId';
    const q = query(this.getCollection('appointments'), where(field, '==', userId));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Appointment))
      .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
  }

  async getAppointment(id: string): Promise<Appointment | null> {
    const snap = await getDoc(this.getDocRef('appointments', id));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Appointment) : null;
  }

  async createAppointment(data: Omit<Appointment, 'id' | 'createdAt'>): Promise<Appointment> {
    const docRef = await addDoc(this.getCollection('appointments'), {
      ...data,
      createdAt: new Date().toISOString(),
    });
    return { ...data, id: docRef.id, createdAt: new Date().toISOString() };
  }

  async updateAppointment(id: string, data: Partial<Appointment>): Promise<void> {
    await updateDoc(this.getDocRef('appointments', id), data);
  }

  async getPrescriptions(patientId: string): Promise<Prescription[]> {
    const q = query(this.getCollection('prescriptions'), where('patientId', '==', patientId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Prescription));
  }

  async getVisitSummaries(patientId: string): Promise<VisitSummary[]> {
    const q = query(this.getCollection('visitSummaries'), where('patientId', '==', patientId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as VisitSummary));
  }

  async uploadAvatar(userId: string, file: File): Promise<string> {
    if (!storage) throw new Error('Storage not initialized');
    const ext = file.name.split('.').pop();
    const storageRef = ref(storage, `avatars/${userId}.${ext}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }
}

/* ============================================================
   Export
   ============================================================ */
export const dataService: DataService = useMock
  ? new MockDataServiceImpl()
  : new FirestoreDataServiceImpl();
