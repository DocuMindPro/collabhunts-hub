import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Folder, FolderPlus, MoreHorizontal, Pencil, Trash2, ChevronRight, Home } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface ContentFolder {
  id: string;
  name: string;
  color: string;
  parent_folder_id: string | null;
  created_at: string;
}

interface ContentFolderSidebarProps {
  folders: ContentFolder[];
  currentFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
  onFoldersChange: () => void;
  brandProfileId: string;
}

const FOLDER_COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#0ea5e9', // sky
  '#6b7280', // gray
];

export default function ContentFolderSidebar({
  folders,
  currentFolderId,
  onFolderSelect,
  onFoldersChange,
  brandProfileId,
}: ContentFolderSidebarProps) {
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderColor, setFolderColor] = useState(FOLDER_COLORS[0]);
  const [editingFolder, setEditingFolder] = useState<ContentFolder | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('content_folders')
        .insert({
          brand_profile_id: brandProfileId,
          name: folderName.trim(),
          color: folderColor,
        });

      if (error) throw error;

      toast({
        title: "Folder created",
        description: `"${folderName}" has been created`,
      });

      setShowCreateDialog(false);
      setFolderName("");
      setFolderColor(FOLDER_COLORS[0]);
      onFoldersChange();

    } catch (error: any) {
      console.error('Error creating folder:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create folder",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditFolder = async () => {
    if (!editingFolder || !folderName.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('content_folders')
        .update({
          name: folderName.trim(),
          color: folderColor,
        })
        .eq('id', editingFolder.id);

      if (error) throw error;

      toast({
        title: "Folder updated",
        description: `Folder has been renamed to "${folderName}"`,
      });

      setShowEditDialog(false);
      setEditingFolder(null);
      setFolderName("");
      onFoldersChange();

    } catch (error: any) {
      console.error('Error updating folder:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update folder",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFolder = async () => {
    if (!editingFolder) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('content_folders')
        .delete()
        .eq('id', editingFolder.id);

      if (error) throw error;

      toast({
        title: "Folder deleted",
        description: `"${editingFolder.name}" has been deleted. Content has been moved to root.`,
      });

      if (currentFolderId === editingFolder.id) {
        onFolderSelect(null);
      }

      setShowDeleteDialog(false);
      setEditingFolder(null);
      onFoldersChange();

    } catch (error: any) {
      console.error('Error deleting folder:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete folder",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (folder: ContentFolder) => {
    setEditingFolder(folder);
    setFolderName(folder.name);
    setFolderColor(folder.color);
    setShowEditDialog(true);
  };

  const openDeleteDialog = (folder: ContentFolder) => {
    setEditingFolder(folder);
    setShowDeleteDialog(true);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">Folders</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setShowCreateDialog(true)}
        >
          <FolderPlus className="h-4 w-4" />
        </Button>
      </div>

      {/* All Content (Root) */}
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 h-9",
          currentFolderId === null && "bg-accent"
        )}
        onClick={() => onFolderSelect(null)}
      >
        <Home className="h-4 w-4 text-muted-foreground" />
        <span className="truncate">All Content</span>
      </Button>

      {/* Folder list */}
      {folders.map((folder) => (
        <div key={folder.id} className="group flex items-center">
          <Button
            variant="ghost"
            className={cn(
              "flex-1 justify-start gap-2 h-9 pr-1",
              currentFolderId === folder.id && "bg-accent"
            )}
            onClick={() => onFolderSelect(folder.id)}
          >
            <Folder className="h-4 w-4" style={{ color: folder.color }} />
            <span className="truncate flex-1 text-left">{folder.name}</span>
            {currentFolderId === folder.id && (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEditDialog(folder)}>
                <Pencil className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => openDeleteDialog(folder)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}

      {folders.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">
          No folders yet. Create one to organize your content.
        </p>
      )}

      {/* Create Folder Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Folder Name</Label>
              <Input
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {FOLDER_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "w-6 h-6 rounded-full transition-all",
                      folderColor === color && "ring-2 ring-offset-2 ring-primary"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setFolderColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={!folderName.trim() || loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Folder Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Folder Name</Label>
              <Input
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {FOLDER_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={cn(
                      "w-6 h-6 rounded-full transition-all",
                      folderColor === color && "ring-2 ring-offset-2 ring-primary"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setFolderColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditFolder} disabled={!folderName.trim() || loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the folder "{editingFolder?.name}". Any content in this folder will be moved to "All Content".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFolder}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
