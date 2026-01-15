import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  BadgeCheck, 
  Clock, 
  XCircle, 
  CheckCircle, 
  AlertTriangle, 
  Phone,
  Globe,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from "lucide-react";
import VerifiedBadge from "@/components/VerifiedBadge";
import { SUBSCRIPTION_PLANS, PlanType } from "@/lib/stripe-mock";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface BrandVerificationSectionProps {
  planType: string;
}

interface BrandProfile {
  id: string;
  company_name: string;
  website_url: string | null;
  phone_number: string | null;
  phone_verified: boolean;
  is_verified: boolean;
  verification_status: string;
  verification_submitted_at: string | null;
  verification_completed_at: string | null;
  verification_rejection_reason: string | null;
}

const BrandVerificationSection = ({ planType }: BrandVerificationSectionProps) => {
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const isEligible = SUBSCRIPTION_PLANS[planType as PlanType]?.canRequestVerifiedBadge ?? false;

  useEffect(() => {
    fetchBrandProfile();
  }, []);

  const fetchBrandProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("brand_profiles")
        .select("id, company_name, website_url, phone_number, phone_verified, is_verified, verification_status, verification_submitted_at, verification_completed_at, verification_rejection_reason")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      setBrandProfile(data);
      if (data?.website_url) {
        setWebsiteUrl(data.website_url);
      }
    } catch (error: any) {
      console.error("Error fetching brand profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitVerification = async () => {
    if (!brandProfile) return;

    if (!websiteUrl.trim()) {
      toast({
        title: "Website Required",
        description: "Please provide your business website URL for verification.",
        variant: "destructive",
      });
      return;
    }

    if (brandProfile.phone_verified !== true) {
      toast({
        title: "Phone Verification Required",
        description: "Please verify your phone number before requesting business verification.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("brand_profiles")
        .update({
          website_url: websiteUrl,
          verification_status: "pending",
          verification_submitted_at: new Date().toISOString(),
        })
        .eq("id", brandProfile.id);

      if (error) throw error;

      toast({
        title: "Verification Request Submitted",
        description: "We'll review your request and notify you once it's processed.",
      });

      fetchBrandProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReapply = async () => {
    if (!brandProfile) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("brand_profiles")
        .update({
          verification_status: "not_started",
          verification_rejection_reason: null,
          verification_completed_at: null,
        })
        .eq("id", brandProfile.id);

      if (error) throw error;

      toast({
        title: "Ready to Reapply",
        description: "You can now submit a new verification request.",
      });

      fetchBrandProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-12 bg-muted/50 rounded-lg animate-pulse" />
    );
  }

  // Not eligible - show upgrade prompt (compact)
  if (!isEligible) {
    return (
      <div className="flex items-center justify-between gap-4 p-3 bg-muted/30 border rounded-lg">
        <div className="flex items-center gap-2">
          <BadgeCheck className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">Verified Business Badge</span>
          <Badge variant="secondary" className="text-xs">Pro/Premium</Badge>
        </div>
        <span className="text-xs text-muted-foreground">Upgrade to unlock</span>
      </div>
    );
  }

  // Already verified - compact success banner
  if (brandProfile?.is_verified) {
    return (
      <div className="flex items-center justify-between gap-4 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg">
        <div className="flex items-center gap-2">
          <VerifiedBadge size="sm" showTooltip={false} />
          <span className="text-sm font-medium text-green-800 dark:text-green-200">
            Verified Business
          </span>
        </div>
        {brandProfile.verification_completed_at && (
          <span className="text-xs text-green-600 dark:text-green-400">
            Since {new Date(brandProfile.verification_completed_at).toLocaleDateString()}
          </span>
        )}
      </div>
    );
  }

  // Pending verification - compact banner
  if (brandProfile?.verification_status === "pending") {
    return (
      <div className="flex items-center justify-between gap-4 p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900 rounded-lg">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-yellow-600 animate-pulse" />
          <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Verification in progress
          </span>
        </div>
        <span className="text-xs text-yellow-600 dark:text-yellow-400">
          Submitted {brandProfile.verification_submitted_at 
            ? new Date(brandProfile.verification_submitted_at).toLocaleDateString() 
            : "recently"}
        </span>
      </div>
    );
  }

  // Rejected - compact with reapply
  if (brandProfile?.verification_status === "rejected") {
    return (
      <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-800 dark:text-red-200">
              Verification not approved
            </span>
          </div>
          <Button size="sm" variant="outline" onClick={handleReapply} disabled={submitting}>
            Reapply
          </Button>
        </div>
        {brandProfile.verification_rejection_reason && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-start gap-1">
            <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
            {brandProfile.verification_rejection_reason}
          </p>
        )}
      </div>
    );
  }

  // Not started - collapsible form
  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="border rounded-lg overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between gap-4 p-3 hover:bg-muted/50 transition-colors text-left">
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Get Verified</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">
                · Build trust with creators
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {brandProfile?.phone_verified === true ? "Ready" : "Setup needed"}
              </Badge>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-4 pt-2 border-t bg-muted/20 space-y-4">
            {/* Compact requirements row */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 text-xs">
                <Phone className={`h-3.5 w-3.5 ${brandProfile?.phone_verified === true ? "text-green-500" : "text-muted-foreground"}`} />
                {brandProfile?.phone_verified === true ? (
                  <>
                    <span className="text-green-700 dark:text-green-400">Phone verified</span>
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  </>
                ) : (
                  <>
                    <span className="text-muted-foreground">Phone required</span>
                    <span className="text-muted-foreground">—</span>
                    <Link 
                      to="/brand-dashboard?tab=account" 
                      className="text-primary hover:underline font-medium"
                    >
                      Add phone number
                    </Link>
                  </>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <Globe className={`h-3.5 w-3.5 ${websiteUrl ? "text-green-500" : "text-muted-foreground"}`} />
                <span className={websiteUrl ? "text-green-700 dark:text-green-400" : "text-muted-foreground"}>
                  Website {websiteUrl ? "provided" : "required"}
                </span>
                {websiteUrl && <CheckCircle className="h-3 w-3 text-green-500" />}
              </div>
            </div>

            {/* Website input */}
            <div className="space-y-1.5">
              <Label htmlFor="website" className="text-xs">
                Business Website URL
              </Label>
              <Input
                id="website"
                type="url"
                placeholder="https://yourcompany.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="h-9"
              />
            </div>

            {/* Submit */}
            <Button 
              onClick={handleSubmitVerification} 
              disabled={submitting || brandProfile?.phone_verified !== true || !websiteUrl.trim()}
              size="sm"
              className="w-full"
            >
              {submitting ? "Submitting..." : "Request Verification"}
            </Button>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};

export default BrandVerificationSection;