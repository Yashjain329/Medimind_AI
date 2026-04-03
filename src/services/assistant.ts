/**
 * Smart Assistant Service
 *
 * Implements a pluggable assistant that provides context-aware suggestions.
 *
 * Two implementations:
 * 1. RulesAssistantService — In-memory rules engine (default)
 * 2. GeminiAssistantService — Stub for Vertex AI / Gemini integration
 *
 * Toggle via VITE_ASSISTANT_MODE env var: "rules" (default) or "gemini"
 */
import type {
  AssistantServiceInterface,
  AssistantContext,
  AssistantSuggestion,
} from '../types';

/* ============================================================
   Rules-based Assistant Engine
   ============================================================ */
export class RulesAssistantService implements AssistantServiceInterface {
  async getSuggestions(ctx: AssistantContext): Promise<AssistantSuggestion[]> {
    const suggestions: AssistantSuggestion[] = [];

    if (ctx.role === 'doctor') {
      suggestions.push(...this.getDoctorSuggestions(ctx));
    } else {
      suggestions.push(...this.getPatientSuggestions(ctx));
    }

    // Sort by priority: high → medium → low
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return suggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  private getDoctorSuggestions(ctx: AssistantContext): AssistantSuggestion[] {
    const s: AssistantSuggestion[] = [];

    // Dashboard-level suggestions
    if (ctx.currentPage === 'dashboard') {
      s.push({
        id: 'doc-today-summary',
        title: 'View today\'s schedule',
        description: 'Review all confirmed appointments and prepare for the day.',
        icon: 'Calendar',
        priority: 'high',
        action: 'navigate',
        actionPayload: { to: '/doctor/appointments' },
      });
    }

    // Patient detail view suggestions
    if (ctx.selectedPatientId) {
      s.push({
        id: 'doc-summarize-visits',
        title: 'Summarize recent visits',
        description: 'Quick overview of this patient\'s last 3 visits and key findings.',
        icon: 'FileText',
        priority: 'high',
        action: 'show-summary',
      });

      s.push({
        id: 'doc-check-medications',
        title: 'Check for drug interactions',
        description: 'Review current medications for potential conflicts.',
        icon: 'AlertTriangle',
        priority: 'medium',
        action: 'display-info',
      });

      s.push({
        id: 'doc-suggest-followup',
        title: 'Suggest follow-up date',
        description: 'Based on visit history, a follow-up in 4 weeks is recommended.',
        icon: 'CalendarPlus',
        priority: 'medium',
        action: 'create-appointment',
      });
    }

    // High risk patient warning
    if (ctx.patientRiskLevel === 'high') {
      s.push({
        id: 'doc-high-risk-alert',
        title: '⚠ High-risk patient',
        description: 'This patient has multiple risk factors. Review vitals and medication compliance carefully.',
        icon: 'ShieldAlert',
        priority: 'high',
        action: 'display-info',
      });
    }

    // Appointment-specific suggestions
    if (ctx.appointmentStatus === 'scheduled') {
      s.push({
        id: 'doc-confirm-appointment',
        title: 'Confirm appointment',
        description: 'Mark this appointment as confirmed to notify the patient.',
        icon: 'CheckCircle',
        priority: 'medium',
        action: 'display-info',
      });
    }

    // Long time since last visit
    if (ctx.lastVisitDaysAgo !== undefined && ctx.lastVisitDaysAgo > 30) {
      s.push({
        id: 'doc-overdue-followup',
        title: 'Overdue for follow-up',
        description: `Last visit was ${ctx.lastVisitDaysAgo} days ago. Consider scheduling a check-in.`,
        icon: 'Clock',
        priority: 'high',
        action: 'create-appointment',
      });
    }

    // General suggestions
    if (ctx.currentPage === 'patients') {
      s.push({
        id: 'doc-filter-high-risk',
        title: 'Filter high-risk patients',
        description: 'View patients who need immediate attention.',
        icon: 'Filter',
        priority: 'low',
        action: 'display-info',
      });
    }

    return s;
  }

  private getPatientSuggestions(ctx: AssistantContext): AssistantSuggestion[] {
    const s: AssistantSuggestion[] = [];

    // Dashboard suggestions
    if (ctx.currentPage === 'dashboard') {
      if (!ctx.hasUpcomingAppointment) {
        s.push({
          id: 'pat-book-appointment',
          title: 'Book an appointment',
          description: 'You don\'t have any upcoming appointments. Schedule one with your doctor.',
          icon: 'CalendarPlus',
          priority: 'high',
          action: 'navigate',
          actionPayload: { to: '/patient/book' },
        });
      } else {
        s.push({
          id: 'pat-add-to-calendar',
          title: 'Add to Google Calendar',
          description: 'Add your next appointment to your calendar so you don\'t forget.',
          icon: 'Calendar',
          priority: 'medium',
          action: 'add-to-calendar',
        });
      }

      s.push({
        id: 'pat-medication-reminder',
        title: 'Set medication reminder',
        description: 'Stay on track with your prescribed medications.',
        icon: 'Bell',
        priority: 'medium',
        action: 'medication-reminder',
      });
    }

    // Prescription view
    if (ctx.currentPage === 'prescriptions') {
      s.push({
        id: 'pat-understand-meds',
        title: 'Understand your medications',
        description: 'Get simple explanations for each prescribed medication.',
        icon: 'HelpCircle',
        priority: 'medium',
        action: 'display-info',
      });
    }

    // Appointment page
    if (ctx.currentPage === 'appointments') {
      s.push({
        id: 'pat-book-followup',
        title: 'Book follow-up appointment',
        description: 'Schedule your next visit based on your doctor\'s recommendation.',
        icon: 'CalendarPlus',
        priority: 'medium',
        action: 'navigate',
        actionPayload: { to: '/patient/book' },
      });
    }

    // Pending prescriptions
    if (ctx.hasPendingPrescriptions) {
      s.push({
        id: 'pat-pick-up-rx',
        title: 'Prescription ready',
        description: 'You have prescriptions to pick up from the pharmacy.',
        icon: 'Pill',
        priority: 'high',
        action: 'navigate',
        actionPayload: { to: '/patient/prescriptions' },
      });
    }

    // General wellness
    s.push({
      id: 'pat-ask-doctor',
      title: 'Ask your doctor a question',
      description: 'Send a follow-up question about your treatment or symptoms.',
      icon: 'MessageCircle',
      priority: 'low',
      action: 'display-info',
    });

    return s;
  }
}

/* ============================================================
   Gemini / Vertex AI Stub
   ============================================================

   This is the integration point for Google's Gemini AI.
   
   In production, this would:
   1. Send the AssistantContext to Gemini via the Vertex AI API
   2. Use a system prompt that understands the medical domain
   3. Parse structured JSON responses into AssistantSuggestion[]
   4. Apply safety filters for medical content
   
   Environment variable: VITE_GEMINI_API_KEY
   ============================================================ */
export class GeminiAssistantService implements AssistantServiceInterface {
  private readonly apiKey: string;
  private readonly fallback: RulesAssistantService;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY ?? '';
    this.fallback = new RulesAssistantService();
  }

