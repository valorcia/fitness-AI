import { PostHog } from "posthog-node";
import { env } from "@/lib/env";
import type { PHEventName } from "./events";

function makeClient() {
  if (!env.POSTHOG_PROJECT_API_KEY) return null;
  return new PostHog(env.POSTHOG_PROJECT_API_KEY, {
    host: env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://eu.i.posthog.com",
    flushAt: 1,
    flushInterval: 0,
  });
}

export async function trackServer(
  distinctId: string,
  event: PHEventName,
  properties?: Record<string, unknown>,
) {
  const client = makeClient();
  if (!client) return;
  client.capture({ distinctId, event, properties });
  await client.shutdown();
}
