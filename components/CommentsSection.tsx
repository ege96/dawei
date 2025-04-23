"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/lib/database.types";
import Image from "next/image";
import Link from "next/link";

type Comment = Database["public"]["Tables"]["comments"]["Row"] & {
  profiles: { username: string; avatar_url: string | null };
};

export default function CommentsSection({ postId }: { postId: string }) {
  const supabase = createClient();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  async function fetchComments() {
    const { data, error } = await supabase
      .from("comments")
      .select(
        `*, profiles:user_id (username, avatar_url)`
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (!error && data) setComments(data as Comment[]);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    await supabase
      .from("comments")
      .insert({ post_id: postId, user_id: user.id, content: newComment });
    setNewComment("");
    await fetchComments();
    setLoading(false);
  };

  return (
    <div className="mt-4">
      <h3 className="font-medium mb-2">Comments</h3>
      <div className="space-y-2">
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start space-x-2">
            <Link href={`/profile/${comment.profiles.username}`} className="h-8 w-8 flex-shrink-0 rounded-full overflow-hidden bg-muted">
              {comment.profiles.avatar_url ? (
                <Image
                  src={comment.profiles.avatar_url}
                  width={32}
                  height={32}
                  alt={comment.profiles.username}
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full bg-primary/10 text-primary">
                  {comment.profiles.username.charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
            <div>
              <Link
                href={`/profile/${comment.profiles.username}`}
                className="text-sm font-medium hover:underline"
              >
                {comment.profiles.username}
              </Link>
              <p className="text-sm">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex space-x-2">
        <input
          type="text"
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1 rounded-md border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground disabled:opacity-50"
        >
          {loading ? "..." : "Post"}
        </button>
      </form>
    </div>
  );
} 