  async getSuggestions(ctx: AssistantContext): Promise<AssistantSuggestion[]> {
    if (!this.apiKey) {
      console.warn('[Assistant] Gemini API key not set — using rules engine fallback');
      return this.fallback.getSuggestions(ctx);
    }

    try {
      /*
       * TODO: Replace with actual Gemini API call
       *
       * const response = await fetch(
       *   `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`,
       *   {
       *     method: 'POST',
       *     headers: { 'Content-Type': 'application/json' },
       *     body: JSON.stringify({
       *       contents: [{
       *         parts: [{ text: this.buildPrompt(ctx) }]
       *       }],
       *       generationConfig: {
       *         responseMimeType: 'application/json',
       *         responseSchema: { ... AssistantSuggestion[] schema ... }
       *       }
       *     })
       *   }
       * );
       *
       * const data = await response.json();
       * return this.parseGeminiResponse(data);
       */

      // Fallback to rules engine for now
      return this.fallback.getSuggestions(ctx);
    } catch (error) {
      console.error('[Assistant] Gemini API error, falling back to rules:', error);
      return this.fallback.getSuggestions(ctx);
    }
  }
}

/* ============================================================
   Export the configured implementation
   ============================================================ */
const mode = import.meta.env.VITE_ASSISTANT_MODE ?? 'rules';

export const assistantService: AssistantServiceInterface =
  mode === 'gemini' ? new GeminiAssistantService() : new RulesAssistantService();
