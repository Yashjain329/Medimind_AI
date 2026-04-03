/** Core domain types for MediConnect */

export type UserRole = 'doctor' | 'patient';

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';

export type RiskLevel = 'low' | 'moderate' | 'high';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  createdAt: string;
}

export interface Doctor extends User {
  role: 'doctor';
  specialty: string;
  qualifications: string;
  yearsOfExperience: number;
  clinicAddress: string;
  clinicLat?: number;
  clinicLng?: number;
  availableSlots: string[]; // e.g. ["09:00","09:30","10:00"]
  bio: string;
}

export interface Patient extends User {
  role: 'patient';
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  bloodType: string;
  allergies: string[];
  conditions: string[];
  riskLevel: RiskLevel;
  emergencyContact: string;
  lastVisit?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  date: string; // ISO date
  time: string; // HH:mm
  duration: number; // minutes
  reason: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  medications: Medication[];
  notes: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface VisitSummary {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  symptoms: string[];
  treatment: string;
  followUpDate?: string;
  vitals?: Vitals;
}

export interface Vitals {
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  weight: number;
  oxygenSaturation: number;
}

/* ---- Assistant Types ---- */

export type SuggestionPriority = 'low' | 'medium' | 'high';

export type SuggestionAction =
  | 'navigate'
  | 'display-info'
  | 'create-appointment'
  | 'add-to-calendar'
  | 'show-summary'
  | 'medication-reminder';

export interface AssistantSuggestion {
  id: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  priority: SuggestionPriority;
  action: SuggestionAction;
  actionPayload?: Record<string, string>;
}

export interface AssistantContext {
  role: UserRole;
  currentPage: string;
  selectedPatientId?: string;
  selectedAppointmentId?: string;
  appointmentStatus?: AppointmentStatus;
  patientRiskLevel?: RiskLevel;
  hasUpcomingAppointment?: boolean;
  hasPendingPrescriptions?: boolean;
  lastVisitDaysAgo?: number;
}

/* ---- Service Interfaces ---- */

export interface AuthService {
  login(email: string, password: string): Promise<User>;
  loginWithGoogle(): Promise<User>;
  logout(): Promise<void>;
  getCurrentUser(): User | null;
  onAuthStateChanged(callback: (user: User | null) => void): () => void;
}

export interface DataService {
  /* Doctors */
  getDoctors(): Promise<Doctor[]>;
  getDoctor(id: string): Promise<Doctor | null>;
  updateDoctor(id: string, data: Partial<Doctor>): Promise<void>;

  /* Patients */
  getPatients(): Promise<Patient[]>;
  getPatient(id: string): Promise<Patient | null>;
  searchPatients(query: string): Promise<Patient[]>;
  updatePatient(id: string, data: Partial<Patient>): Promise<void>;

  /* Appointments */
  getAppointments(userId: string, role: UserRole): Promise<Appointment[]>;
  getAppointment(id: string): Promise<Appointment | null>;
  createAppointment(data: Omit<Appointment, 'id' | 'createdAt'>): Promise<Appointment>;
  updateAppointment(id: string, data: Partial<Appointment>): Promise<void>;

  /* Prescriptions */
  getPrescriptions(patientId: string): Promise<Prescription[]>;

  /* Visit Summaries */
  getVisitSummaries(patientId: string): Promise<VisitSummary[]>;

  /* Media / Avatars */
  uploadAvatar(userId: string, file: File): Promise<string>;
}

export interface AssistantServiceInterface {
  getSuggestions(context: AssistantContext): Promise<AssistantSuggestion[]>;
}

export interface CalendarService {
  generateAddToCalendarUrl(appointment: Appointment, doctorAddress?: string): string;
}
