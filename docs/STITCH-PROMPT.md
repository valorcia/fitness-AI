# Prompt Stitch — CoachMe

Copier-coller dans [Stitch](https://stitch.withgoogle.com/). Inspiré des captures
"Entraînements / Tableau de bord / Calendrier" de l'app de référence, avec un
angle **coaching IA premium** beaucoup plus affirmé que les apps concurrentes.

---

## Prompt maître

> **Design a premium AI personal coaching app called "CoachMe"** (mobile-first,
> iOS and Android + responsive web).
>
> ## Brand
> - **Light theme** (clean off-white `#F5FAFA`), optional dark mode later.
> - **Primary (teal)** `#14B8A6` for actions, CTA, progress.
> - **Secondary (deep navy)** `#1B3954` for authority, titles, selected tabs.
> - Accent pale mint `#E0F2F1` for hover/selected states.
> - Surfaces: pure white cards with soft shadow (`0 16px 40px -24px #1b39541f`).
> - Corner radius 16–24px. Type: **Inter**. Active elements wear the navy
>   pill, idle elements wear the mint pill.
>
> ## Navigation
> - **Mobile top bar**: clock icon (left) · page title (centered) · list icon (right).
> - **Sub-tabs pill row** under the header: "Tableau de bord" (active — navy
>   pill with white text) / "Entraînements" / "Alimentation" (mint pill idle).
> - **Mobile bottom tab bar** (5 icons):
>   1. Entraînements (dumbbell) — active teal with underline indicator.
>   2. Feed (users) — red notification dot for new community posts.
>   3. Message (chat bubble) — opens the AI coach chat.
>   4. Manuel (open book) — guides, machine usage, safety.
>   5. Plus (three dots) — settings, subscription, SOS, notifications.
>
> ## Onboarding — 8 steps
> A single-column wizard, progress bar in teal, each step in a white card on
> the mint gradient background.
>
> 1. **Identité** — prénom, date de naissance, sexe.
> 2. **Corps** — taille, poids, niveau (4 pills Débutant→Elite).
> 3. **Objectif** — large tap cards with emoji (perte de poids 🔥, prise de
>    masse 💪, endurance 🏃, forme ⚡, santé ❤️). Environment tri-pick
>    (Salle / Maison / Extérieur). Séances/semaine + durée.
> 4. **Santé** — checklist medical flags (cardiaque, hypertension, diabète,
>    asthme, articulations, dos, grossesse, chirurgie récente). Free-text
>    "blessures", "pathologies", "traitements".
> 5. **Hygiène de vie** — tabac, alcool (unités/semaine), sommeil slider,
>    stress slider.
> 6. **Matériel** — multi-select chips (haltères, barre, rack, cable, rameur,
>    vélo, kettlebell, bandes, etc.) + toggle "outdoor autorisé".
> 7. **Mon coach** — champ "nom du coach", grille de 5 avatars gradient,
>    grille de 5 personnalités (Strict/Fun/Zen/Militaire/Elite) avec emoji.
> 8. **Consentement** — carte disclaimer médical obligatoire + consentement
>    données santé. Si step 4 a coché un flag à risque : case supplémentaire
>    "j'ai l'accord de mon médecin" (surlignée ambre).
>
> ## Dashboard (Tableau de bord)
> - **Banner bleu** "Découvrez comment créer de nouveaux entraînements".
> - **Banner teal** "Partage ton entraînement".
> - **Hero card plan** : navy gradient sur photo athlétique réaliste
>   (Unsplash), titre du plan, badge salle/home/outdoor, étoiles du niveau,
>   "X jours d'entraînement (Y séances/sem)", CTA "Démarrer la séance".
> - **KPIs 4 colonnes** : calories brûlées 7 j, streak, niveau, séances.
> - **Feuille de route "Entraînement suivant"** : liste de cartes, chaque
>   séance avec un cercle de progression teal (0% initial). Jours verrouillés
>   = icône cadenas, texte grisé. CTA "Démarrer" sur le prochain.
> - **Coach card** : avatar gradient + nom du coach + chat rapide.
> - **Objectif hebdomadaire** : progress bar + compteur "x/y séances" + flamme.
> - **Mon poids** : graphe ligne teal sur fond mint, valeur actuelle
>   surlignée en pill teal. Boutons "+0,1 kg" et "+1 kg" pour saisie rapide.
> - **Groupes musculaires travaillés** : tabs "Dernière / Semaine / Mois / Tout",
>   bar chart horizontal des groupes.
> - **Calories brûlées** : courbe kcal/jour.
>
> ## Calendar (mensuel)
> - Header : chevron gauche · mois (ex. "Avril 2026") · chevron droit.
> - Grille 7 colonnes, jours compacts. Dessous chaque jour : icône dumbbell
>   navy (séance prévue) ou teal (terminée), icône footprints ambre
>   (outdoor). Aujourd'hui = nombre en teal. Jour sélectionné = fond mint.
> - Panneau "Détail du jour" avec liste de séances + kcal totale.
>
> ## Entraînements (liste)
> - Bouton "Nouvelle séance libre" + "Générer un plan IA" en haut.
> - Cartes de séance : statut badge (prévu / en cours / terminé / sauté),
>   date, durée, score. CTA "Ouvrir" ou "Voir résumé".
>
> ## Workout player (séance en cours)
> - Photo réaliste de l'exercice/machine (Unsplash), sinon tuile gradient
>   par catégorie musculaire. Nom de l'exercice + sets/reps + poids.
> - Liste de cues.
> - Chrono de séance en pill, bouton voix on/off.
> - Repos : compte à rebours grand format.
> - Bouton primary full-width "Valider la série".
>
> ## Nutrition — traçabilité ultra-détaillée
> - Ring de calories du jour / objectif + macros P/G/L.
> - Hydratation avec +250 ml.
> - **Photo AI (style Cal AI)** : gros bouton caméra et bouton "Importer".
>   Après capture : preview, total kcal + macros, liste d'aliments détectés
>   avec portion & grammes, barre de confiance, bouton "Enregistrer".
> - Journal des repas par tranche horaire avec totaux jour/semaine.
>
> ## Coach page
> - Avatar coach rond gradient XL + nom + personnalité en badge.
> - Message contextuel du coach (salutation, rappel de la prochaine séance,
>   feedback sur la dernière performance).
> - Chat continu en-dessous.
> - Suggestions rapides (chips) : "Adapte ma séance", "Je suis fatigué",
>   "Je veux progresser", "Nutrition du jour".
>
> ## Exercise library
> - Sections par groupe musculaire, grille de cartes : photo réaliste de la
>   machine ou illustration gradient si pas de photo, nom, badges difficulté,
>   muscles ciblés, cue court.
>
> ## Community feed
> - Composer avec chips type (Note/Séance/Course/Exploit/Photo), textarea,
>   publish.
> - Feed : avatar + nom + time + badge type ; contenu + image ; heart +
>   comment counters.
>
> ## Manuel (onglet bas)
> - Cartes guides : démarrer CoachMe, bien utiliser les machines, traçabilité
>   calories, outdoor, sécurité & urgence.
>
> ## Plus
> - Liste : Paramètres, Abonnement, Progression (badges & XP), Profil santé,
>   Sécurité / SOS, Aide, Déconnexion.
>
> ## Safety SOS
> - Bouton rond rouge pulsant XL, texte 15/112, nom du contact primaire.
>
> ## Illustrations & photos
> - Machines/exercices : photos Unsplash réalistes quand disponibles, sinon
>   tuile gradient par groupe musculaire.
> - Coach : avatars ronds gradient avec emoji (Pulse 💪, Zen 🧘, Beast 🔥,
>   Officer 🎖️, Elite 🏆).
> - Badges : médailles avec liseré bronze / silver / gold / platinum.

---

## Raccourcis & variantes

- **Light theme** par défaut, palette teal + navy. Dark mode plus tard.
- **Mobile-first** strict. Toutes les cartes prennent 100% de largeur sur
  mobile, 2 colonnes à partir de md.
- **Réduction motion** : toutes les animations respectent
  `prefers-reduced-motion`.
- **Accessibilité** : contraste AA minimum, focus rings teal visibles.
- **Icônes** : `lucide-react` pour cohérence avec le code.
