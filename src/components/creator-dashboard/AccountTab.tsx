import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  LogOut,
  User,
  Eye,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  ChevronRight,
  ArrowLeftRight,
  Shield,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AccountTabProps {
  onNavigateToTab?: (tab: string) => void;
}

const AccountTab = ({ onNavigateToTab }: AccountTabProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [profile, setProfile] = useState<{
    id: string;
    display_name: string;
    profile_image_url: string;
    status: string;
    email: string;
    phone_number: string;
    phone_verified: boolean;
    open_to_invitations: boolean;
    show_pricing_to_public: boolean;
    allow_mass_messages: boolean;
  } | null>(null);
  const [hasBrandProfile, setHasBrandProfile] = useState(false);

  useEffect(() => {
    fetchAccountData();
  }, []);

  const fetchAccountData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, brandRes] = await Promise.all([
        supabase
          .from("creator_profiles")
          .select("id, display_name, profile_image_url, status, phone_number, phone_verified, open_to_invitations, show_pricing_to_public, allow_mass_messages")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("brand_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      if (profileRes.data) {
        setProfile({
          ...profileRes.data,
          email: user.email || "",
        });
      }
      setHasBrandProfile(!!brandRes.data);
    } catch (error) {
      console.error("Error fetching account data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (field: string, value: boolean) => {
    if (!profile) return;
    const prev = { ...profile };
    setProfile({ ...profile, [field]: value });

    const { error } = await supabase
      .from("creator_profiles")
      .update({ [field]: value })
      .eq("id", profile.id);

    if (error) {
      setProfile(prev);
      toast.error("Failed to update setting");
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
      setSigningOut(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "rejected": return "bg-red-500";
      default: return "bg-muted";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 pb-24 animate-fade-in">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      {/* Profile Header */}
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-border">
              <AvatarImage src={profile.profile_image_url} className="object-cover" />
              <AvatarFallback className="text-xl bg-primary/10 text-primary">
                {profile.display_name?.charAt(0)?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold truncate">{profile.display_name}</h2>
              <Badge className={`${getStatusColor(profile.status)} text-white capitalize text-[10px] px-2 py-0.5 mt-1`}>
                {profile.status}
              </Badge>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 text-xs"
              onClick={() => navigate(`/creator/${profile.id}`)}
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              View Profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-9 text-xs"
              onClick={() => onNavigateToTab?.("profile")}
            >
              <User className="h-3.5 w-3.5 mr-1.5" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Settings */}
      <Card>
        <CardContent className="p-4 space-y-0">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Quick Settings
          </h3>
          <div className="flex items-center justify-between py-3">
            <div>
              <Label className="text-sm font-medium">Open to Invitations</Label>
              <p className="text-xs text-muted-foreground">Accept free collaborations</p>
            </div>
            <Switch
              checked={profile.open_to_invitations}
              onCheckedChange={(v) => handleToggle("open_to_invitations", v)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between py-3">
            <div>
              <Label className="text-sm font-medium">Show Pricing</Label>
              <p className="text-xs text-muted-foreground">Visible to all users</p>
            </div>
            <Switch
              checked={profile.show_pricing_to_public}
              onCheckedChange={(v) => handleToggle("show_pricing_to_public", v)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between py-3">
            <div>
              <Label className="text-sm font-medium">Allow Mass Messages</Label>
              <p className="text-xs text-muted-foreground">From brand outreach</p>
            </div>
            <Switch
              checked={profile.allow_mass_messages}
              onCheckedChange={(v) => handleToggle("allow_mass_messages", v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card>
        <CardContent className="p-4 space-y-0">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            Account
          </h3>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">{profile.email}</p>
              </div>
            </div>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </div>
          <Separator />
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-xs text-muted-foreground">
                  {profile.phone_number || "Not set"}
                </p>
              </div>
            </div>
            {profile.phone_verified ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Switch to Brand */}
      {hasBrandProfile && (
        <Button
          variant="outline"
          className="w-full h-12 justify-between"
          onClick={() => {
            // This will trigger NativeAppGate role picker
            window.location.reload();
          }}
        >
          <span className="flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4" />
            Switch to Brand Mode
          </span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Button>
      )}

      {/* Sign Out */}
      <Button
        variant="destructive"
        className="w-full h-12"
        onClick={handleSignOut}
        disabled={signingOut}
      >
        <LogOut className="h-4 w-4 mr-2" />
        {signingOut ? "Signing Out..." : "Sign Out"}
      </Button>

      {/* App Version */}
      <p className="text-center text-[10px] text-muted-foreground pt-2">
        CollabHunts v1.0.0 (Build 144)
      </p>
    </div>
  );
};

export default AccountTab;
