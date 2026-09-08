'use client';

import type { AnalyticsEventType } from '@/lib/types';

let sessionId: string | null = null;
function getSessionId() {
  if (typeof window === 'undefined') return undefined;
  if (!sessionId) {
    sessionId = window.sessionStorage.getItem('cw_session_id') ?? crypto.randomUUID();
    window.sessionStorage.setItem('cw_session_id', sessionId);
  }
  return sessionId;
}

/** Client-side helper: fire-and-forget analytics event, never blocks the UI. */
export function track(eventType: AnalyticsEventType, metadata?: Record<string, unknown>) {
  const body = JSON.stringify({ eventType, metadata, sessionId: getSessionId() });
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics/event', new Blob([body], { type: 'application/json' }));
    } else {
      fetch('/api/analytics/event', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true });
    }
  } catch {
    // Analytics must never break the app.
  }
}
