"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function ExerciseVideo({
  slug,
  poster,
  className,
}: {
  slug: string;
  poster?: string;
  className?: string;
}) {
  const [url, setUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  React.useEffect(() => {
    if (!visible || url || loading) return;
    setLoading(true);
    fetch(`/api/exercises/${slug}/video`)
      .then((r) => (r.status === 200 ? r.json() : null))
      .then((body) => setUrl(body?.url ?? null))
      .finally(() => setLoading(false));
  }, [visible, slug, url, loading]);

  return (
    <div ref={ref} className={cn("relative overflow-hidden rounded-2xl bg-muted", className)}>
      {url ? (
        <video
          src={url}
          poster={poster}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
        />
      ) : poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" className="h-full w-full object-cover" />
      ) : null}
    </div>
  );
}
