import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function UserProfilePage(props: any) {
  const { params } = props;
  const { username } = await params;
  const supabase = await createClient();

  // Fetch profile by username
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();
  if (profileError || !profile) {
    return notFound();
  }

  // Fetch user's posts
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false });
  if (postsError) {
    console.error('Error fetching posts:', postsError);
  }

  // Fetch counts
  const { count: followersCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', profile.id);
  const { count: followingCount } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', profile.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center space-y-4 md:flex-row md:space-x-8 md:space-y-0">
        <div className="h-24 w-24 overflow-hidden rounded-full bg-muted md:h-32 md:w-32">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.username}
              width={128}
              height={128}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-3xl font-bold text-primary">
              {profile.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col items-center space-y-4 text-center md:items-start md:text-left">
          <h1 className="text-2xl font-bold">{profile.username}</h1>
          {profile.full_name && <p className="text-muted-foreground">{profile.full_name}</p>}
          <div className="flex space-x-6">
            <div className="text-center">
              <span className="block font-bold">{posts?.length || 0}</span>
              <span className="text-sm text-muted-foreground">Posts</span>
            </div>
            <div className="text-center">
              <span className="block font-bold">{followersCount || 0}</span>
              <span className="text-sm text-muted-foreground">Followers</span>
            </div>
            <div className="text-center">
              <span className="block font-bold">{followingCount || 0}</span>
              <span className="text-sm text-muted-foreground">Following</span>
            </div>
          </div>
          {profile.bio && <p className="text-sm">{profile.bio}</p>}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold">Posts</h2>
        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {posts.map((post) => (
              <Link key={post.id} href={`/post/${post.id}`} className="relative aspect-square bg-muted">
                <Image
                  src={post.image_url}
                  alt={post.caption || "Post"}
                  fill
                  className="object-cover"
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <h3 className="text-lg font-medium">No posts yet</h3>
            <p className="text-sm text-muted-foreground">
              {`@${profile.username}`} has not posted anything yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 