/**
 * Dynamic event tracker for GA4 with fallback stdout log printing in development
 */
export function trackGAEvent(eventName: string, params?: Record<string, string | number | boolean | null | undefined>) {
  if (typeof window !== "undefined") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    if (win.gtag) {
      win.gtag("event", eventName, params);
      return;
    }
  }

  // Developer console print sandbox fallback
  console.log(`[GA4 Event Sandbox Log]: "${eventName}"`, params);
}
