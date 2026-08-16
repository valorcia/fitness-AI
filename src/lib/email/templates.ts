import { sendEmail, renderEmailLayout } from "./resend";

export async function sendWelcomeEmail(to: string, firstName: string, coachName: string) {
  const html = renderEmailLayout({
    preheader: `Bienvenue ${firstName} ! Ton coach ${coachName} t'attend.`,
    heading: `Bienvenue sur Coachmii-fit, ${firstName} ! 🎉`,
    body: `
      <p style="color:#334155;font-size:16px;line-height:1.6">Ton profil est créé et ton coach <strong>${coachName}</strong> est prêt à t'accompagner.</p>
      <p style="color:#334155;font-size:16px;line-height:1.6">Voici ce qui t'attend :</p>
      <ul style="color:#334155;font-size:15px;line-height:2">
        <li>🏋️ Un programme sur mesure basé sur tes objectifs</li>
        <li>💬 Des messages personnalisés de ton coach IA</li>
        <li>🔥 Un système de streaks et de badges pour rester motivé(e)</li>
        <li>📊 Le suivi complet de tes progrès</li>
      </ul>
    `,
    cta: "Commencer ma première séance",
    ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });
  return sendEmail(to, `Bienvenue sur Coachmii-fit, ${firstName} !`, html);
}

export type WeeklyRecapData = {
  firstName: string;
  coachName: string;
  workoutsCount: number;
  totalMinutes: number;
  caloriesKcal: number;
  streakDays: number;
  coachQuote: string;
};

export async function sendWeeklyRecapEmail(to: string, data: WeeklyRecapData) {
  const html = renderEmailLayout({
    preheader: `${data.firstName}, voici ton bilan de la semaine !`,
    heading: `Ton bilan de la semaine 📊`,
    body: `
      <p style="color:#334155;font-size:16px;line-height:1.6">Bonjour <strong>${data.firstName}</strong>,</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:24px 0">
        <tr>
          <td style="padding:12px;background:#f8fafc;border-radius:8px;text-align:center;width:25%">
            <div style="font-size:28px;font-weight:900;color:#6C47FF">${data.workoutsCount}</div>
            <div style="font-size:12px;color:#64748b;margin-top:4px">séances</div>
          </td>
          <td style="width:4%"></td>
          <td style="padding:12px;background:#f8fafc;border-radius:8px;text-align:center;width:25%">
            <div style="font-size:28px;font-weight:900;color:#6C47FF">${data.totalMinutes}</div>
            <div style="font-size:12px;color:#64748b;margin-top:4px">minutes</div>
          </td>
          <td style="width:4%"></td>
          <td style="padding:12px;background:#f8fafc;border-radius:8px;text-align:center;width:25%">
            <div style="font-size:28px;font-weight:900;color:#6C47FF">${data.caloriesKcal}</div>
            <div style="font-size:12px;color:#64748b;margin-top:4px">kcal</div>
          </td>
          <td style="width:4%"></td>
          <td style="padding:12px;background:#f8fafc;border-radius:8px;text-align:center;width:25%">
            <div style="font-size:28px;font-weight:900;color:#f97316">${data.streakDays}🔥</div>
            <div style="font-size:12px;color:#64748b;margin-top:4px">jours de suite</div>
          </td>
        </tr>
      </table>
      <blockquote style="border-left:4px solid #6C47FF;margin:24px 0;padding:16px 20px;background:#f8f5ff;border-radius:0 8px 8px 0;font-style:italic;color:#334155">"${data.coachQuote}" — ${data.coachName}</blockquote>
    `,
    cta: "Voir mon tableau de bord",
    ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });
  return sendEmail(to, `Ton bilan de la semaine · Coachmii-fit`, html);
}

const MILESTONE_MESSAGES: Record<number, string> = {
  3: "3 jours de suite — tu prends de bonnes habitudes !",
  7: "1 semaine sans faille — incroyable !",
  14: "2 semaines — tu es sur une lancée 🚀",
  30: "30 jours ! Tu es maintenant un(e) habitué(e) !",
  60: "2 mois de régularité — c'est impressionnant !",
  100: "100 jours ! Tu fais partie de l'élite 🏆",
  365: "1 an de sport quotidien — tu es une légende 👑",
};

export async function sendStreakMilestoneEmail(
  to: string,
  firstName: string,
  coachName: string,
  streak: number,
) {
  const msg = MILESTONE_MESSAGES[streak] ?? `${streak} jours de suite — félicitations !`;
  const html = renderEmailLayout({
    preheader: `${firstName}, ${msg}`,
    heading: `🔥 ${streak} jours de suite !`,
    body: `
      <p style="color:#334155;font-size:16px;line-height:1.6">Bravo <strong>${firstName}</strong> !</p>
      <p style="color:#334155;font-size:16px;line-height:1.6">${msg}</p>
      <p style="color:#334155;font-size:16px;line-height:1.6">Ton coach <strong>${coachName}</strong> est fier de toi. Continue sur cette lancée !</p>
      <div style="text-align:center;font-size:72px;margin:24px 0">🏆</div>
    `,
    cta: "Voir ma progression",
    ctaUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });
  return sendEmail(to, `🔥 ${streak} jours de suite sur Coachmii-fit !`, html);
}
