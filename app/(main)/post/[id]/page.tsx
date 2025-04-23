import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import { redirect } from "next/navigation";
import CommentsSection from "@/components/CommentsSection";

interface PostPageProps {
  params: { id: string };
}

export default async function PostPage({ params: { id } }: PostPageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const { data: post, error } = await supabase
    .from("posts")
    .select(`
      *,
      profiles:user_id (username, avatar_url)
    `)
    .eq("id", id)
    .single();

  if (error || !post) {
    redirect("/feed");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-6">
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="relative aspect-square bg-muted">
          <Image
            src={post.image_url}
            alt={post.caption || "Post"}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 overflow-hidden rounded-full bg-muted">
              {post.profiles.avatar_url ? (
                <Image
                  src={post.profiles.avatar_url}
                  alt={post.profiles.username}
                  width={32}
                  height={32}
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                  {post.profiles.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="font-medium">{post.profiles.username}</span>
          </div>
          {post.caption && <p>{post.caption}</p>}
        </div>
      </div>
      <CommentsSection postId={id} />
    </div>
  );
} 