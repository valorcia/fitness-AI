# Prompt Stitch — PulseCoach AI

Copier-coller le prompt ci-dessous dans [Stitch](https://stitch.withgoogle.com/) pour générer l'UI de PulseCoach. Adapté mobile-first + desktop responsive.

---

## Prompt maître

> **Design a premium fitness AI mobile + web app called "PulseCoach AI".**
>
> ## Brand
> - Dark-first, Apple Fitness+ / Whoop / Tesla minimal vibe.
> - Primary accent: electric blue `#3B82F6` with cyan glow `#22D3EE`.
> - Background: near-black `#050816` with subtle radial blue/purple gradients at the top.
> - Cards: `rgba(255,255,255,0.04)` glass with 1px border `rgba(255,255,255,0.08)`, blur 24px.
> - Typography: Inter, bold display weights for headings, tight letter-spacing. Gradient text for hero words.
> - Corner radius 16–24px. Large airy spacing. Motion: soft springs, 200ms.
>
> ## Flows & screens
>
> ### 1. Marketing landing (web)
> - Hero: headline in 2 lines with gradient accent on "coach sportif IA". Subhead 18px muted. Two CTAs (primary glowing + ghost outline). Badge pill "NEW · Coach vocal IA" at top with sparkle icon.
> - 4 preview glass cards below hero: Séance adaptée, Run tracker, Vélo live, Récupération.
> - Features grid 8 cards (2x4): AI coach, voice personalities, gym catalog, outdoor GPS, health integrations, safety SOS, gamification, nutrition. Each card: icon top-left in blue bubble, title, 2-line description.
> - Pricing grid 4 columns: Free / Premium 9.90€ / Pro 19.90€ / Elite 29.90€. Highlight Premium with primary ring + "Le plus choisi" badge. Check-list features with small check icon.
> - Final CTA glass card full-width with glowing button.
>
> ### 2. Onboarding wizard (mobile + web)
> - 6 steps in a card: Identité → Corps → Objectif → Santé → Matériel → Consentement.
> - Progress bar at top with gradient fill.
> - Step chrome: current step title + "Étape X / 6". Animated transitions (slide+fade).
> - Inputs: rounded-xl, subtle inner highlight, focused ring blue.
> - Goal step uses 5 large tap cards (with emoji + label + 1-line desc): Perte de poids 🔥, Prise de masse 💪, Endurance 🏃, Remise en forme ⚡, Santé ❤️.
> - Equipment step: multi-select chips with gradient when active.
> - Final step: consent checkbox + big "Générer mon plan" button (primary glow) + subtle loading spinner morphing into success ✓.
>
> ### 3. Dashboard
> - Top greeting "Bonjour, {prénom} 👋" + subscription badge.
> - 4 KPI cards: Streak (🔥 days), Niveau (Lvl + XP), Charge 7j, Récupération.
> - 2-column layout: left "Prochaine séance" big card with muscle-preview and primary glowing button "Démarrer". Under it a weekly objective progress bar.
> - Right side: Coach chat card featuring the customizable Coach avatar (circular avatar with emoji + gradient), coach name, and chat bubbles. Input with Send icon button.
>
> ### 4. Workout live / player
> - Big exercise title + animated illustration of the movement (loop, 2s, looping silhouette doing squat/bench/etc.) inside a gradient-tiled tile that matches the muscle category color.
> - Sets counter "3 / 5" chip top right.
> - Cue list with bullet dots.
> - During rest: big countdown timer (60s style, circular progress) that fills up with gradient.
> - Bottom: primary "Valider la série" large pill-shaped button. Secondary voice toggle + stopwatch chip.
> - Voice pulse ring animation when coach speaks.
>
> ### 5. Exercise library
> - Responsive card grid. Each card: illustration tile (gradient background unique per muscle group), exercise name, difficulty badge, muscle chips, 1-line cue. Filter bar at top: category pills, equipment filter, search.
> - On hover (web): card lifts and gradient glows.
>
> ### 6. Outdoor live
> - Full-bleed map (dark theme) with animated polyline in gradient color.
> - Overlay card at bottom: 3 big metrics Distance / Durée / Allure. Start/Pause/Stop circular buttons (primary glow + outline). Heart icon with BPM if available.
> - Zone cardio strip: 5 segments colored (grey / blue / green / orange / red) showing current zone.
>
> ### 7. Calendar (month view)
> - Header with month name + prev/next arrows.
> - 7-column grid. Day cells show date number, small chips for workouts (dumbbell icon, status color: amber planned, emerald completed) and outdoor activity (footprints amber). Today cell has blue ring.
> - Below: detail panel for selected day with list of workouts (clickable → /workout/{id}), activities, kcal total.
>
> ### 8. Nutrition
> - Calorie progress (circular or horizontal) + kcal target.
> - Hydration progress with big "+250 ml" primary button.
> - Prominent **Photo AI** card: big camera button "Prendre une photo" with gradient glow + "Importer" outline. After capture: preview image, kcal + macros summary, list of detected food items with grams, confidence bar.
> - Meal log list grouped by time.
>
> ### 9. Community feed
> - Compose card at top: type chips (Note/Séance/Course/Exploit/Photo), textarea, publish button.
> - Feed of posts: avatar + name + time + type badge, content, optional image, heart + comment counter buttons (heart animates on tap, filled primary when liked).
>
> ### 10. Progression
> - 3 KPI tiles: Niveau + XP bar, Streak flame, Badge count.
> - Grid of badges (bronze/silver/gold/platinum tiers with distinct rim colors), opacity dim for locked.
> - XP ledger list with timestamps.
>
> ### 11. Subscription
> - 4 tier cards matching landing pricing. Current plan highlighted with "Plan actuel" pill. Actions: "S'abonner" or "Ouvrir portail".
>
> ### 12. Settings → Coach personnalisé
> - Large circular avatar (gradient bubble + emoji) centered.
> - Input "Nom du coach" (default Pulse).
> - Avatar grid: 5 options (Pulse, Zen, Beast, Officer, Elite) — distinct gradient and emoji each.
> - Personality grid: Strict / Fun / Zen / Militaire / Elite (pill buttons).
> - Toggle "Voix coach".
>
> ### 13. Safety SOS
> - Big circular red SOS button with pulsing outer ring. Warning text about 15/112. Secondary info: primary contact name.
>
> ## Mobile specifics
> - Bottom tab bar (5 items max): Dashboard, Séance, Calendrier, Nutrition, Communauté. Active tab with gradient icon + indicator bar.
> - Safe areas respected. Swipe-down to refresh.
>
> ## Illustrations
> - Exercises: silhouette animations (person doing the movement), solid gradient backgrounds per muscle group (blue=lower, red-orange=push, purple-pink=pull, amber-red=full body, rose-amber=core, emerald-cyan=cardio, indigo-violet=mobility).
> - Coach avatars: round gradient bubbles with an emoji (💪 Pulse, 🧘 Zen, 🔥 Beast, 🎖️ Officer, 🏆 Elite).
> - Badges: medal-like with tier rim.
>
> Use ShadCN/Radix-flavored components. Export as Figma + React components.

---

## Raccourcis & variants

- **Dark theme uniquement** — pas de mode clair pour l'app, seulement pour la landing.
- **Animations** : réduction motion respecté (`prefers-reduced-motion`).
- **Accessibilité** : contraste AAA sur texte principal, focus rings visibles.
- **Icônes** : lucide-react pour cohérence avec le code existant.
