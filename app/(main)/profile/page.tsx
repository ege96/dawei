import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Profile() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/login");
  }
  
  // Fetch profile data
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (profileError) {
    console.error("Error fetching profile:", profileError);
  }
  
  // Fetch user's posts
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
    
  if (postsError) {
    console.error("Error fetching posts:", postsError);
  }
  
  // Fetch follower and following counts
  const { count: followersCount, error: followersError } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', user.id);
    
  if (followersError) {
    console.error("Error fetching followers count:", followersError);
  }
  
  const { count: followingCount, error: followingError } = await supabase
    .from('follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', user.id);
    
  if (followingError) {
    console.error("Error fetching following count:", followingError);
  }

  return (
    <div className="space-y-8">
      {profile && (
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
            <div>
              <h1 className="text-2xl font-bold">{profile.username}</h1>
              {profile.full_name && (
                <p className="text-muted-foreground">{profile.full_name}</p>
              )}
            </div>
            
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
            
            {profile.bio && (
              <p className="text-sm">{profile.bio}</p>
            )}
            
            <Link
              href="/profile/edit"
              className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      )}
      
      <div>
        <h2 className="mb-4 text-xl font-bold">Posts</h2>
        
        {posts && posts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {posts.map((post) => (
              <Link 
                key={post.id} 
                href={`/post/${post.id}`}
                className="relative aspect-square bg-muted"
              >
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
              When you share photos, they will appear here.
            </p>
            <Link
              href="/create"
              className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Create Your First Post
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 