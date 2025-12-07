import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X, Camera, Images, ImagePlus } from "lucide-react";
import SocialAccountsSection from "./SocialAccountsSection";
import PortfolioUploadSection from "./PortfolioUploadSection";

const AVAILABLE_CATEGORIES = [
  "Fashion", "Beauty", "Fitness", "Travel", "Food", "Tech",
  "Gaming", "Lifestyle", "Photography", "Art", "Music", "Sports"
];

const ProfileTab = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [profile, setProfile] = useState({
    id: "",
    display_name: "",
    bio: "",
    location_city: "",
    location_state: "",
    location_country: "",
    categories: [] as string[],
    profile_image_url: "",
    cover_image_url: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("creator_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          id: data.id,
          display_name: data.display_name || "",
          bio: data.bio || "",
          location_city: data.location_city || "",
          location_state: data.location_state || "",
          location_country: data.location_country || "",
          categories: data.categories || [],
          profile_image_url: data.profile_image_url || "",
          cover_image_url: data.cover_image_url || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Delete old image if exists
      if (profile.profile_image_url) {
        const oldPath = profile.profile_image_url.split("/").pop();
        if (oldPath) {
          await supabase.storage
            .from("profile-images")
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new image
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("profile-images")
        .getPublicUrl(filePath);

      setProfile({ ...profile, profile_image_url: publicUrl });

      toast({
        title: "Success",
        description: "Profile image uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingCover(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Delete old cover image if exists
      if (profile.cover_image_url) {
        const oldPath = profile.cover_image_url.split("/").pop();
        if (oldPath) {
          await supabase.storage
            .from("profile-images")
            .remove([`${user.id}/cover-${oldPath}`]);
        }
      }

      // Upload new cover image
      const fileExt = file.name.split(".").pop();
      const fileName = `cover-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("profile-images")
        .getPublicUrl(filePath);

      setProfile({ ...profile, cover_image_url: publicUrl });

      toast({
        title: "Success",
        description: "Cover image uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading cover image:", error);
      toast({
        title: "Error",
        description: "Failed to upload cover image",
        variant: "destructive",
      });
    } finally {
      setUploadingCover(false);
    }
  };

  const toggleCategory = (category: string) => {
    setProfile({
      ...profile,
      categories: profile.categories.includes(category)
        ? profile.categories.filter((c) => c !== category)
        : [...profile.categories, category],
    });
  };

  const handleSave = async () => {
    if (!profile.display_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Display name is required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("creator_profiles")
        .update({
          display_name: profile.display_name,
          bio: profile.bio,
          location_city: profile.location_city,
          location_state: profile.location_state,
          location_country: profile.location_country,
          categories: profile.categories,
          profile_image_url: profile.profile_image_url,
          cover_image_url: profile.cover_image_url,
        })
        .eq("id", profile.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Consolidated Media Management Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Images className="h-5 w-5" />
            Your Media
          </CardTitle>
          <CardDescription>
            Manage your profile image and portfolio in one place
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Profile Image Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Camera className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Profile Image</h3>
              <span className="text-xs text-muted-foreground ml-auto">Appears in search results</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-28 w-28 border-4 border-border">
                  <AvatarImage src={profile.profile_image_url} className="object-cover" />
                  <AvatarFallback className="text-3xl bg-gradient-accent text-white">
                    {profile.display_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Label 
                  htmlFor="profile-image-upload" 
                  className="absolute -bottom-2 -right-2 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-lg"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Label>
                <Input
                  id="profile-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </div>
              <div className="space-y-1">
                <p className="font-medium">Main Profile Photo</p>
                <p className="text-sm text-muted-foreground">
                  This is the image brands see when browsing creators.
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG or WEBP. Max 5MB. Recommended: 400×500px
                </p>
              </div>
            </div>
          </div>

          {/* Cover Image Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <ImagePlus className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Cover Image</h3>
              <span className="text-xs text-muted-foreground ml-auto">Main hero image on mobile</span>
            </div>
            <div className="space-y-3">
              {profile.cover_image_url ? (
                <div className="relative aspect-[4/5] max-w-xs rounded-xl overflow-hidden border">
                  <img 
                    src={profile.cover_image_url} 
                    alt="Cover" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Label 
                      htmlFor="cover-image-upload" 
                      className="px-4 py-2 bg-white text-foreground rounded-lg cursor-pointer hover:bg-white/90 font-medium"
                    >
                      {uploadingCover ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Change Cover"
                      )}
                    </Label>
                  </div>
                </div>
              ) : (
                <Label 
                  htmlFor="cover-image-upload" 
                  className="flex flex-col items-center justify-center aspect-[4/5] max-w-xs rounded-xl border-2 border-dashed border-muted-foreground/30 cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                >
                  {uploadingCover ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  ) : (
                    <>
                      <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground font-medium">Add Cover Image</span>
                      <span className="text-xs text-muted-foreground mt-1">This is the first image brands see on mobile</span>
                    </>
                  )}
                </Label>
              )}
              <Input
                id="cover-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCoverImageUpload}
                disabled={uploadingCover}
              />
              <p className="text-xs text-muted-foreground">
                Recommended: Portrait orientation (4:5 ratio). Max 5MB.
              </p>
            </div>
          </div>

          {/* Portfolio Gallery Section - Embedded */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Images className="h-4 w-4 text-primary" />
              <h3 className="font-medium">Portfolio Gallery</h3>
              <span className="text-xs text-muted-foreground ml-auto">Appears on your profile page</span>
            </div>
            <PortfolioUploadSection creatorProfileId={profile.id} compact />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Update your profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name *</Label>
            <Input
              id="display_name"
              value={profile.display_name}
              onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
              placeholder="Your display name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
          <CardDescription>Where are you based?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={profile.location_city}
                onChange={(e) => setProfile({ ...profile, location_city: e.target.value })}
                placeholder="e.g. Los Angeles"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={profile.location_state}
                onChange={(e) => setProfile({ ...profile, location_state: e.target.value })}
                placeholder="e.g. California"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={profile.location_country}
                onChange={(e) => setProfile({ ...profile, location_country: e.target.value })}
                placeholder="e.g. United States"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Select the categories that best describe your content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_CATEGORIES.map((category) => (
              <Badge
                key={category}
                variant={profile.categories.includes(category) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleCategory(category)}
              >
                {profile.categories.includes(category) && (
                  <X className="h-3 w-3 mr-1" />
                )}
                {category}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <SocialAccountsSection creatorProfileId={profile.id} />

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProfileTab;