import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Edit } from "lucide-react";

const PLATFORMS = [
  "Instagram",
  "TikTok",
  "YouTube",
  "Twitter",
  "Facebook",
  "LinkedIn",
  "Twitch",
  "Snapchat",
  "Pinterest",
];

interface SocialAccount {
  id: string;
  platform: string;
  username: string;
  follower_count: number | null;
  profile_url: string | null;
}

interface SocialAccountsSectionProps {
  creatorProfileId: string;
}

const SocialAccountsSection = ({ creatorProfileId }: SocialAccountsSectionProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<SocialAccount | null>(null);
  const [formData, setFormData] = useState({
    platform: "",
    username: "",
    follower_count: "",
    profile_url: "",
  });

  useEffect(() => {
    if (creatorProfileId) {
      fetchSocialAccounts();
    }
  }, [creatorProfileId]);

  const fetchSocialAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from("creator_social_accounts")
        .select("*")
        .eq("creator_profile_id", creatorProfileId)
        .order("platform");

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error("Error fetching social accounts:", error);
      toast({
        title: "Error",
        description: "Failed to load social accounts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openAddDialog = () => {
    setEditingAccount(null);
    setFormData({
      platform: "",
      username: "",
      follower_count: "",
      profile_url: "",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (account: SocialAccount) => {
    setEditingAccount(account);
    setFormData({
      platform: account.platform,
      username: account.username,
      follower_count: account.follower_count?.toString() || "",
      profile_url: account.profile_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.platform || !formData.username) {
      toast({
        title: "Validation Error",
        description: "Platform and username are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const accountData = {
        creator_profile_id: creatorProfileId,
        platform: formData.platform,
        username: formData.username,
        follower_count: formData.follower_count ? parseInt(formData.follower_count) : null,
        profile_url: formData.profile_url || null,
      };

      if (editingAccount) {
        const { error } = await supabase
          .from("creator_social_accounts")
          .update(accountData)
          .eq("id", editingAccount.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("creator_social_accounts")
          .insert([accountData]);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Social account ${editingAccount ? "updated" : "added"} successfully`,
      });

      setIsDialogOpen(false);
      fetchSocialAccounts();
    } catch (error) {
      console.error("Error saving social account:", error);
      toast({
        title: "Error",
        description: "Failed to save social account",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (accountId: string) => {
    if (!confirm("Are you sure you want to delete this social account?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("creator_social_accounts")
        .delete()
        .eq("id", accountId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Social account deleted successfully",
      });

      fetchSocialAccounts();
    } catch (error) {
      console.error("Error deleting social account:", error);
      toast({
        title: "Error",
        description: "Failed to delete social account",
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Social Media Accounts</CardTitle>
            <CardDescription>Manage your connected social media profiles</CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openAddDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingAccount ? "Edit Social Account" : "Add Social Account"}
                </DialogTitle>
                <DialogDescription>
                  Add your social media presence to attract more brands
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform *</Label>
                  <Select
                    value={formData.platform}
                    onValueChange={(value) => setFormData({ ...formData, platform: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((platform) => (
                        <SelectItem key={platform} value={platform}>
                          {platform}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="@username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="follower_count">Follower Count</Label>
                  <Input
                    id="follower_count"
                    type="number"
                    value={formData.follower_count}
                    onChange={(e) => setFormData({ ...formData, follower_count: e.target.value })}
                    placeholder="10000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile_url">Profile URL</Label>
                  <Input
                    id="profile_url"
                    type="url"
                    value={formData.profile_url}
                    onChange={(e) => setFormData({ ...formData, profile_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {accounts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No social accounts added yet. Click "Add Account" to get started.
          </p>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{account.platform}</span>
                    <span className="text-muted-foreground">@{account.username}</span>
                  </div>
                  {account.follower_count && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {account.follower_count.toLocaleString()} followers
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(account)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(account.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SocialAccountsSection;
