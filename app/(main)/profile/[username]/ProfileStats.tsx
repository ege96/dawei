"use client";

import { useState, useEffect, useImperativeHandle, forwardRef } from "react";

export interface ProfileStatsRef {
  updateFollowerCount: (isFollowing: boolean) => void;
}

interface ProfileStatsProps {
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

const ProfileStats = forwardRef<ProfileStatsRef, ProfileStatsProps>(({
  postsCount,
  followersCount: initialFollowersCount,
  followingCount,
}: ProfileStatsProps, ref) => {
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);

  // Update follower count if the prop changes (due to a follow/unfollow action)
  useEffect(() => {
    setFollowersCount(initialFollowersCount);
  }, [initialFollowersCount]);

  // Listen for custom events to update follower count
  useEffect(() => {
    const handleUpdateFollowerCount = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { isFollowing } = customEvent.detail;
      setFollowersCount(prevCount => 
        isFollowing ? prevCount + 1 : prevCount - 1
      );
    };

    // Add event listener
    document.addEventListener('updateFollowerCount', handleUpdateFollowerCount);
    
    // Remove event listener on cleanup
    return () => {
      document.removeEventListener('updateFollowerCount', handleUpdateFollowerCount);
    };
  }, []);

  // Expose methods to parent components
  useImperativeHandle(ref, () => ({
    updateFollowerCount: (isFollowing: boolean) => {
      setFollowersCount(prevCount => isFollowing ? prevCount + 1 : prevCount - 1);
    }
  }));

  return (
    <div className="flex space-x-6">
      <div className="text-center">
        <span className="block font-bold">{postsCount}</span>
        <span className="text-sm text-muted-foreground">Posts</span>
      </div>
      <div className="text-center">
        <span className="block font-bold">{followersCount}</span>
        <span className="text-sm text-muted-foreground">Followers</span>
      </div>
      <div className="text-center">
        <span className="block font-bold">{followingCount}</span>
        <span className="text-sm text-muted-foreground">Following</span>
      </div>
    </div>
  );
});

ProfileStats.displayName = "ProfileStats";
export default ProfileStats; 