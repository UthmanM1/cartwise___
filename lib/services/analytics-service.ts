import { DEMO_MODE } from '@/lib/config';
import type { AnalyticsEvent, AnalyticsEventType } from '@/lib/types';

export const EVENT_TYPES: AnalyticsEventType[] = [
  'page_viewed', 'search_started', 'search_completed', 'product_viewed', 'product_saved',
  'product_unsaved', 'comparison_started', 'comparison_product_added', 'comparison_product_removed',
  'comparison_completed', 'ai_comparison_started', 'ai_comparison_completed', 'watchlist_created',
  'watchlist_product_added', 'price_alert_created', 'merchant_clicked', 'account_created',
];

/**
 * AnalyticsService is the single funnel for every tracked event in the app.
 * Client components call the thin wrapper in lib/utils/track.ts, which
 * POSTs to /api/analytics/event, which calls this service server-side —
 * keeping event writes authenticated and validated in one place.
 */
export class AnalyticsService {
  private static memoryLog: (AnalyticsEvent & { createdAt: string })[] = [];

  static async track(event: AnalyticsEvent): Promise<void> {
    const record = { ...event, createdAt: new Date().toISOString() };

    if (DEMO_MODE) {
      this.memoryLog.push(record);
      if (this.memoryLog.length > 500) this.memoryLog.shift();
      return;
    }

    // LIVE MODE:
    // const supabase = createClient();
    // await supabase.from('analytics_events').insert({
    //   user_id: event.userId ?? null,
    //   session_id: event.sessionId ?? null,
    //   event_type: event.eventType,
    //   metadata: event.metadata ?? {},
    // });
  }

  /** Demo-mode-only accessor used by the admin dashboard when no database is configured. */
  static getMemoryLog() {
    return this.memoryLog;
  }

  static summarizeByType() {
    const counts = new Map<AnalyticsEventType, number>();
    this.memoryLog.forEach((e) => counts.set(e.eventType, (counts.get(e.eventType) ?? 0) + 1));
    return counts;
  }
}
