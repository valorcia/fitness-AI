"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Trophy, Activity, Footprints, Camera, StickyNote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Post = {
  id: string;
  kind: string;
  title: string | null;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  author: { id: string; name: string; image: string | null };
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
};

const KIND_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  WORKOUT: Activity,
  RUN: Footprints,
  ACHIEVEMENT: Trophy,
  PHOTO: Camera,
  NOTE: StickyNote,
};

export function PostCard({ post }: { post: Post }) {
  const router = useRouter();
  const [liked, setLiked] = React.useState(post.likedByMe);
  const [likes, setLikes] = React.useState(post.likeCount);
  const [pending, setPending] = React.useState(false);
  const Icon = KIND_ICON[post.kind] ?? StickyNote;

  async function toggleLike() {
    if (pending) return;
    setPending(true);
    const optimistic = !liked;
    setLiked(optimistic);
    setLikes((n) => n + (optimistic ? 1 : -1));
    try {
      const res = await fetch(`/api/community/posts/${post.id}/like`, { method: "POST" });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setLiked(!optimistic);
      setLikes((n) => n + (optimistic ? -1 : 1));
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardContent className="grid gap-3 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
            {post.author.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={post.author.image} alt={post.author.name} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              post.author.name.slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold">{post.author.name}</div>
            <div className="text-xs text-muted-foreground">
              {new Date(post.createdAt).toLocaleString("fr-FR")}
            </div>
          </div>
          <Badge variant="outline" className="gap-1">
            <Icon className="h-3 w-3" />
            {post.kind}
          </Badge>
        </div>
        {post.title && <div className="font-semibold">{post.title}</div>}
        <p className="whitespace-pre-wrap text-sm">{post.content}</p>
        {post.imageUrl && (
          <div className="overflow-hidden rounded-xl border border-border/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.imageUrl} alt="post" className="w-full object-cover" />
          </div>
        )}
        <div className="flex items-center gap-4 pt-2 text-sm text-muted-foreground">
          <button
            onClick={toggleLike}
            disabled={pending}
            className={cn(
              "flex items-center gap-1 transition hover:text-primary",
              liked && "text-primary",
            )}
          >
            <Heart className={cn("h-4 w-4", liked && "fill-current")} /> {likes}
          </button>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" /> {post.commentCount}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
