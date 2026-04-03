import { useState, useEffect, useCallback } from 'react';
import type { AssistantContext, AssistantSuggestion } from '../types';
import { assistantService } from '../services/assistant';

/**
 * Hook for getting context-aware assistant suggestions.
 * Re-fetches when context changes.
 */
export function useAssistant(context: AssistantContext) {
  const [suggestions, setSuggestions] = useState<AssistantSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const result = await assistantService.getSuggestions(context);
      setSuggestions(result);
    } catch (err) {
      console.error('[Assistant] Failed to get suggestions:', err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [
    context.role,
    context.currentPage,
    context.selectedPatientId,
    context.appointmentStatus,
    context.patientRiskLevel,
    context.hasUpcomingAppointment,
    context.lastVisitDaysAgo,
  ]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const dismiss = useCallback((id: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return { suggestions, loading, refresh, dismiss };
}
