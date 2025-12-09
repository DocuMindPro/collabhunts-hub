import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Upload, Image, Video, Trash2, Calendar as CalendarIcon, AlertTriangle, User, Loader2, FolderOpen, Search, X, Plus, HardDrive, Download, CheckSquare, Square, Tag, Folder, FolderInput } from "lucide-react";
import { format, differenceInDays, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import { formatStorageSize, getStoragePercentage, canUseContentLibrary, getCurrentStorageUsage, getEffectiveStorageLimit } from "@/lib/storage-utils";
import { STORAGE_ADDON, formatPrice } from "@/lib/stripe-mock";
import UpgradePrompt from "@/components/UpgradePrompt";
import ContentFolderSidebar, { ContentFolder } from "./ContentFolderSidebar";
import ContentTagInput from "./ContentTagInput";

interface ContentItem {
  id: string;
  file_name: string;
  file_type: string;
  mime_type: string;
  file_size_bytes: number;
  r2_key: string;
  thumbnail_r2_key: string | null;
  title: string | null;
  description: string | null;
  creator_profile_id: string | null;
  booking_id: string | null;
  rights_type: string | null;
  usage_rights_start: string | null;
  usage_rights_end: string | null;
  tags: string[] | null;
  folder_id: string | null;
  created_at: string;
  creator_profile?: {
    display_name: string;
    profile_image_url: string | null;
  } | null;
}

interface CreatorOption {
  id: string;
  display_name: string;
}

interface BulkUploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

const BrandContentLibraryTab = () => {
  const { toast } = useToast();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [folders, setFolders] = useState<ContentFolder[]>([]);
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageLimit, setStorageLimit] = useState(0);
  const [brandProfileId, setBrandProfileId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterTag, setFilterTag] = useState<string>("all");
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [creators, setCreators] = useState<CreatorOption[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  
  // Upload dialog state
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadCreatorId, setUploadCreatorId] = useState<string>("");
  const [uploadRightsType, setUploadRightsType] = useState("perpetual");
  const [uploadRightsStart, setUploadRightsStart] = useState<Date | undefined>(new Date());
  const [uploadRightsEnd, setUploadRightsEnd] = useState<Date | undefined>(undefined);
  const [uploadTags, setUploadTags] = useState<string[]>([]);
  const [uploadFolderId, setUploadFolderId] = useState<string>("");
  
  // Bulk upload state
  const [showBulkUploadDialog, setShowBulkUploadDialog] = useState(false);
  const [bulkUploadFiles, setBulkUploadFiles] = useState<BulkUploadFile[]>([]);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkRightsType, setBulkRightsType] = useState("perpetual");
  const [bulkCreatorId, setBulkCreatorId] = useState<string>("");
  const [bulkFolderId, setBulkFolderId] = useState<string>("");
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<ContentItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  // Preview dialog state
  const [previewContent, setPreviewContent] = useState<ContentItem | null>(null);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Storage purchase dialog state
  const [showStoragePurchaseDialog, setShowStoragePurchaseDialog] = useState(false);
  const [storageToPurchase, setStorageToPurchase] = useState(1);
  const [purchasingStorage, setPurchasingStorage] = useState(false);

  // Selection mode state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);

  // Move to folder dialog
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [moveFolderId, setMoveFolderId] = useState<string>("");

  // Video thumbnail state
  const [generatingThumbnail, setGeneratingThumbnail] = useState(false);

  const r2PublicUrl = import.meta.env.VITE_R2_PUBLIC_URL || "";

  const loadData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check access
      const access = await canUseContentLibrary(user.id);
      setHasAccess(access);

      if (!access) {
        setLoading(false);
        return;
      }

      // Get brand profile
      const { data: brandProfile } = await supabase
        .from('brand_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!brandProfile) {
        setLoading(false);
        return;
      }

      setBrandProfileId(brandProfile.id);

      // Load storage info, content, and folders in parallel
      const [usage, limit, contentResult, foldersResult] = await Promise.all([
        getCurrentStorageUsage(brandProfile.id),
        getEffectiveStorageLimit(brandProfile.id),
        supabase
          .from('content_library')
          .select(`
            *,
            creator_profile:creator_profiles(display_name, profile_image_url)
          `)
          .eq('brand_profile_id', brandProfile.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('content_folders')
          .select('*')
          .eq('brand_profile_id', brandProfile.id)
          .order('name', { ascending: true }),
      ]);

      setStorageUsed(usage);
      setStorageLimit(limit);

      if (contentResult.error) throw contentResult.error;
      setContent(contentResult.data || []);

      // Extract all unique tags
      const tagsSet = new Set<string>();
      contentResult.data?.forEach(item => {
        item.tags?.forEach(tag => tagsSet.add(tag));
      });
      setAllTags(Array.from(tagsSet).sort());

      if (foldersResult.error) throw foldersResult.error;
      setFolders(foldersResult.data || []);

      // Load creators for dropdown (from bookings)
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('creator_profile_id, creator_profile:creator_profiles(id, display_name)')
        .eq('brand_profile_id', brandProfile.id)
        .eq('status', 'completed');

      const uniqueCreators = new Map<string, CreatorOption>();
      bookingsData?.forEach((booking: any) => {
        if (booking.creator_profile) {
          uniqueCreators.set(booking.creator_profile.id, {
            id: booking.creator_profile.id,
            display_name: booking.creator_profile.display_name,
          });
        }
      });
      setCreators(Array.from(uniqueCreators.values()));

    } catch (error) {
      console.error('Error loading content library:', error);
      toast({
        title: "Error",
        description: "Failed to load content library",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const validateFile = (file: File): string | null => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm'];
    if (!allowedTypes.includes(file.type)) {
      return "Invalid file type";
    }
    if (file.size > 100 * 1024 * 1024) {
      return "File too large (max 100MB)";
    }
    return null;
  };

  // Generate video thumbnail client-side
  const generateVideoThumbnail = async (file: File): Promise<string | null> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      video.onloadeddata = () => {
        // Seek to 2 seconds or 10% of video, whichever is less
        video.currentTime = Math.min(2, video.duration * 0.1);
      };

      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        try {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(dataUrl);
        } catch (err) {
          console.error('Error generating thumbnail:', err);
          resolve(null);
        }
        
        URL.revokeObjectURL(video.src);
      };

      video.onerror = () => {
        console.error('Error loading video for thumbnail');
        resolve(null);
        URL.revokeObjectURL(video.src);
      };

      // Set timeout for thumbnail generation
      setTimeout(() => {
        if (!video.ended) {
          resolve(null);
          URL.revokeObjectURL(video.src);
        }
      }, 10000);

      video.src = URL.createObjectURL(file);
    });
  };

  const validateAndSelectFile = (file: File) => {
    const error = validateFile(file);
    if (error) {
      toast({
        title: "Invalid file",
        description: error,
        variant: "destructive",
      });
      return;
    }

    // Check storage limit
    if (storageUsed + file.size > storageLimit) {
      toast({
        title: "Storage limit exceeded",
        description: "You don't have enough storage space. Consider purchasing additional storage.",
        variant: "destructive",
      });
      setShowStoragePurchaseDialog(true);
      return;
    }

    setSelectedFile(file);
    setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    setUploadFolderId(currentFolderId || "");
    setShowUploadDialog(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length === 1) {
      validateAndSelectFile(files[0]);
    } else {
      // Multiple files - open bulk upload dialog
      handleBulkFileSelect(files);
    }
    // Reset input
    e.target.value = '';
  };

  const handleBulkFileSelect = (files: FileList) => {
    const validFiles: BulkUploadFile[] = [];
    let totalSize = 0;

    Array.from(files).forEach((file) => {
      const error = validateFile(file);
      if (!error) {
        validFiles.push({
          file,
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          progress: 0,
          status: 'pending',
        });
        totalSize += file.size;
      }
    });

    if (validFiles.length === 0) {
      toast({
        title: "No valid files",
        description: "None of the selected files are valid",
        variant: "destructive",
      });
      return;
    }

    if (storageUsed + totalSize > storageLimit) {
      toast({
        title: "Storage limit exceeded",
        description: "Total file size exceeds available storage",
        variant: "destructive",
      });
      setShowStoragePurchaseDialog(true);
      return;
    }

    setBulkUploadFiles(validFiles);
    setBulkFolderId(currentFolderId || "");
    setShowBulkUploadDialog(true);
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length === 1) {
      validateAndSelectFile(files[0]);
    } else if (files.length > 1) {
      handleBulkFileSelect(files);
    }
  };

  // Mock storage purchase handler
  const handlePurchaseStorage = async () => {
    if (!brandProfileId) return;

    setPurchasingStorage(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      const purchaseAmount = storageToPurchase * STORAGE_ADDON.amountBytes;
      const purchasePrice = storageToPurchase * STORAGE_ADDON.priceCents;

      const { error } = await supabase
        .from('storage_purchases')
        .insert({
          brand_profile_id: brandProfileId,
          storage_amount_bytes: purchaseAmount,
          price_cents: purchasePrice,
          status: 'active',
          stripe_payment_id: `mock_pi_${Date.now()}`,
        });

      if (error) throw error;

      toast({
        title: "Storage purchased!",
        description: `${formatStorageSize(purchaseAmount)} has been added to your account.`,
      });

      setShowStoragePurchaseDialog(false);
      setStorageToPurchase(1);
      await loadData();

    } catch (error: any) {
      console.error('Storage purchase error:', error);
      toast({
        title: "Purchase failed",
        description: error.message || "Failed to purchase storage",
        variant: "destructive",
      });
    } finally {
      setPurchasingStorage(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !brandProfileId) return;

    setUploading(true);
    setUploadProgress(10);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Generate thumbnail for videos
      let thumbnailDataUrl: string | null = null;
      if (selectedFile.type.startsWith('video/')) {
        setGeneratingThumbnail(true);
        thumbnailDataUrl = await generateVideoThumbnail(selectedFile);
        setGeneratingThumbnail(false);
      }

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', uploadTitle);
      formData.append('description', uploadDescription);
      if (uploadCreatorId) formData.append('creator_profile_id', uploadCreatorId);
      formData.append('rights_type', uploadRightsType);
      if (uploadRightsStart) formData.append('usage_rights_start', uploadRightsStart.toISOString());
      if (uploadRightsEnd) formData.append('usage_rights_end', uploadRightsEnd.toISOString());
      if (uploadTags.length > 0) formData.append('tags', uploadTags.join(','));
      if (uploadFolderId) formData.append('folder_id', uploadFolderId);
      if (thumbnailDataUrl) formData.append('thumbnail_data', thumbnailDataUrl);

      setUploadProgress(30);

      const response = await supabase.functions.invoke('upload-content', {
        body: formData,
      });

      setUploadProgress(90);

      if (response.error) {
        throw new Error(response.error.message || 'Upload failed');
      }

      const result = response.data;
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadProgress(100);

      toast({
        title: "Upload successful",
        description: `${selectedFile.name} has been added to your content library`,
      });

      await loadData();
      resetUploadForm();

    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload content",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setGeneratingThumbnail(false);
    }
  };

  const handleBulkUpload = async () => {
    if (bulkUploadFiles.length === 0 || !brandProfileId) return;

    setBulkUploading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Not authenticated",
        description: "Please log in to upload files",
        variant: "destructive",
      });
      setBulkUploading(false);
      return;
    }

    for (let i = 0; i < bulkUploadFiles.length; i++) {
      const uploadFile = bulkUploadFiles[i];
      
      // Update status to uploading
      setBulkUploadFiles(prev => 
        prev.map(f => f.id === uploadFile.id ? { ...f, status: 'uploading' as const, progress: 10 } : f)
      );

      try {
        // Generate thumbnail for videos
        let thumbnailDataUrl: string | null = null;
        if (uploadFile.file.type.startsWith('video/')) {
          thumbnailDataUrl = await generateVideoThumbnail(uploadFile.file);
        }

        const formData = new FormData();
        formData.append('file', uploadFile.file);
        formData.append('title', uploadFile.file.name.replace(/\.[^/.]+$/, ""));
        formData.append('rights_type', bulkRightsType);
        if (bulkCreatorId) formData.append('creator_profile_id', bulkCreatorId);
        if (bulkFolderId) formData.append('folder_id', bulkFolderId);
        if (thumbnailDataUrl) formData.append('thumbnail_data', thumbnailDataUrl);

        setBulkUploadFiles(prev => 
          prev.map(f => f.id === uploadFile.id ? { ...f, progress: 50 } : f)
        );

        const response = await supabase.functions.invoke('upload-content', {
          body: formData,
        });

        if (response.error || !response.data?.success) {
          throw new Error(response.error?.message || response.data?.error || 'Upload failed');
        }

        setBulkUploadFiles(prev => 
          prev.map(f => f.id === uploadFile.id ? { ...f, status: 'success' as const, progress: 100 } : f)
        );

      } catch (error: any) {
        console.error('Bulk upload error:', error);
        setBulkUploadFiles(prev => 
          prev.map(f => f.id === uploadFile.id ? { 
            ...f, 
            status: 'error' as const, 
            progress: 0,
            error: error.message 
          } : f)
        );
      }
    }

    setBulkUploading(false);
    await loadData();

    const successCount = bulkUploadFiles.filter(f => f.status === 'success').length;
    const errorCount = bulkUploadFiles.filter(f => f.status === 'error').length;

    if (successCount > 0) {
      toast({
        title: "Bulk upload complete",
        description: `${successCount} file(s) uploaded successfully${errorCount > 0 ? `, ${errorCount} failed` : ''}`,
      });
    }
  };

  const resetUploadForm = () => {
    setShowUploadDialog(false);
    setSelectedFile(null);
    setUploadTitle("");
    setUploadDescription("");
    setUploadCreatorId("");
    setUploadRightsType("perpetual");
    setUploadRightsStart(new Date());
    setUploadRightsEnd(undefined);
    setUploadTags([]);
    setUploadFolderId("");
  };

  const resetBulkUploadForm = () => {
    setShowBulkUploadDialog(false);
    setBulkUploadFiles([]);
    setBulkRightsType("perpetual");
    setBulkCreatorId("");
    setBulkFolderId("");
  };

  const removeBulkFile = (id: string) => {
    setBulkUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDeleteClick = (item: ContentItem) => {
    setContentToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!contentToDelete) return;

    setDeleting(true);

    try {
      const response = await supabase.functions.invoke('delete-content', {
        body: { content_id: contentToDelete.id },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Delete failed');
      }

      toast({
        title: "Content deleted",
        description: `${contentToDelete.file_name} has been removed`,
      });

      await loadData();

    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete content",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setContentToDelete(null);
    }
  };

  // Move content to folder
  const handleMoveToFolder = async () => {
    if (selectedItems.size === 0) return;

    try {
      const { error } = await supabase
        .from('content_library')
        .update({ folder_id: moveFolderId || null })
        .in('id', Array.from(selectedItems));

      if (error) throw error;

      const folderName = moveFolderId 
        ? folders.find(f => f.id === moveFolderId)?.name 
        : "All Content";

      toast({
        title: "Content moved",
        description: `${selectedItems.size} item(s) moved to "${folderName}"`,
      });

      setShowMoveDialog(false);
      setSelectedItems(new Set());
      setSelectionMode(false);
      await loadData();

    } catch (error: any) {
      console.error('Move error:', error);
      toast({
        title: "Move failed",
        description: error.message || "Failed to move content",
        variant: "destructive",
      });
    }
  };

  // Download functionality
  const downloadFile = async (item: ContentItem) => {
    const url = getContentUrl(item);
    if (!url) {
      toast({
        title: "Download failed",
        description: "File URL not available",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = item.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleBulkDownload = async () => {
    if (selectedItems.size === 0) return;

    setDownloading(true);
    
    const itemsToDownload = content.filter(item => selectedItems.has(item.id));
    
    for (const item of itemsToDownload) {
      await downloadFile(item);
      // Small delay between downloads to prevent browser blocking
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setDownloading(false);
    toast({
      title: "Download complete",
      description: `${itemsToDownload.length} file(s) downloaded`,
    });
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAllItems = () => {
    if (selectedItems.size === filteredContent.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredContent.map(item => item.id)));
    }
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedItems(new Set());
  };

  const getExpirationStatus = (item: ContentItem) => {
    if (!item.usage_rights_end || item.rights_type === 'perpetual') return null;
    
    const endDate = new Date(item.usage_rights_end);
    const daysRemaining = differenceInDays(endDate, new Date());
    
    if (isPast(endDate)) {
      return { status: 'expired', label: 'Expired', variant: 'destructive' as const };
    } else if (daysRemaining <= 7) {
      return { status: 'expiring', label: `Expires in ${daysRemaining} days`, variant: 'destructive' as const };
    } else if (daysRemaining <= 30) {
      return { status: 'soon', label: `${daysRemaining} days left`, variant: 'secondary' as const };
    }
    return null;
  };

  const getContentUrl = (item: ContentItem) => {
    if (r2PublicUrl) {
      return `${r2PublicUrl}/${item.r2_key}`;
    }
    return "";
  };

  const getThumbnailUrl = (item: ContentItem) => {
    if (item.thumbnail_r2_key && r2PublicUrl) {
      return `${r2PublicUrl}/${item.thumbnail_r2_key}`;
    }
    return null;
  };

  const filteredContent = content.filter(item => {
    const matchesSearch = !searchQuery || 
      item.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = filterType === 'all' || item.file_type === filterType;
    
    const matchesTag = filterTag === 'all' || item.tags?.includes(filterTag);
    
    const matchesFolder = currentFolderId === null 
      ? true 
      : item.folder_id === currentFolderId;
    
    return matchesSearch && matchesType && matchesTag && matchesFolder;
  });

  const storagePercentage = getStoragePercentage(storageUsed, storageLimit);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasAccess) {
    return <UpgradePrompt feature="content_library" />;
  }

  return (
    <div className="flex gap-6">
      {/* Folder Sidebar */}
      <div className="hidden md:block w-48 flex-shrink-0">
        <Card className="sticky top-4">
          <CardContent className="pt-4">
            <ContentFolderSidebar
              folders={folders}
              currentFolderId={currentFolderId}
              onFolderSelect={setCurrentFolderId}
              onFoldersChange={loadData}
              brandProfileId={brandProfileId!}
            />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-6 min-w-0">
        {/* Storage Usage Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Storage Usage</CardTitle>
                <CardDescription>
                  {formatStorageSize(storageUsed)} of {formatStorageSize(storageLimit)} used
                </CardDescription>
              </div>
              <Badge variant={storagePercentage > 90 ? "destructive" : storagePercentage > 70 ? "secondary" : "outline"}>
                {storagePercentage}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={storagePercentage} className="h-2" />
            <div className="flex items-center justify-between mt-3">
              <p className="text-sm text-muted-foreground">
                {storagePercentage > 90 ? "Storage almost full!" : storagePercentage > 70 ? "Running low on storage." : `${formatStorageSize(storageLimit - storageUsed)} available`}
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowStoragePurchaseDialog(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Buy More Storage
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Folder Selector */}
        <div className="md:hidden">
          <Select value={currentFolderId || "all"} onValueChange={(v) => setCurrentFolderId(v === "all" ? null : v)}>
            <SelectTrigger>
              <Folder className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Content" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Content</SelectItem>
              {folders.map((folder) => (
                <SelectItem key={folder.id} value={folder.id}>
                  <span className="flex items-center gap-2">
                    <Folder className="h-4 w-4" style={{ color: folder.color }} />
                    {folder.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Drag and Drop Upload Zone */}
        <Card
          ref={dropZoneRef}
          className={cn(
            "border-2 border-dashed transition-colors",
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className={cn(
                "p-4 rounded-full mb-4 transition-colors",
                isDragging ? "bg-primary/10" : "bg-muted"
              )}>
                <Upload className={cn(
                  "h-8 w-8 transition-colors",
                  isDragging ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <h3 className="text-lg font-medium mb-1">
                {isDragging ? "Drop your files here" : "Drag and drop your files here"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Drop multiple files for bulk upload • JPG, PNG, GIF, WEBP, MP4, MOV, WEBM up to 100MB each
              </p>
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                  <Upload className="h-4 w-4" />
                  Browse Files
                </div>
              </Label>
              <Input
                id="file-upload"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/webm"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* Filter and Actions Section */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                  </SelectContent>
                </Select>
                {allTags.length > 0 && (
                  <Select value={filterTag} onValueChange={setFilterTag}>
                    <SelectTrigger className="w-[140px]">
                      <Tag className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="All Tags" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tags</SelectItem>
                      {allTags.map((tag) => (
                        <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Selection Mode Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                {selectionMode ? (
                  <>
                    <Button variant="outline" size="sm" onClick={selectAllItems}>
                      {selectedItems.size === filteredContent.length ? (
                        <><Square className="h-4 w-4 mr-1" /> Deselect All</>
                      ) : (
                        <><CheckSquare className="h-4 w-4 mr-1" /> Select All</>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleBulkDownload}
                      disabled={selectedItems.size === 0 || downloading}
                    >
                      {downloading ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-1" />
                      )}
                      Download ({selectedItems.size})
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setShowMoveDialog(true)}
                      disabled={selectedItems.size === 0}
                    >
                      <FolderInput className="h-4 w-4 mr-1" />
                      Move to Folder
                    </Button>
                    <Button variant="ghost" size="sm" onClick={exitSelectionMode}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setSelectionMode(true)} disabled={filteredContent.length === 0}>
                    <CheckSquare className="h-4 w-4 mr-1" />
                    Select
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Grid */}
        {filteredContent.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {currentFolderId ? "No content in this folder" : "No content yet"}
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                {currentFolderId 
                  ? "Move content here or upload new files"
                  : "Upload images and videos from your creator collaborations to build your content library"
                }
              </p>
              <Label htmlFor="file-upload-empty" className="cursor-pointer">
                <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                  <Upload className="h-4 w-4" />
                  Upload Your First Content
                </div>
              </Label>
              <Input
                id="file-upload-empty"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/webm"
                onChange={handleFileSelect}
                className="hidden"
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredContent.map((item) => {
              const expirationStatus = getExpirationStatus(item);
              const contentUrl = getContentUrl(item);
              const thumbnailUrl = getThumbnailUrl(item);
              const isSelected = selectedItems.has(item.id);
              
              return (
                <Card 
                  key={item.id} 
                  className={cn(
                    "overflow-hidden group cursor-pointer hover:shadow-lg transition-all",
                    isSelected && "ring-2 ring-primary"
                  )}
                  onClick={() => selectionMode ? toggleItemSelection(item.id) : setPreviewContent(item)}
                >
                  <div className="aspect-square relative bg-muted">
                    {item.file_type === 'video' ? (
                      thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt={item.title || item.file_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <Video className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )
                    ) : (
                      <img
                        src={contentUrl}
                        alt={item.title || item.file_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    )}

                    {/* Video play indicator */}
                    {item.file_type === 'video' && thumbnailUrl && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-black/50 rounded-full p-3">
                          <Video className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Selection checkbox */}
                    {selectionMode && (
                      <div className="absolute top-2 left-2 z-10">
                        <Checkbox 
                          checked={isSelected} 
                          onClick={(e) => e.stopPropagation()}
                          onCheckedChange={() => toggleItemSelection(item.id)}
                          className="bg-background"
                        />
                      </div>
                    )}
                    
                    {/* Overlay badges */}
                    <div className={cn("absolute top-2 flex flex-col gap-1", selectionMode ? "left-8" : "left-2")}>
                      {expirationStatus && (
                        <Badge variant={expirationStatus.variant} className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {expirationStatus.label}
                        </Badge>
                      )}
                    </div>

                    {/* Type badge */}
                    <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
                      {item.file_type === 'video' ? <Video className="h-3 w-3" /> : <Image className="h-3 w-3" />}
                    </Badge>

                    {/* Action buttons overlay */}
                    {!selectionMode && (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadFile(item);
                          }}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(item);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-3">
                    <p className="font-medium text-sm truncate">{item.title || item.file_name}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {item.creator_profile && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <User className="h-3 w-3" />
                          {item.creator_profile.display_name}
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatStorageSize(item.file_size_bytes)}
                      </span>
                    </div>
                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {item.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs py-0">
                            {tag}
                          </Badge>
                        ))}
                        {item.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs py-0">
                            +{item.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Single Upload Dialog */}
        <Dialog open={showUploadDialog} onOpenChange={(open) => !uploading && setShowUploadDialog(open)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Upload Content</DialogTitle>
              <DialogDescription>
                Add content to your library with metadata and usage rights
              </DialogDescription>
            </DialogHeader>

            {selectedFile && (
              <div className="space-y-4">
                {/* File preview */}
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  {selectedFile.type.startsWith('video/') ? (
                    <Video className="h-10 w-10 text-muted-foreground" />
                  ) : (
                    <Image className="h-10 w-10 text-muted-foreground" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">{formatStorageSize(selectedFile.size)}</p>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="Enter a title"
                    disabled={uploading}
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    placeholder="Add a description"
                    rows={2}
                    disabled={uploading}
                  />
                </div>

                {/* Folder */}
                <div className="space-y-2">
                  <Label>Folder</Label>
                  <Select value={uploadFolderId} onValueChange={setUploadFolderId} disabled={uploading}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Content (no folder)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Content (no folder)</SelectItem>
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          <span className="flex items-center gap-2">
                            <Folder className="h-4 w-4" style={{ color: folder.color }} />
                            {folder.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Creator Attribution */}
                <div className="space-y-2">
                  <Label htmlFor="creator">Creator Attribution (optional)</Label>
                  <Select value={uploadCreatorId} onValueChange={setUploadCreatorId} disabled={uploading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select creator..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No creator</SelectItem>
                      {creators.map((creator) => (
                        <SelectItem key={creator.id} value={creator.id}>
                          {creator.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Link this content to a creator you've worked with
                  </p>
                </div>

                {/* Rights Type */}
                <div className="space-y-2">
                  <Label htmlFor="rights-type">Usage Rights</Label>
                  <Select value={uploadRightsType} onValueChange={setUploadRightsType} disabled={uploading}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="perpetual">Perpetual (unlimited use)</SelectItem>
                      <SelectItem value="limited">Limited Time Period</SelectItem>
                      <SelectItem value="one-time">One-Time Use</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Rights Period */}
                {uploadRightsType !== 'perpetual' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Rights Start</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !uploadRightsStart && "text-muted-foreground"
                            )}
                            disabled={uploading}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {uploadRightsStart ? format(uploadRightsStart, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={uploadRightsStart}
                            onSelect={setUploadRightsStart}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label>Rights End</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !uploadRightsEnd && "text-muted-foreground"
                            )}
                            disabled={uploading}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {uploadRightsEnd ? format(uploadRightsEnd, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={uploadRightsEnd}
                            onSelect={setUploadRightsEnd}
                            initialFocus
                            disabled={(date) => uploadRightsStart ? date < uploadRightsStart : false}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Tags (optional)</Label>
                  <ContentTagInput
                    tags={uploadTags}
                    onTagsChange={setUploadTags}
                    suggestions={allTags}
                    disabled={uploading}
                  />
                </div>

                {/* Upload progress */}
                {(uploading || generatingThumbnail) && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-sm text-muted-foreground text-center">
                      {generatingThumbnail ? "Generating thumbnail..." : `Uploading... ${uploadProgress}%`}
                    </p>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={resetUploadForm} disabled={uploading}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={!selectedFile || uploading}>
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Bulk Upload Dialog */}
        <Dialog open={showBulkUploadDialog} onOpenChange={(open) => !bulkUploading && setShowBulkUploadDialog(open)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Bulk Upload ({bulkUploadFiles.length} files)</DialogTitle>
              <DialogDescription>
                Upload multiple files at once with shared settings
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* File list with progress */}
              <div className="max-h-[200px] overflow-y-auto space-y-2">
                {bulkUploadFiles.map((uploadFile) => (
                  <div key={uploadFile.id} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                    {uploadFile.file.type.startsWith('video/') ? (
                      <Video className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <Image className="h-6 w-6 text-muted-foreground flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{uploadFile.file.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">{formatStorageSize(uploadFile.file.size)}</p>
                        {uploadFile.status === 'success' && (
                          <Badge variant="outline" className="text-xs text-green-600">Uploaded</Badge>
                        )}
                        {uploadFile.status === 'error' && (
                          <Badge variant="destructive" className="text-xs">Failed</Badge>
                        )}
                        {uploadFile.status === 'uploading' && (
                          <span className="text-xs text-primary">{uploadFile.progress}%</span>
                        )}
                      </div>
                      {uploadFile.status === 'uploading' && (
                        <Progress value={uploadFile.progress} className="h-1 mt-1" />
                      )}
                    </div>
                    {!bulkUploading && uploadFile.status === 'pending' && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => removeBulkFile(uploadFile.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* Shared settings */}
              <div className="space-y-4 pt-4 border-t">
                <p className="text-sm font-medium">Shared Settings (applied to all files)</p>
                
                <div className="space-y-2">
                  <Label>Folder</Label>
                  <Select value={bulkFolderId} onValueChange={setBulkFolderId} disabled={bulkUploading}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Content (no folder)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Content (no folder)</SelectItem>
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id}>
                          <span className="flex items-center gap-2">
                            <Folder className="h-4 w-4" style={{ color: folder.color }} />
                            {folder.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Creator Attribution (optional)</Label>
                  <Select value={bulkCreatorId} onValueChange={setBulkCreatorId} disabled={bulkUploading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select creator..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No creator</SelectItem>
                      {creators.map((creator) => (
                        <SelectItem key={creator.id} value={creator.id}>
                          {creator.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Usage Rights</Label>
                  <Select value={bulkRightsType} onValueChange={setBulkRightsType} disabled={bulkUploading}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="perpetual">Perpetual (unlimited use)</SelectItem>
                      <SelectItem value="limited">Limited Time Period</SelectItem>
                      <SelectItem value="one-time">One-Time Use</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Total size */}
              <div className="flex justify-between text-sm p-3 bg-muted rounded-lg">
                <span className="text-muted-foreground">Total size</span>
                <span className="font-medium">
                  {formatStorageSize(bulkUploadFiles.reduce((sum, f) => sum + f.file.size, 0))}
                </span>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={resetBulkUploadForm} disabled={bulkUploading}>
                Cancel
              </Button>
              <Button 
                onClick={handleBulkUpload} 
                disabled={bulkUploadFiles.length === 0 || bulkUploading || bulkUploadFiles.every(f => f.status !== 'pending')}
              >
                {bulkUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload All
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={!!previewContent} onOpenChange={() => setPreviewContent(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {previewContent && (
              <>
                <DialogHeader>
                  <DialogTitle>{previewContent.title || previewContent.file_name}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Media preview */}
                  <div className="rounded-lg overflow-hidden bg-muted">
                    {previewContent.file_type === 'video' ? (
                      <video
                        src={getContentUrl(previewContent)}
                        controls
                        className="w-full max-h-[400px]"
                      />
                    ) : (
                      <img
                        src={getContentUrl(previewContent)}
                        alt={previewContent.title || previewContent.file_name}
                        className="w-full max-h-[400px] object-contain"
                      />
                    )}
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">File Size</p>
                      <p className="font-medium">{formatStorageSize(previewContent.file_size_bytes)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Type</p>
                      <p className="font-medium capitalize">{previewContent.file_type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Uploaded</p>
                      <p className="font-medium">{format(new Date(previewContent.created_at), 'PPP')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Rights Type</p>
                      <p className="font-medium capitalize">{previewContent.rights_type || 'Perpetual'}</p>
                    </div>
                  </div>

                  {/* Folder */}
                  {previewContent.folder_id && (
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <Folder className="h-5 w-5" style={{ color: folders.find(f => f.id === previewContent.folder_id)?.color }} />
                      <div>
                        <p className="text-sm text-muted-foreground">Folder</p>
                        <p className="font-medium">{folders.find(f => f.id === previewContent.folder_id)?.name}</p>
                      </div>
                    </div>
                  )}

                  {/* Creator attribution */}
                  {previewContent.creator_profile && (
                    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Created by</p>
                        <p className="font-medium">{previewContent.creator_profile.display_name}</p>
                      </div>
                    </div>
                  )}

                  {/* Rights period */}
                  {previewContent.rights_type !== 'perpetual' && previewContent.usage_rights_end && (
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">Usage Rights Period</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {previewContent.usage_rights_start && format(new Date(previewContent.usage_rights_start), 'PPP')} — {format(new Date(previewContent.usage_rights_end), 'PPP')}
                      </p>
                      {getExpirationStatus(previewContent) && (
                        <Badge variant={getExpirationStatus(previewContent)!.variant} className="mt-2">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {getExpirationStatus(previewContent)!.label}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  {previewContent.description && (
                    <div>
                      <p className="text-muted-foreground text-sm mb-1">Description</p>
                      <p>{previewContent.description}</p>
                    </div>
                  )}

                  {/* Tags */}
                  {previewContent.tags && previewContent.tags.length > 0 && (
                    <div>
                      <p className="text-muted-foreground text-sm mb-2">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {previewContent.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => downloadFile(previewContent)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleDeleteClick(previewContent);
                      setPreviewContent(null);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Content?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{contentToDelete?.title || contentToDelete?.file_name}" from your content library. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Move to Folder Dialog */}
        <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Move to Folder</DialogTitle>
              <DialogDescription>
                Move {selectedItems.size} item(s) to a folder
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Select value={moveFolderId} onValueChange={setMoveFolderId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select folder..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Content (no folder)</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      <span className="flex items-center gap-2">
                        <Folder className="h-4 w-4" style={{ color: folder.color }} />
                        {folder.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowMoveDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleMoveToFolder}>
                Move
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Storage Purchase Dialog */}
        <Dialog open={showStoragePurchaseDialog} onOpenChange={setShowStoragePurchaseDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Buy More Storage</DialogTitle>
              <DialogDescription>
                Add extra storage to your Content Library
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <HardDrive className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{formatStorageSize(STORAGE_ADDON.amountBytes)} Storage</p>
                    <p className="text-sm text-muted-foreground">{formatPrice(STORAGE_ADDON.priceCents)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setStorageToPurchase(Math.max(1, storageToPurchase - 1))}
                    disabled={storageToPurchase <= 1}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center font-medium">{storageToPurchase}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setStorageToPurchase(storageToPurchase + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex justify-between text-sm border-t pt-4">
                <span className="text-muted-foreground">Total storage</span>
                <span className="font-medium">{formatStorageSize(storageToPurchase * STORAGE_ADDON.amountBytes)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total price</span>
                <span className="font-medium">{formatPrice(storageToPurchase * STORAGE_ADDON.priceCents)}</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStoragePurchaseDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handlePurchaseStorage} disabled={purchasingStorage}>
                {purchasingStorage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Buy for ${formatPrice(storageToPurchase * STORAGE_ADDON.priceCents)}`
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default BrandContentLibraryTab;
