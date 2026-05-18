"use client";

import * as React from "react";
import { Sparkles, Loader2, Wand2, Upload, X, Image as ImageIcon, Camera, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { StandardCoachGallery, type StandardCoachItem } from "@/features/coach/standard-coach-gallery";
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
  OUTFIT_BOTTOM_OPTIONS,
  OUTFIT_COLOR_OPTIONS,
  OUTFIT_STYLE_OPTIONS,
  OUTFIT_TOP_OPTIONS,
  SKIN_TONE_OPTIONS,
  type Option,
} from "@/lib/onboarding/coach-appearance";
import { CoachAvatarPreview, useCoachPreview } from "./coach-avatar-preview";

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
  coachOutfitTop: string;
  coachOutfitBottom: string;
  coachOutfitColor: string;
  coachOutfitStyle: string;
};

type Persona = "STRICT" | "FUN" | "ZEN" | "MILITARY" | "ELITE";

type Props = {
  state: CoachAppearanceState;
  update: <K extends keyof CoachAppearanceState>(k: K, v: CoachAppearanceState[K]) => void;
  persona: Persona;
  coachName: string;
  /** Selected slug from the standard coach gallery. */
  selectedCoachSlug?: string | null;
  /** Called when user picks a different standard coach. */
  onSelectCoach?: (slug: string, coach: StandardCoachItem) => void;
  /** When false, hides the photo upload + per-criteria customization (gated to PREMIUM+). */
  canCustomize?: boolean;
};

export function CoachAppearanceStep({
  state,
  update,
  persona,
  coachName,
  selectedCoachSlug,
  onSelectCoach,
  canCustomize = false,
}: Props) {
  const generation = useCoachPreview(state, persona, coachName);

  return (
    <div className="relative grid gap-5 lg:grid-cols-[1fr_320px]">
      <div className="grid gap-5 lg:pr-2">
        <div className="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs text-primary">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div>
            <p className="font-semibold">Choisissez votre coach</p>
            <p className="mt-1 opacity-80">
              {canCustomize
                ? "Sélectionnez l'un des 10 coachs ou personnalisez le vôtre ci-dessous (Premium)."
                : "Sélectionnez l'un des 10 coachs ci-dessous. La personnalisation totale (photo, traits, morphologie) est réservée aux abonnés Premium."}
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
            <span className="text-base">🎽</span>
            Les 10 coachs
            <span className="ml-1 rounded-full bg-green-500/15 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-green-600 dark:text-green-400">
              Inclus
            </span>
          </h3>
          <StandardCoachGallery
            value={selectedCoachSlug ?? null}
            onChange={(slug, coach) => onSelectCoach?.(slug, coach)}
          />
        </section>

        {!canCustomize && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-400/40 bg-amber-50 dark:bg-amber-950/20 p-4 text-sm">
            <Crown className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-200">
                Personnalisation totale avec Premium
              </p>
              <p className="mt-1 text-amber-800/90 dark:text-amber-300/90">
                Avec un abonnement Premium, vous pouvez importer une photo de votre choix
                comme inspiration, ou définir précisément les traits, la morphologie et
                la tenue de votre coach.
              </p>
            </div>
          </div>
        )}

        {canCustomize && (
        <PhotoUploadCard generation={generation} />
        )}

      {canCustomize && !generation.sourcePhotoUrl && (
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
      )}

      {canCustomize && !generation.sourcePhotoUrl && (
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
      )}

      {canCustomize && !generation.sourcePhotoUrl && (
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
      )}

      {canCustomize && !generation.sourcePhotoUrl && (
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
      )}

      {canCustomize && (
      <Section title="Tenue sportive" emoji="👕">
        <Picker
          label="Haut"
          options={OUTFIT_TOP_OPTIONS}
          value={state.coachOutfitTop}
          onChange={(v) => update("coachOutfitTop", v)}
        />
        <Picker
          label="Bas"
          options={OUTFIT_BOTTOM_OPTIONS}
          value={state.coachOutfitBottom}
          onChange={(v) => update("coachOutfitBottom", v)}
        />
        <Picker
          label="Couleur dominante"
          options={OUTFIT_COLOR_OPTIONS}
          value={state.coachOutfitColor}
          onChange={(v) => update("coachOutfitColor", v)}
          variant="swatch"
        />
        <Picker
          label="Style général"
          options={OUTFIT_STYLE_OPTIONS}
          value={state.coachOutfitStyle}
          onChange={(v) => update("coachOutfitStyle", v)}
        />
      </Section>
      )}
      </div>

      {/* Desktop preview column — only shown when user is customizing (paid). */}
      {canCustomize && (
      <aside className="hidden lg:block">
        <div className="sticky top-4 space-y-3">
          <CoachAvatarPreview
            appearance={state}
            persona={persona}
            coachName={coachName}
            generation={generation}
          />
          <GenerateButton generation={generation} />
        </div>
      </aside>
      )}
      {canCustomize && (
      <div className="pointer-events-none fixed bottom-20 right-3 z-30 w-[150px] sm:w-[180px] lg:hidden">
        <div className="pointer-events-auto space-y-2">
          <CoachAvatarPreview
            appearance={state}
            persona={persona}
            coachName={coachName}
            generation={generation}
            className="!p-2 !rounded-2xl"
          />
          <GenerateButton generation={generation} compact />
        </div>
      </div>
      )}
    </div>
  );
}

