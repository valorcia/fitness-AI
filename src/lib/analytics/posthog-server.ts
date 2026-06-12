import { PostHog } from "posthog-node";
import { env } from "../env";

/**
 * Server-side PostHog client — used to track events that originate on the
 * server (workout completed, subscription upgraded, memory created, etc.).
 */
let client: PostHog | null = null;

export function posthogServer(): PostHog | null {
  if (!env.POSTHOG_PROJECT_API_KEY) return null;
  if (!client) {
    client = new PostHog(env.POSTHOG_PROJECT_API_KEY, {
      host: env.NEXT_PUBLIC_POSTHOG_HOST,
      flushAt: 1, // serverless friendly
      flushInterval: 0,
    });
  }
  return client;
}

export async function trackServer(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
): Promise<void> {
  const ph = posthogServer();
  if (!ph) return;
  ph.capture({ distinctId, event, properties });
  await ph.shutdown().catch(() => null);
}
