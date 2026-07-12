import { renderEmailLayout, sendEmail } from "./resend";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// ─── Welcome email ────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, firstName: string, coachName: string) {
  const html = renderEmailLayout({
    preheader: `Bienvenue ${firstName} — ${coachName} est prêt(e) à t'accompagner !`,
    heading: `Bienvenue sur Coachmii-fit, ${firstName} !`,
    body: `
      <p>C'est parti ! <strong>${coachName}</strong>, ton coach personnel IA, est prêt(e) à t'accompagner dans chaque séance, chaque objectif et chaque progrès.</p>
      <p>Voici ce que tu peux faire dès maintenant&nbsp;:</p>
      <ul>
        <li>💬 <strong>Parler à ${coachName}</strong> pour obtenir un programme sur-mesure</li>
        <li>🏋️ <strong>Commencer ta première séance</strong> depuis le tableau de bord</li>
        <li>📊 <strong>Suivre tes progrès</strong> avec les statistiques hebdomadaires</li>
      </ul>
      <p>Prêt(e) à changer la donne ?</p>
    `,
    cta: "Ouvrir mon tableau de bord",
    ctaUrl: `${APP_URL}/dashboard`,
    footer: `Coachmii-fit · Tu reçois cet email car tu viens de créer un compte. <a href="${APP_URL}/settings?tab=rgpd" style="color:#9ca3af">Se désabonner</a>`,
  });
  return sendEmail(to, `Bienvenue sur Coachmii-fit, ${firstName} !`, html);
}

// ─── Weekly recap email ───────────────────────────────────────
export interface WeeklyRecapData {
  firstName: string;
  coachName: string;
  workoutsCompleted: number;
  totalMinutes: number;
  caloriesBurned: number;
  currentStreak: number;
  coachMessage: string;
  topExercise?: string;
  nextGoal?: string;
}

export async function sendWeeklyRecapEmail(to: string, data: WeeklyRecapData) {
  const { firstName, coachName, workoutsCompleted, totalMinutes, caloriesBurned, currentStreak, coachMessage, topExercise, nextGoal } = data;

  const statsRow = `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0">
      <tr>
        <td style="text-align:center;padding:16px;background:#f5f3ff;border-radius:12px;width:33%">
          <p style="margin:0;font-size:28px;font-weight:700;color:#4f46e5">${workoutsCompleted}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#6b7280">séances</p>
        </td>
        <td width="8"></td>
        <td style="text-align:center;padding:16px;background:#f5f3ff;border-radius:12px;width:33%">
          <p style="margin:0;font-size:28px;font-weight:700;color:#4f46e5">${totalMinutes}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#6b7280">minutes</p>
        </td>
        <td width="8"></td>
        <td style="text-align:center;padding:16px;background:#f5f3ff;border-radius:12px;width:33%">
          <p style="margin:0;font-size:28px;font-weight:700;color:#4f46e5">${caloriesBurned}</p>
          <p style="margin:4px 0 0;font-size:12px;color:#6b7280">kcal</p>
        </td>
      </tr>
    </table>`;

  const streakBlock = currentStreak > 0
    ? `<p style="background:#fef3c7;border-radius:8px;padding:12px 16px;margin:16px 0">🔥 <strong>${currentStreak} jours de streak</strong> — continue comme ça !</p>`
    : "";

  const topBlock = topExercise
    ? `<p>⭐ Exercice phare de la semaine : <strong>${topExercise}</strong></p>`
    : "";

  const nextBlock = nextGoal
    ? `<p>🎯 Objectif de la semaine prochaine : <em>${nextGoal}</em></p>`
    : "";

  const html = renderEmailLayout({
    preheader: `Ton bilan de la semaine avec ${coachName} — ${workoutsCompleted} séance${workoutsCompleted > 1 ? "s" : ""} complétée${workoutsCompleted > 1 ? "s" : ""} !`,
    heading: `Ton bilan de la semaine 📊`,
    body: `
      <p>Salut <strong>${firstName}</strong> ! Voici ce que ${coachName} a retenu de ta semaine.</p>
      ${statsRow}
      ${streakBlock}
      <div style="background:#f9fafb;border-left:4px solid #4f46e5;border-radius:4px;padding:16px;margin:16px 0">
        <p style="margin:0;font-style:italic;color:#374151">"${coachMessage}"</p>
        <p style="margin:8px 0 0;font-size:12px;color:#9ca3af">— ${coachName}, ton coach</p>
      </div>
      ${topBlock}
      ${nextBlock}
    `,
    cta: "Voir mon tableau de bord",
    ctaUrl: `${APP_URL}/dashboard`,
  });
  return sendEmail(to, `Ton bilan de la semaine — Coachmii-fit`, html);
}

// ─── Streak milestone email ───────────────────────────────────
export async function sendStreakMilestoneEmail(
  to: string,
  firstName: string,
  coachName: string,
  streak: number,
) {
  const milestoneEmoji =
    streak >= 100 ? "🏆" : streak >= 30 ? "🥇" : streak >= 14 ? "🥈" : "🔥";

  const html = renderEmailLayout({
    preheader: `${milestoneEmoji} ${streak} jours de streak — incroyable, ${firstName} !`,
    heading: `${milestoneEmoji} ${streak} jours de suite !`,
    body: `
      <p><strong>${firstName}</strong>, c'est officiel : tu es en feu ! 🔥</p>
      <p>Tu viens d'atteindre <strong>${streak} jours consécutifs</strong> d'activité. C'est une performance dont tu peux être fier(e).</p>
      <p>${coachName} est impressionné(e) et tient à te le dire personnellement&nbsp;:</p>
      <div style="background:#fef3c7;border-radius:12px;padding:20px;margin:16px 0;text-align:center">
        <p style="font-size:40px;margin:0">${milestoneEmoji}</p>
        <p style="margin:8px 0 0;font-weight:600;color:#92400e">"${streak} jours — tu m'épates. Ne t'arrête pas !"</p>
        <p style="margin:4px 0 0;font-size:12px;color:#b45309">— ${coachName}</p>
      </div>
      <p>Chaque jour compte. Continue sur ta lancée !</p>
    `,
    cta: "Voir ma progression",
    ctaUrl: `${APP_URL}/progression`,
  });
  return sendEmail(
    to,
    `${milestoneEmoji} ${streak} jours de streak — bravo ${firstName} !`,
    html,
  );
}
