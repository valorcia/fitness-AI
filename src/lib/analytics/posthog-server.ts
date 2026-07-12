import { PostHog } from "posthog-node";
import { env } from "@/lib/env";

let _client: PostHog | null = null;

function getClient(): PostHog | null {
  if (!env.POSTHOG_PROJECT_API_KEY) return null;
  if (!_client) {
    _client = new PostHog(env.POSTHOG_PROJECT_API_KEY, {
      host: env.NEXT_PUBLIC_POSTHOG_HOST,
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return _client;
}

export async function trackServer(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>,
): Promise<void> {
  const client = getClient();
  if (!client) return;
  client.capture({ distinctId, event, properties: properties ?? {} });
  await client.flush();
}
