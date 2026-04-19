import Image from "next/image";
import type { ExerciseCategory } from "@prisma/client";
import { CATEGORY_META } from "@/lib/exercises/catalog";
import { cn } from "@/lib/utils";
import {
  Activity,
  Dumbbell,
  Flame,
  Heart,
  PersonStanding,
  Waves,
  Zap,
} from "lucide-react";

const ICONS: Record<ExerciseCategory, React.ComponentType<{ className?: string }>> = {
  LOWER: Dumbbell,
  UPPER_PUSH: Zap,
  UPPER_PULL: Activity,
  FULL_BODY: Flame,
  CORE: Heart,
  CARDIO: Waves,
  MOBILITY: PersonStanding,
};

export function ExerciseIllustration({
  category,
  slug,
  imageUrl,
  size = "md",
  className,
}: {
  category: ExerciseCategory;
  slug?: string;
  imageUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const meta = CATEGORY_META[category];
  const Icon = ICONS[category] ?? Dumbbell;
  const dim =
    size === "sm" ? "h-12 w-12" : size === "lg" ? "h-40 w-40" : "h-20 w-20";
  const iconDim =
    size === "sm" ? "h-5 w-5" : size === "lg" ? "h-14 w-14" : "h-8 w-8";

  if (imageUrl) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-2xl bg-muted",
          dim,
          className,
        )}
        data-slug={slug}
      >
        <Image
          src={imageUrl}
          alt={slug ?? category}
          fill
          sizes="200px"
          className="object-cover"
          unoptimized
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-2xl",
        dim,
        className,
      )}
      style={{
        background: `linear-gradient(135deg, ${meta.colorFrom} 0%, ${meta.colorTo} 100%)`,
      }}
      data-slug={slug}
    >
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id={`grid-${category}`} width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill={`url(#grid-${category})`} />
        </svg>
      </div>
      <Icon className={cn("relative text-white drop-shadow-md", iconDim)} />
    </div>
  );
}
