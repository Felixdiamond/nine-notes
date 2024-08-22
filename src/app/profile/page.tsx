"use client";
import React, { useState, useEffect } from "react";
import { User } from "@supabase/auth-helpers-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { AlertCircle, Loader2, Camera, ChevronLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { createBrowserClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface UserMetadata {
  full_name?: string;
  avatar_url?: string;
}

const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    avatar: null as string | null,
    avatarFile: null as File | null,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const supabase = createBrowserClient();
  const { toast } = useToast();
  const { user: authUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
      setFormData({
        name: (authUser.user_metadata as UserMetadata).full_name || "",
        avatar: (authUser.user_metadata as UserMetadata).avatar_url || null,
        avatarFile: null, // Initialize avatarFile as null
      });
    }
  }, [authUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prevData => ({
        ...prevData,
        avatar: URL.createObjectURL(file),
        avatarFile: file,
      }));
    }
  };

  const goBack = () => {
    // Go back to the previous page
    router.back();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      let avatarUrl = (user.user_metadata as UserMetadata).avatar_url;

      if (formData.avatarFile) {
        console.log("Uploading avatar...");
        const file = formData.avatarFile;
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

        // Attempt to delete the old avatar
        if (avatarUrl) {
          const oldFileName = avatarUrl.split('/').pop();
          try {
            const { error: deleteError } = await supabase.storage
              .from("avatars")
              .remove([`${user.id}/${oldFileName}`]);

            if (deleteError) {
              console.warn("Failed to delete old avatar:", deleteError.message);
            } else {
              console.log("Old avatar deleted successfully");
            }
          } catch (deleteError) {
            console.warn("Error during old avatar deletion:", deleteError);
          }
        }

        // Upload the new avatar
        const { data, error } = await supabase.storage
          .from("avatars")
          .upload(fileName, file, { upsert: true });

        if (error) throw error;

        // Generate a public URL that doesn't expire
        const { data: { publicUrl } } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName);

        if (publicUrl) {
          avatarUrl = publicUrl;
        } else {
          throw new Error("Failed to generate public URL");
        }
      }

      console.log("Updating user...");
      const { data, error } = await supabase.auth.updateUser({
        data: { full_name: formData.name, avatar_url: avatarUrl },
      });

      if (error) throw error;

      if (data.user) {
        setUser(data.user);
        console.log("Profile updated:", data.user);
        toast({
          title: "Profile updated",
          description: "Your profile has been successfully updated.",
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) return (
    <div className="flex min-h-screen items-center justify-center max-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center max-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="w-full">
            <ChevronLeft className="h-6 w-6 cursor-pointer"
              onClick={goBack}
            />
          </div>
          <CardTitle className="text-center text-2xl font-bold">
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center">
              <Avatar className="mb-4 h-32 w-32">
                <AvatarImage
                  src={formData.avatar || ""}
                  alt="Profile"
                />
                <AvatarFallback>{formData.name[0] || user.email?.[0]}</AvatarFallback>
              </Avatar>
              <Label htmlFor="avatar" className="cursor-pointer">
                <div className="flex items-center space-x-2 text-blue-500">
                  <Camera size={20} />
                  <span>Change Avatar</span>
                </div>
              </Label>
              <Input
                id="avatar"
                name="avatar"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email || ""}
                disabled
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Profile"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;