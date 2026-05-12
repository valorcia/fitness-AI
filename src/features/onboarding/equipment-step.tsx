"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  EQUIPMENT_CATALOG,
  SPORTS_CATALOG,
  recommendedEquipmentFor,
} from "@/lib/onboarding/sports-catalog";
import { metaFor } from "@/lib/onboarding/equipment-meta";

type Props = {
  sportsInterests: string[];
  equipment: string[];
  outdoorAllowed: boolean;
  onChange: (patch: {
    sportsInterests?: string[];
    equipment?: string[];
    outdoorAllowed?: boolean;
  }) => void;
};

export function EquipmentStep({
  sportsInterests,
  equipment,
  outdoorAllowed,
  onChange,
}: Props) {
  const recommended = React.useMemo(
    () => recommendedEquipmentFor(sportsInterests),
    [sportsInterests],
  );
  const other = React.useMemo(
    () => EQUIPMENT_CATALOG.filter((eq) => !recommended.includes(eq)),
    [recommended],
  );

  const toggleSport = (slug: string) => {
    const selected = sportsInterests.includes(slug);
    const nextSports = selected
      ? sportsInterests.filter((s) => s !== slug)
      : [...sportsInterests, slug];

    // When selecting a new sport, auto-add its recommended equipment if not
    // already chosen. Removing a sport never removes equipment (the user may
    // legitimately keep it).
    let nextEquipment = equipment;
    if (!selected) {
      const sport = SPORTS_CATALOG.find((s) => s.slug === slug);
      if (sport?.equipment.length) {
        const add = sport.equipment.filter((eq) => !equipment.includes(eq));
        if (add.length) nextEquipment = [...equipment, ...add];
      }
    }
    onChange({ sportsInterests: nextSports, equipment: nextEquipment });
  };

  const toggleEquipment = (eq: string) => {
    const selected = equipment.includes(eq);
    onChange({
      equipment: selected
        ? equipment.filter((e) => e !== eq)
        : [...equipment, eq],
    });
  };

  return (
    <div className="grid gap-5">
      {/* Stage A — Sports */}
      <section>
        <div className="flex items-baseline justify-between">
          <Label className="text-base font-semibold">
            🏅 Quels sports pratiquez-vous (ou souhaitez pratiquer) ?
          </Label>
          <button
            type="button"
            onClick={() => {
              const allSelected = sportsInterests.length === SPORTS_CATALOG.length;
              const next = allSelected ? [] : SPORTS_CATALOG.map((s) => s.slug);
              const extraEq = allSelected
                ? equipment
                : Array.from(new Set([...equipment, ...recommendedEquipmentFor(next)]));
              onChange({ sportsInterests: next, equipment: extraEq });
            }}
            className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
          >
            {sportsInterests.length === SPORTS_CATALOG.length
              ? "Tout désélectionner"
              : "Tout sélectionner"}
          </button>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Cochez-en autant que vous le souhaitez. Le coach proposera du matériel adapté juste
          après.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
          {SPORTS_CATALOG.map((s) => {
            const selected = sportsInterests.includes(s.slug);
            return (
              <button
                key={s.slug}
                type="button"
                onClick={() => toggleSport(s.slug)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border p-3 text-xs font-medium transition",
                  selected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:border-primary/50",
                )}
              >
                <span className="text-2xl">{s.emoji}</span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Stage B — Equipment */}
      <section>
        <Label className="text-base font-semibold">🧰 Matériel à disposition</Label>
        {sportsInterests.length === 0 ? (
          <p className="mt-2 rounded-xl border border-dashed border-border/60 p-3 text-sm text-muted-foreground">
            Sélectionnez d'abord un ou plusieurs sports ci-dessus pour voir le matériel
            recommandé.
          </p>
        ) : (
          <>
            {recommended.length > 0 && (
              <div className="mt-3">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
                  Recommandé pour vos sports
                </div>
                <EquipmentGrid
                  items={recommended}
                  selected={equipment}
                  onToggle={toggleEquipment}
                  highlight
                />
              </div>
            )}
            {other.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Autre matériel
                </div>
                <EquipmentGrid
                  items={other}
                  selected={equipment}
                  onToggle={toggleEquipment}
                />
              </div>
            )}
          </>
        )}
      </section>

      {/* Outdoor toggle */}
      <div className="flex items-center gap-3 rounded-xl border border-border p-3">
        <Checkbox
          id="outdoor"
          checked={outdoorAllowed}
          onCheckedChange={(c) => onChange({ outdoorAllowed: c === true })}
        />
        <Label htmlFor="outdoor" className="text-sm">
          Entraînement extérieur autorisé (course, vélo, marche, HIIT outdoor)
        </Label>
      </div>
    </div>
  );
}

function EquipmentGrid({
  items,
  selected,
  onToggle,
  highlight = false,
}: {
  items: string[];
  selected: string[];
  onToggle: (eq: string) => void;
  highlight?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {items.map((eq) => {
        const isOn = selected.includes(eq);
        const meta = metaFor(eq);
        const gradient = meta.gradient ?? ["#1B3954", "#14B8A6"];
        return (
          <button
            key={eq}
            type="button"
            onClick={() => onToggle(eq)}
            className={cn(
              "group relative overflow-hidden rounded-2xl border bg-card text-left transition",
              isOn
                ? "border-primary ring-2 ring-primary/50"
                : highlight
                  ? "border-primary/30 hover:border-primary/60"
                  : "border-border hover:border-primary/50",
            )}
          >
            <div
              className="relative h-24 w-full overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
              }}
              aria-hidden
            >
              {meta.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={meta.imageUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover opacity-80 transition group-hover:scale-105 group-hover:opacity-100"
                  loading="lazy"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              <span className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 text-xl shadow">
                {meta.emoji}
              </span>
              {isOn && (
                <span className="absolute left-2 top-2 inline-flex h-7 items-center gap-1 rounded-full bg-primary px-2 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground shadow">
                  <Check className="h-3 w-3" /> Choisi
                </span>
              )}
            </div>
            <div className="p-3">
              <div className="truncate text-sm font-semibold">{meta.fr}</div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {eq}
              </div>
              {meta.hint && (
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{meta.hint}</p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
