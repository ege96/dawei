"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/lib/database.types";
import Link from "next/link";
import Image from "next/image";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type PostWithProfile = Database["public"]["Tables"]["posts"]["Row"] & {
  profiles: { username: string; avatar_url: string | null };
};

export default function SearchPage() {
  const supabase = createClient();
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"users" | "posts">("users");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<PostWithProfile[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    if (searchType === "users") {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("username", `%${query}%`);
      if (!error && data) setProfiles(data);
    } else {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .ilike("caption", `%${query}%`);
      if (!error && data) setPosts(data as PostWithProfile[]);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Search</h1>
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1 rounded-md border px-3 py-2"
        />
        <button
          onClick={handleSearch}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          Go
        </button>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => setSearchType("users")}
          className={`px-3 py-1 rounded ${
            searchType === "users" ? "bg-primary text-primary-foreground" : "bg-muted/30"
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setSearchType("posts")}
          className={`px-3 py-1 rounded ${
            searchType === "posts" ? "bg-primary text-primary-foreground" : "bg-muted/30"
          }`}
        >
          Posts
        </button>
      </div>
      <div className="space-y-4">
        {loading && <p>Loading...</p>}
        {!loading && searchType === "users" && (
          profiles.length > 0 ? (
            profiles.map((profile) => (
              <Link
                key={profile.id}
                href={`/profile/${profile.username}`}
                className="flex items-center space-x-2 rounded p-2 hover:bg-muted/30"
              >
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.username}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    {profile.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span>{profile.username}</span>
              </Link>
            ))
          ) : (
            <p>No users found.</p>
          )
        )}
        {!loading && searchType === "posts" && (
          posts.length > 0 ? (
            posts.map((post) => (
              <Link key={post.id} href={`/post/${post.id}`} className="block">
                <div className="relative aspect-square w-24 overflow-hidden rounded">
                  <Image
                    src={post.image_url}
                    alt={post.caption || "Post"}
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="text-sm mt-1">{post.caption}</p>
              </Link>
            ))
          ) : (
            <p>No posts found.</p>
          )
        )}
      </div>
    </div>
  );
} 