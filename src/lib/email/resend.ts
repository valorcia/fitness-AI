import { Resend } from "resend";
import { env } from "@/lib/env";

export const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  opts?: { from?: string },
): Promise<boolean> {
  if (!resend) return false;
  try {
    await resend.emails.send({
      from: opts?.from ?? env.RESEND_FROM_EMAIL,
      to,
      subject,
      html,
    });
    return true;
  } catch {
    return false;
  }
}

type EmailLayoutOpts = {
  preheader: string;
  heading: string;
  body: string;
  cta?: string;
  ctaUrl?: string;
  footer?: string;
};

export function renderEmailLayout({ preheader, heading, body, cta, ctaUrl, footer }: EmailLayoutOpts): string {
  const btn = cta && ctaUrl
    ? `<div style="text-align:center;margin:32px 0"><a href="${ctaUrl}" style="background:#6C47FF;color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;display:inline-block">${cta}</a></div>`
    : "";
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${heading}</title></head><body style="margin:0;padding:0;background:#f4f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<span style="display:none;max-height:0;overflow:hidden">${preheader}</span>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:40px 16px"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:600px;width:100%">
<tr><td style="background:linear-gradient(135deg,#6C47FF,#4F8EF7);padding:32px 40px;text-align:center">
<span style="font-size:28px;font-weight:900;color:#fff;letter-spacing:-0.5px">Coachmii-fit</span>
</td></tr>
<tr><td style="padding:40px">
<h1 style="margin:0 0 24px;font-size:24px;font-weight:800;color:#0f172a">${heading}</h1>
${body}
${btn}
<p style="font-size:12px;color:#94a3b8;margin-top:32px;border-top:1px solid #e2e8f0;padding-top:16px">${footer ?? "Tu reçois cet e-mail car tu es inscrit(e) sur Coachmii-fit. <a href='{{unsubscribe}}' style='color:#94a3b8'>Se désabonner</a>"}</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}
