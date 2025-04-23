"use client";

import { createClient } from "@/utils/supabase/client";
import { Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function CreatePost() {
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Check if file is an image
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!file) {
      setError("Please select an image to upload");
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      // 1. Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }
      
      // 2. Upload image to storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `posts/${user.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from("instagram")
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // 3. Get the public URL
      const { data: publicUrl } = supabase.storage
        .from("instagram")
        .getPublicUrl(filePath);
        
      // 4. Create post record in database
      const { error: insertError } = await supabase
        .from("posts")
        .insert({
          user_id: user.id,
          caption,
          image_url: publicUrl.publicUrl,
        });
        
      if (insertError) {
        throw insertError;
      }
      
      // 5. Redirect to home page
      router.push("/");
      router.refresh();
      
    } catch (err: any) {
      setError(err.message || "Error creating post");
      console.error("Error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold md:text-2xl">Create Post</h1>
        <p className="text-sm text-muted-foreground">
          Share a photo with your followers
        </p>
      </div>
      
      {error && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          {preview ? (
            <div className="relative aspect-square max-h-[500px] overflow-hidden rounded-md border">
              <Image
                src={preview}
                alt="Upload preview"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white"
              >
                ✕
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed bg-muted/30 p-12">
              <div className="flex flex-col items-center justify-center space-y-2 text-center">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm font-medium">
                  Drag & drop or click to upload
                </div>
                <div className="text-xs text-muted-foreground">
                  JPG, PNG, GIF up to 10MB
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>
        
        <div className="space-y-2">
          <label htmlFor="caption" className="text-sm font-medium">
            Caption
          </label>
          <textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            rows={3}
            placeholder="Write a caption..."
          />
        </div>
        
        <button
          disabled={isUploading || !file}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          type="submit"
        >
          {isUploading ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
} 