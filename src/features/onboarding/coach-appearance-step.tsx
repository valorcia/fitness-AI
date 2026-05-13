"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  BODY_HEIGHT_OPTIONS,
  BODY_SHAPE_OPTIONS,
  EYE_COLOR_OPTIONS,
  EYE_SHAPE_OPTIONS,
  ETHNICITY_OPTIONS,
  FACE_SHAPE_OPTIONS,
  GENDER_OPTIONS,
  HAIR_COLOR_OPTIONS,
  HAIR_STYLE_OPTIONS,
  MOUTH_OPTIONS,
  NOSE_OPTIONS,
  OUTFIT_COLOR_OPTIONS,
  OUTFIT_STYLE_OPTIONS,
  OUTFIT_TYPE_OPTIONS,
  SKIN_TONE_OPTIONS,
  type Option,
} from "@/lib/onboarding/coach-appearance";

export type CoachAppearanceState = {
  coachPreferredGender: string;
  coachPreferredEthnicity: string;
  coachPreferredHairColor: string;
  coachPreferredHairStyle: string;
  coachPreferredFaceShape: string;
  coachPreferredEyeColor: string;
  coachPreferredEyeShape: string;
  coachPreferredSkinTone: string;
  coachPreferredMouth: string;
  coachPreferredNose: string;
  coachPreferredBodyHeight: string;
  coachPreferredBodyShape: string;
  coachOutfitType: string;
  coachOutfitColor: string;
  coachOutfitStyle: string;
};

type Props = {
  state: CoachAppearanceState;
  update: <K extends keyof CoachAppearanceState>(k: K, v: CoachAppearanceState[K]) => void;
};

export function CoachAppearanceStep({ state, update }: Props) {
  return (
    <div className="grid gap-5">
      <div className="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs text-primary">
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <div>
          <p className="font-semibold">
            Composez l'apparence physique de votre coach.
          </p>
          <p className="mt-1 opacity-80">
            Un visage photoréaliste IA sera généré sur la base de vos critères. Indifférent =
            l'IA choisit pour vous.
          </p>
        </div>
      </div>

      <Section title="Identité" emoji="🪪">
        <Picker
          label="Sexe"
          options={GENDER_OPTIONS}
          value={state.coachPreferredGender}
          onChange={(v) => update("coachPreferredGender", v)}
        />
        <Picker
          label="Ethnie"
          options={ETHNICITY_OPTIONS}
          value={state.coachPreferredEthnicity}
          onChange={(v) => update("coachPreferredEthnicity", v)}
        />
      </Section>

      <Section title="Cheveux" emoji="💇">
        <Picker
          label="Couleur"
          options={HAIR_COLOR_OPTIONS}
          value={state.coachPreferredHairColor}
          onChange={(v) => update("coachPreferredHairColor", v)}
          variant="swatch"
        />
        <Picker
          label="Coupe / forme"
          options={HAIR_STYLE_OPTIONS}
          value={state.coachPreferredHairStyle}
          onChange={(v) => update("coachPreferredHairStyle", v)}
        />
      </Section>

      <Section title="Visage" emoji="🙂">
        <Picker
          label="Forme du visage"
          options={FACE_SHAPE_OPTIONS}
          value={state.coachPreferredFaceShape}
          onChange={(v) => update("coachPreferredFaceShape", v)}
        />
        <Picker
          label="Couleur de peau"
          options={SKIN_TONE_OPTIONS}
          value={state.coachPreferredSkinTone}
          onChange={(v) => update("coachPreferredSkinTone", v)}
          variant="swatch"
        />
        <Picker
          label="Couleur des yeux"
          options={EYE_COLOR_OPTIONS}
          value={state.coachPreferredEyeColor}
          onChange={(v) => update("coachPreferredEyeColor", v)}
          variant="swatch"
        />
        <Picker
          label="Forme des yeux"
          options={EYE_SHAPE_OPTIONS}
          value={state.coachPreferredEyeShape}
          onChange={(v) => update("coachPreferredEyeShape", v)}
        />
        <Picker
          label="Bouche"
          options={MOUTH_OPTIONS}
          value={state.coachPreferredMouth}
          onChange={(v) => update("coachPreferredMouth", v)}
        />
        <Picker
          label="Nez"
          options={NOSE_OPTIONS}
          value={state.coachPreferredNose}
          onChange={(v) => update("coachPreferredNose", v)}
        />
      </Section>

      <Section title="Corps" emoji="🏋️">
        <Picker
          label="Taille"
          options={BODY_HEIGHT_OPTIONS}
          value={state.coachPreferredBodyHeight}
          onChange={(v) => update("coachPreferredBodyHeight", v)}
        />
        <Picker
          label="Morphologie"
          options={BODY_SHAPE_OPTIONS}
          value={state.coachPreferredBodyShape}
          onChange={(v) => update("coachPreferredBodyShape", v)}
        />
      </Section>

      <Section title="Tenue sportive" emoji="👕">
        <Picker
          label="Type de vêtement"
          options={OUTFIT_TYPE_OPTIONS}
          value={state.coachOutfitType}
          onChange={(v) => update("coachOutfitType", v)}
        />
        <Picker
          label="Couleur dominante"
          options={OUTFIT_COLOR_OPTIONS}
          value={state.coachOutfitColor}
          onChange={(v) => update("coachOutfitColor", v)}
          variant="swatch"
        />
        <Picker
          label="Style"
          options={OUTFIT_STYLE_OPTIONS}
          value={state.coachOutfitStyle}
          onChange={(v) => update("coachOutfitStyle", v)}
        />
      </Section>
    </div>
  );
}

function Section({
  title,
  emoji,
  children,
}: {
  title: string;
  emoji: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
        <span className="text-base">{emoji}</span>
        {title}
      </h3>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function Picker({
  label,
  options,
  value,
  onChange,
  variant = "label",
}: {
  label: string;
  options: Option<string>[];
  value: string;
  onChange: (v: string) => void;
  variant?: "label" | "swatch";
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                selected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border hover:border-primary/50",
              )}
              title={opt.hint}
            >
              {variant === "swatch" && opt.swatch && (
                <span
                  className="inline-block h-4 w-4 rounded-full border border-border"
                  style={{ background: opt.swatch }}
                  aria-hidden
                />
              )}
              {opt.emoji && <span className="text-sm">{opt.emoji}</span>}
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
