import posthog from 'posthog-js';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

let isPostHogInitialized = false;

export function initializeTelemetry() {
  if (typeof window === 'undefined') return;

  if (POSTHOG_KEY) {
    try {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        person_profiles: 'identified_only',
        capture_pageview: true,
        loaded: () => {
          isPostHogInitialized = true;
          if (process.env.NODE_ENV === 'development') {
            console.log('PostHog initialized successfully.');
          }
        },
      });
    } catch (err) {
      console.error('Failed to initialize PostHog:', err);
    }
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.log('PostHog key missing. Running in mock/console telemetry mode.');
    }
  }
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  if (isPostHogInitialized) {
    posthog.capture(eventName, properties);
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Telemetry Event] ${eventName}:`, properties);
    }
  }
}

export function identifyUser(userId: string, email?: string, name?: string) {
  if (typeof window === 'undefined') return;

  if (isPostHogInitialized) {
    posthog.identify(userId, {
      email,
      name,
    });
  } else {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Telemetry Identify] ${userId}:`, { email, name });
    }
  }
}

export function resetTelemetry() {
  if (typeof window === 'undefined') return;

  if (isPostHogInitialized) {
    posthog.reset();
  }
}

export function trackError(error: any, context?: Record<string, any>) {
  console.error('[Telemetry Error]:', error, context);
  
  // Track error event in PostHog
  trackEvent('exception_caught', {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  });
}
