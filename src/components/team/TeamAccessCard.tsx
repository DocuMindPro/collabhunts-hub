import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Users, Mail, Loader2, UserPlus, X } from "lucide-react";

interface Delegate {
  id: string;
  delegate_email: string;
  status: string;
  invited_at: string;
  accepted_at: string | null;
}

interface TeamAccessCardProps {
  profileId: string;
  accountType: "brand" | "creator";
  locked?: boolean;
  lockedMessage?: string;
  onUpgrade?: () => void;
}

const TeamAccessCard = ({ profileId, accountType, locked, lockedMessage, onUpgrade }: TeamAccessCardProps) => {
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchDelegates();
  }, [profileId]);

  const fetchDelegates = async () => {
    try {
      const { data, error } = await supabase
        .from("account_delegates")
        .select("id, delegate_email, status, invited_at, accepted_at")
        .eq("profile_id", profileId)
        .eq("account_type", accountType)
        .in("status", ["pending", "active"])
        .order("invited_at", { ascending: false });

      if (error) throw error;
      setDelegates(data || []);
    } catch (error) {
      console.error("Error fetching delegates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setSending(true);
    try {
      const response = await supabase.functions.invoke("send-team-invite", {
        body: { email: trimmedEmail, accountType, profileId },
      });

      if (response.error) throw new Error(response.error.message);
      if (!response.data?.success) throw new Error(response.data?.error || "Failed to send invite");

      toast.success(`Invite sent to ${trimmedEmail}`);
      setEmail("");
      fetchDelegates();
    } catch (error: any) {
      console.error("Error sending invite:", error);
      toast.error(error.message || "Failed to send invite");
    } finally {
      setSending(false);
    }
  };

  const handleRevoke = async (delegateId: string, delegateEmail: string) => {
    try {
      const { error } = await supabase
        .from("account_delegates")
        .update({ status: "revoked" })
        .eq("id", delegateId);

      if (error) throw error;
      toast.success(`Access revoked for ${delegateEmail}`);
      fetchDelegates();
    } catch (error) {
      console.error("Error revoking access:", error);
      toast.error("Failed to revoke access");
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Users className="h-4 w-4" />
          Team Access
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {locked ? (
          <div className="text-center py-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              {lockedMessage || "Upgrade to Basic or Pro to invite team members."}
            </p>
            {onUpgrade ? (
              <Button variant="outline" size="sm" onClick={onUpgrade}>View Plans</Button>
            ) : (
              <a href="/brand#pricing">
                <Button variant="outline" size="sm">View Plans</Button>
              </a>
            )}
          </div>
        ) : (
        <>
        <p className="text-sm text-muted-foreground">
          Invite team members or agencies to manage this account on your behalf.
        </p>

        {/* Invite form */}
        <div className="flex gap-2">
          <Input
            type="email"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInvite()}
            className="flex-1"
          />
          <Button onClick={handleInvite} disabled={sending} size="sm" className="gap-1.5 shrink-0">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Invite
          </Button>
        </div>

        {/* Delegates list */}
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : delegates.length > 0 ? (
          <div className="space-y-2">
            {delegates.map((d) => (
              <div key={d.id} className="flex items-center justify-between py-2 px-3 rounded-md border text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{d.delegate_email}</span>
                  <Badge variant={d.status === "active" ? "default" : "secondary"} className="shrink-0 text-xs">
                    {d.status === "active" ? "Active" : "Pending"}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => handleRevoke(d.id, d.delegate_email)}
                  title="Revoke access"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-2">
            No team members yet. Invite someone to get started.
          </p>
        )}
        </>
        )}
      </CardContent>
    </Card>
  );
};

export default TeamAccessCard;
