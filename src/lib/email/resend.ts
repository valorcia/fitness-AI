import { Resend } from "resend";
import { env } from "../env";
import { logger } from "../logger";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export type EmailKind =
  | "welcome"
  | "magic_link"
  | "weekly_recap"
  | "streak_milestone"
  | "subscription_changed"
  | "data_export_ready";

/**
 * Send a transactional email. Silently returns when Resend isn't configured
 * (development without API key) — never throws on the caller path.
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  opts: { kind: EmailKind; replyTo?: string } = { kind: "welcome" },
): Promise<{ id: string | null }> {
  if (!resend) {
    logger.info("email_skipped_no_api_key", { kind: opts.kind, to });
    return { id: null };
  }
  try {
    const res = await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to,
      subject,
      html,
      replyTo: opts.replyTo,
      tags: [{ name: "kind", value: opts.kind }],
    });
    return { id: res.data?.id ?? null };
  } catch (e) {
    logger.error("email_send_failed", {
      kind: opts.kind,
      error: e instanceof Error ? e.message : String(e),
    });
    return { id: null };
  }
}

/** Minimal HTML wrapper — branded, mobile-friendly, no external assets. */
export function renderEmail(opts: {
  preheader: string;
  heading: string;
  body: string;
  cta?: { label: string; url: string };
  footer?: string;
}): string {
  const cta = opts.cta
    ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 24px auto;"><tr><td align="center" style="background:#0F172A;border-radius:9999px;"><a href="${opts.cta.url}" style="display:inline-block;padding:12px 24px;color:#fff;text-decoration:none;font-weight:600;font-family:system-ui,-apple-system,sans-serif;font-size:15px;">${opts.cta.label}</a></td></tr></table>`
    : "";
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${opts.heading}</title></head><body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,sans-serif;color:#1e293b;">
<span style="display:none;visibility:hidden;opacity:0;color:transparent;height:0;width:0;">${opts.preheader}</span>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f4f5;padding:24px;"><tr><td align="center">
<table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="background:#ffffff;border-radius:16px;padding:32px;max-width:560px;">
<tr><td>
<h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#0F172A;">${opts.heading}</h1>
<div style="font-size:15px;line-height:1.6;color:#334155;">${opts.body}</div>
${cta}
<p style="margin-top:32px;font-size:12px;color:#94a3b8;line-height:1.5;">${opts.footer ?? "Coachmii-fit — votre compagnon de progression. Vous recevez cet email parce que vous êtes inscrit·e sur l'application. Vous pouvez gérer vos notifications depuis vos paramètres."}</p>
</td></tr></table>
</td></tr></table>
</body></html>`;
}
