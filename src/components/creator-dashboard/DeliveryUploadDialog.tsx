import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, FileVideo, FileImage, Loader2, CheckCircle } from "lucide-react";

interface DeliveryUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  creatorProfileId: string;
  brandName: string;
  currentVersion: number;
  onDeliverySubmitted: () => void;
}

interface FileWithPreview {
  file: File;
  preview: string;
  progress: number;
  uploaded: boolean;
}

const DeliveryUploadDialog = ({
  open,
  onOpenChange,
  bookingId,
  creatorProfileId,
  brandName,
  currentVersion,
  onDeliverySubmitted,
}: DeliveryUploadDialogProps) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.type.startsWith("video/") || file.type.startsWith("image/")
    );
    
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(
        file => file.type.startsWith("video/") || file.type.startsWith("image/")
      );
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const filesWithPreview = newFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
      uploaded: false,
    }));
    setFiles(prev => [...prev, ...filesWithPreview]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const uploadFile = async (fileWithPreview: FileWithPreview, index: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const formData = new FormData();
    formData.append("file", fileWithPreview.file);
    formData.append("booking_id", bookingId);
    formData.append("creator_profile_id", creatorProfileId);
    formData.append("version", String(currentVersion + 1));
    if (notes) formData.append("description", notes);

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-deliverable`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Upload failed");
    }

    // Update progress
    setFiles(prev => {
      const newFiles = [...prev];
      newFiles[index] = { ...newFiles[index], progress: 100, uploaded: true };
      return newFiles;
    });

    return response.json();
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      toast.error("Please add at least one file");
      return;
    }

    setUploading(true);

    try {
      // Upload files sequentially with progress updates
      for (let i = 0; i < files.length; i++) {
        if (!files[i].uploaded) {
          // Simulate progress updates
          const progressInterval = setInterval(() => {
            setFiles(prev => {
              const newFiles = [...prev];
              if (newFiles[i] && newFiles[i].progress < 90) {
                newFiles[i] = { ...newFiles[i], progress: newFiles[i].progress + 10 };
              }
              return newFiles;
            });
          }, 200);

          await uploadFile(files[i], i);
          clearInterval(progressInterval);
        }
      }

      // Update booking status to delivered
      const { error: updateError } = await supabase
        .from("bookings")
        .update({ 
          delivery_status: "delivered",
          status: "completed"
        })
        .eq("id", bookingId);

      if (updateError) throw updateError;

      toast.success("Deliverables submitted successfully!");
      onDeliverySubmitted();
      onOpenChange(false);
      
      // Clean up
      files.forEach(f => URL.revokeObjectURL(f.preview));
      setFiles([]);
      setNotes("");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload deliverables");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Submit Deliverables
          </DialogTitle>
          <DialogDescription>
            Upload your completed work for {brandName}. They'll review and approve to release payment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
              ${files.length > 0 ? "py-4" : ""}
            `}
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              multiple
              accept="video/*,image/*"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <Upload className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium">
                Drag & drop files or <span className="text-primary">browse</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Support: MP4, MOV, WEBM, JPG, PNG, GIF (up to 100MB each)
              </p>
            </label>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">{files.length} file(s) selected</p>
              {files.map((fileWithPreview, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  {/* Preview */}
                  <div className="w-12 h-12 rounded overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                    {fileWithPreview.file.type.startsWith("video/") ? (
                      <FileVideo className="h-6 w-6 text-muted-foreground" />
                    ) : (
                      <img
                        src={fileWithPreview.preview}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {fileWithPreview.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(fileWithPreview.file.size)}
                    </p>
                    {uploading && (
                      <Progress value={fileWithPreview.progress} className="h-1 mt-1" />
                    )}
                  </div>

                  {/* Status/Remove */}
                  {fileWithPreview.uploaded ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : uploading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes for brand (optional)</label>
            <Textarea
              placeholder="Any additional information about the deliverables..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={uploading}
              rows={3}
            />
          </div>

          {currentVersion > 0 && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                This will be version {currentVersion + 1} (revision {currentVersion})
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={uploading || files.length === 0} className="gap-2">
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Submit Deliverables
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeliveryUploadDialog;
