import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CommunityComposer } from "@/features/community/composer";
import { PostCard } from "@/features/community/post-card";

export const metadata = { title: "Communauté" };

export default async function CommunityPage() {
  const session = await auth();
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      user: { select: { id: true, name: true, image: true } },
      likes: { where: { userId: session!.user.id }, select: { id: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });

  return (
    <div className="mx-auto grid max-w-2xl gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Communauté</h1>
        <p className="text-muted-foreground">Partagez vos exploits, likez ceux des autres.</p>
      </div>

      <CommunityComposer />

      <div className="grid gap-4">
        {posts.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Aucun post pour l'instant</CardTitle>
              <CardDescription>Soyez le premier à partager votre séance.</CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        ) : (
          posts.map((p) => (
            <PostCard
              key={p.id}
              post={{
                id: p.id,
                kind: p.kind,
                title: p.title,
                content: p.content,
                imageUrl: p.imageUrl,
                createdAt: p.createdAt.toISOString(),
                author: {
                  id: p.user.id,
                  name: p.user.name ?? "Athlète",
                  image: p.user.image ?? null,
                },
                likeCount: p._count.likes,
                commentCount: p._count.comments,
                likedByMe: p.likes.length > 0,
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
