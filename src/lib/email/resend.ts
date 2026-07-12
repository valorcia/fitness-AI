import { Resend } from "resend";
import { env } from "@/lib/env";

export const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  opts?: { replyTo?: string },
): Promise<boolean> {
  if (!resend) return false;
  const { error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject,
    html,
    replyTo: opts?.replyTo,
  });
  if (error) {
    console.error("[Resend]", error);
    return false;
  }
  return true;
}

// ─── Shared layout ────────────────────────────────────────────
export function renderEmailLayout({
  preheader,
  heading,
  body,
  cta,
  ctaUrl,
  footer,
}: {
  preheader: string;
  heading: string;
  body: string;
  cta?: string;
  ctaUrl?: string;
  footer?: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const ctaButton =
    cta && ctaUrl
      ? `<tr><td align="center" style="padding:24px 0">
          <a href="${ctaUrl}" style="background:#4f46e5;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block">${cta}</a>
        </td></tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${heading}</title></head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:'Segoe UI',Arial,sans-serif">
<div style="display:none;max-height:0;overflow:hidden">${preheader}</div>
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:40px 16px">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px 40px;text-align:center">
    <p style="margin:0;color:#c7d2fe;font-size:12px;letter-spacing:.1em;text-transform:uppercase">Coachmii-fit</p>
    <h1 style="margin:8px 0 0;color:#fff;font-size:24px;font-weight:700">${heading}</h1>
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:32px 40px;color:#374151;font-size:15px;line-height:1.6">
    ${body}
  </td></tr>
  ${ctaButton ? `<tr><td style="padding:0 40px 8px">${ctaButton}</td></tr>` : ""}
  <!-- Footer -->
  <tr><td style="padding:24px 40px;border-top:1px solid #e5e7eb;text-align:center;color:#9ca3af;font-size:12px">
    ${footer ?? `Coachmii-fit · <a href="${appUrl}/settings" style="color:#9ca3af">Gérer mes notifications</a> · <a href="${appUrl}/settings?tab=rgpd" style="color:#9ca3af">Se désabonner</a>`}
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}