function PhotoUploadCard({
  generation,
}: {
  generation: ReturnType<typeof useCoachPreview>;
}) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const cameraInputRef = React.useRef<HTMLInputElement | null>(null);
  const hasPhoto = Boolean(generation.sourcePhotoUrl);

  const onPickFile = () => fileInputRef.current?.click();
  const onPickCamera = () => cameraInputRef.current?.click();
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-uploading the same filename
    if (file) void generation.uploadPhoto(file);
  };

  return (
    <section
      className={cn(
        "rounded-2xl border p-4 transition",
        hasPhoto ? "border-primary/40 bg-primary/5" : "border-dashed border-border bg-card",
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onFile}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        capture="user"
        className="hidden"
        onChange={onFile}
      />
      <div className="flex items-start gap-3">
        {hasPhoto && generation.sourcePhotoUrl ? (
          <img
            src={generation.sourcePhotoUrl}
            alt="Photo source"
            className="h-16 w-16 shrink-0 rounded-xl object-cover ring-2 ring-primary/40"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ImageIcon className="h-7 w-7" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
            <span className="text-base">📸</span>
            Photo d'inspiration
            <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Optionnel
            </span>
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {hasPhoto
              ? "L'IA s'inspire de ce visage. Le coach généré ne sera pas identique : c'est une réinterprétation, jamais une copie."
              : "Prenez-vous en photo ou importez une image que vous aimez. HeyGen génère un coach proche, sans copier les traits à l'identique."}
          </p>
          {generation.uploadError && (
            <p className="mt-1 text-xs text-destructive">{generation.uploadError}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              variant={hasPhoto ? "outline" : "default"}
              size="sm"
              className="text-xs"
              onClick={onPickCamera}
              disabled={generation.uploading || !generation.bootstrapped}
            >
              {generation.uploading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Camera className="mr-1.5 h-3.5 w-3.5" />
              )}
              {hasPhoto ? "Reprendre une photo" : "Prendre une photo"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={onPickFile}
              disabled={generation.uploading || !generation.bootstrapped}
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              {hasPhoto ? "Importer une autre" : "Importer une photo"}
            </Button>
            {hasPhoto && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => void generation.removePhoto()}
                disabled={generation.uploading}
              >
                <X className="mr-1 h-3.5 w-3.5" />
                Retirer
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function GenerateButton({
  generation,
  compact = false,
}: {
  generation: ReturnType<typeof useCoachPreview>;
  compact?: boolean;
}) {
  const label = generation.loading
    ? "Génération…"
    : generation.generated
      ? "Régénérer l'avatar"
      : "Générer mon avatar";
  return (
    <Button
      type="button"
      onClick={generation.generate}
      disabled={generation.loading || !generation.bootstrapped}
      className={compact ? "w-full text-xs" : "w-full"}
      size={compact ? "sm" : "default"}
    >
      {generation.loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Wand2 className="mr-2 h-4 w-4" />
      )}
      {label}
    </Button>
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
