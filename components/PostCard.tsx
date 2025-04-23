"use client";

import { Database } from "@/lib/database.types";
import { createClient } from "@/utils/supabase/client";
import { Heart, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import CommentsSection from "@/components/CommentsSection";

type PostWithProfile = Database["public"]["Tables"]["posts"]["Row"] & {
  profiles: {
    username: string;
    avatar_url: string | null;
  };
};

interface PostCardProps {
  post: PostWithProfile;
}

export default function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadStats() {
      // Load total likes
      const { count: totalLikes, error: likesError } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", post.id);
      if (!likesError && typeof totalLikes === "number") {
        setLikesCount(totalLikes);
      }
      // Load total comments
      const { count: totalComments, error: commentsError } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .eq("post_id", post.id);
      if (!commentsError && typeof totalComments === "number") {
        setCommentsCount(totalComments);
      }
      // Check if current user liked
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: existingLike, error: existingError } = await supabase
          .from("likes")
          .select("*")
          .eq("user_id", user.id)
          .eq("post_id", post.id)
          .single();
        if (!existingError && existingLike) {
          setIsLiked(true);
        }
      }
    }
    loadStats();
  }, [post.id]);

  const handleLike = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      if (isLiked) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .match({ user_id: user.id, post_id: post.id });
        
        setLikesCount(prev => prev - 1);
      } else {
        // Like
        await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            post_id: post.id,
          });
        
        setLikesCount(prev => prev + 1);
      }
      
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="flex items-center gap-3 p-3">
        <div className="h-10 w-10 overflow-hidden rounded-full bg-muted">
          {post.profiles.avatar_url ? (
            <Image
              src={post.profiles.avatar_url}
              alt={post.profiles.username}
              width={40}
              height={40}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
              {post.profiles.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <Link 
          href={`/profile/${post.profiles.username}`}
          className="text-sm font-medium"
        >
          {post.profiles.username}
        </Link>
      </div>
      
      <div className="relative aspect-square bg-muted">
        <Image
          src={post.image_url}
          alt={post.caption || "Instagram post"}
          fill
          className="object-cover"
        />
      </div>
      
      <div className="p-3">
        <div className="flex items-center gap-2">
          <button 
            onClick={handleLike}
            className="flex items-center gap-1"
          >
            <Heart 
              className={`h-6 w-6 ${isLiked ? "fill-red-500 text-red-500" : ""}`} 
            />
            <span className="text-sm">{likesCount}</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="text-sm">{commentsCount}</span>
          </button>
        </div>
        
        {post.caption && (
          <div className="mt-2">
            <span className="text-sm font-medium">{post.profiles.username}</span>{" "}
            <span className="text-sm">{post.caption}</span>
          </div>
        )}
        {showComments && <CommentsSection postId={post.id} />}
      </div>
    </div>
  );
} 