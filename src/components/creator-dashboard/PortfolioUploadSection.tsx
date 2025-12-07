import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X, Play, Image as ImageIcon, Video } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface PortfolioMedia {
  id: string;
  media_type: "image" | "video";
  url: string;
  thumbnail_url: string | null;
  display_order: number;
}

interface PortfolioUploadSectionProps {
  creatorProfileId: string;
  compact?: boolean;
}

const MAX_VIDEOS = 3;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

const PortfolioUploadSection = ({ creatorProfileId, compact = false }: PortfolioUploadSectionProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingType, setUploadingType] = useState<"image" | "video" | null>(null);
  const [media, setMedia] = useState<PortfolioMedia[]>([]);

  useEffect(() => {
    if (creatorProfileId) {
      fetchPortfolioMedia();
    }
  }, [creatorProfileId]);

  const fetchPortfolioMedia = async () => {
    try {
      const { data, error } = await supabase
        .from("creator_portfolio_media")
        .select("*")
        .eq("creator_profile_id", creatorProfileId)
        .order("display_order", { ascending: true });

      if (error) throw error;
      setMedia((data || []).map((item) => ({
        ...item,
        media_type: item.media_type as "image" | "video",
      })));
    } catch (error) {
      console.error("Error fetching portfolio media:", error);
    } finally {
      setLoading(false);
    }
  };

  const videoCount = media.filter((m) => m.media_type === "video").length;

  // Upload with progress tracking using XMLHttpRequest
  const uploadWithProgress = async (file: File, filePath: string, accessToken: string): Promise<void> => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      });
      
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });
      
      xhr.addEventListener('error', () => reject(new Error('Upload failed')));
      xhr.addEventListener('abort', () => reject(new Error('Upload aborted')));
      
      const url = `${supabaseUrl}/storage/v1/object/portfolio-media/${filePath}`;
      xhr.open('POST', url);
      xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (type === "image" && !file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file (JPG, PNG, WEBP)",
        variant: "destructive",
      });
      return;
    }

    if (type === "video" && !file.type.startsWith("video/")) {
      toast({
        title: "Invalid file",
        description: "Please upload a video file (MP4, MOV, WEBM)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size
    const maxSize = type === "image" ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `${type === "image" ? "Image" : "Video"} must be less than ${type === "image" ? "5MB" : "100MB"}`,
        variant: "destructive",
      });
      return;
    }

    // Check video limit
    if (type === "video" && videoCount >= MAX_VIDEOS) {
      toast({
        title: "Video limit reached",
        description: `You can upload a maximum of ${MAX_VIDEOS} videos`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadingType(type);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session found");

      // Upload file with progress
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${type}.${fileExt}`;
      const filePath = `${session.user.id}/${fileName}`;

      await uploadWithProgress(file, filePath, session.access_token);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("portfolio-media")
        .getPublicUrl(filePath);

      // Create database record
      const nextOrder = media.length > 0 ? Math.max(...media.map((m) => m.display_order)) + 1 : 0;

      const { data: insertedData, error: dbError } = await supabase
        .from("creator_portfolio_media")
        .insert({
          creator_profile_id: creatorProfileId,
          media_type: type,
          url: publicUrl,
          thumbnail_url: type === "video" ? null : publicUrl,
          display_order: nextOrder,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      const newMedia: PortfolioMedia = {
        id: insertedData.id,
        media_type: insertedData.media_type as "image" | "video",
        url: insertedData.url,
        thumbnail_url: insertedData.thumbnail_url,
        display_order: insertedData.display_order,
      };

      setMedia([...media, newMedia]);

      toast({
        title: "Success",
        description: `${type === "image" ? "Image" : "Video"} uploaded successfully`,
      });
    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setUploadingType(null);
      // Reset input
      e.target.value = "";
    }
  };

  const handleDeleteMedia = async (mediaItem: PortfolioMedia) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Delete from storage
      const urlParts = mediaItem.url.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${user.id}/${fileName}`;

      await supabase.storage.from("portfolio-media").remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from("creator_portfolio_media")
        .delete()
        .eq("id", mediaItem.id);

      if (error) throw error;

      setMedia(media.filter((m) => m.id !== mediaItem.id));

      toast({
        title: "Deleted",
        description: "Media removed from portfolio",
      });
    } catch (error: any) {
      console.error("Error deleting media:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete media",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Portfolio Media
        </CardTitle>
        <CardDescription>
          Upload your best work to showcase to brands. Max 3 videos ({videoCount}/{MAX_VIDEOS} used).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Buttons */}
        <div className="flex flex-wrap gap-3">
          <Label htmlFor="image-upload" className="cursor-pointer">
            <div className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImageIcon className="h-4 w-4" />
              )}
              Add Image
            </div>
          </Label>
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e, "image")}
            disabled={uploading}
          />

          <Label htmlFor="video-upload" className="cursor-pointer">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              videoCount >= MAX_VIDEOS 
                ? "bg-muted text-muted-foreground cursor-not-allowed" 
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}>
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Video className="h-4 w-4" />
              )}
              Add Video
            </div>
          </Label>
          <Input
            id="video-upload"
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e, "video")}
            disabled={uploading || videoCount >= MAX_VIDEOS}
          />
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Uploading {uploadingType === "video" ? "video" : "image"}...
              </span>
              <span className="font-medium text-foreground">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {uploadingType === "video" 
                ? "Large videos may take a few minutes. Please don't close this page."
                : "Almost there..."}
            </p>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Images: JPG, PNG, WEBP (max 5MB) • Videos: MP4, MOV, WEBM (max 100MB)
        </p>

        {/* Media Grid */}
        {media.length > 0 ? (
          <div className={`grid gap-4 ${compact ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"}`}>
            {media.map((item) => (
              <div
                key={item.id}
                className="relative group aspect-square rounded-lg overflow-hidden bg-muted"
              >
                {item.media_type === "image" ? (
                  <img
                    src={item.url}
                    alt="Portfolio"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full">
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                  </div>
                )}

                {/* Delete button */}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteMedia(item)}
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Type badge */}
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 rounded text-xs text-white capitalize">
                  {item.media_type}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-muted/50 rounded-lg border-2 border-dashed">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No portfolio media yet</p>
            <p className="text-xs text-muted-foreground">Upload images and videos to showcase your work</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioUploadSection;
