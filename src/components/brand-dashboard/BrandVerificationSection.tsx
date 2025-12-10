import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  BadgeCheck, 
  Clock, 
  XCircle, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles,
  Phone,
  Globe,
  Building2,
  ArrowRight
} from "lucide-react";
import VerifiedBadge from "@/components/VerifiedBadge";

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
  const [additionalNotes, setAdditionalNotes] = useState("");
  const { toast } = useToast();

  const isEligible = planType === "pro" || planType === "premium";

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

    if (!brandProfile.phone_verified) {
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
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-10 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Not eligible - show upgrade prompt
  if (!isEligible) {
    return (
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-blue-500" />
            Verified Business Badge
          </CardTitle>
          <CardDescription>
            Stand out with a verified badge next to your company name
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertTitle>Upgrade to Pro or Premium</AlertTitle>
            <AlertDescription className="mt-2">
              The Verified Business Badge is available exclusively for Pro and Premium subscribers. 
              Upgrade your plan to build trust with creators and stand out from the crowd.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Already verified
  if (brandProfile?.is_verified) {
    return (
      <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <VerifiedBadge size="lg" showTooltip={false} />
            Verified Business
          </CardTitle>
          <CardDescription>
            Your business has been verified
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-200">
                Congratulations! Your business is verified.
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your verified badge is now displayed on your company name across the platform.
              </p>
              {brandProfile.verification_completed_at && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Verified on {new Date(brandProfile.verification_completed_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Pending verification
  if (brandProfile?.verification_status === "pending") {
    return (
      <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20 dark:border-yellow-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            Verification In Progress
          </CardTitle>
          <CardDescription>
            Your verification request is being reviewed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
            <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400 animate-pulse" />
            <div>
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Your verification request is under review
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                We'll notify you via email and in-app notification once the review is complete. 
                This typically takes 1-2 business days.
              </p>
              {brandProfile.verification_submitted_at && (
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  Submitted on {new Date(brandProfile.verification_submitted_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Rejected - can reapply
  if (brandProfile?.verification_status === "rejected") {
    return (
      <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Verification Not Approved
          </CardTitle>
          <CardDescription>
            Your verification request was not approved
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">
                Reason for rejection:
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {brandProfile.verification_rejection_reason || "No specific reason provided."}
              </p>
            </div>
          </div>
          <Button onClick={handleReapply} disabled={submitting}>
            {submitting ? "Processing..." : "Reapply for Verification"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Not started - show form
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BadgeCheck className="h-5 w-5 text-blue-500" />
          Get Verified
        </CardTitle>
        <CardDescription>
          Build trust with creators by verifying your business
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Benefits */}
        <div className="grid gap-3 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium text-sm">Benefits of Verification:</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Display a verified badge next to your company name
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Build trust with creators
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Stand out in messages and campaigns
            </li>
          </ul>
        </div>

        {/* Requirements Checklist */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Requirements:</h4>
          
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Phone className={`h-5 w-5 ${brandProfile?.phone_verified ? "text-green-500" : "text-muted-foreground"}`} />
            <div className="flex-1">
              <p className="text-sm font-medium">Phone Number Verified</p>
              <p className="text-xs text-muted-foreground">Your phone number must be verified</p>
            </div>
            {brandProfile?.phone_verified ? (
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            ) : (
              <Badge variant="secondary">Required</Badge>
            )}
          </div>

          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">Company Name</p>
              <p className="text-xs text-muted-foreground">{brandProfile?.company_name || "Not set"}</p>
            </div>
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Set
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Business Website</p>
                <p className="text-xs text-muted-foreground">Provide your official website URL</p>
              </div>
              {websiteUrl ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Provided
                </Badge>
              ) : (
                <Badge variant="secondary">Required</Badge>
              )}
            </div>
            <div className="pl-11">
              <Label htmlFor="website" className="text-xs text-muted-foreground">
                Website URL
              </Label>
              <Input
                id="website"
                type="url"
                placeholder="https://yourcompany.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Optional Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm">
            Additional Notes (Optional)
          </Label>
          <Textarea
            id="notes"
            placeholder="Any additional information about your business..."
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmitVerification} 
          disabled={submitting || !brandProfile?.phone_verified || !websiteUrl.trim()}
          className="w-full"
        >
          {submitting ? (
            "Submitting..."
          ) : (
            <>
              Request Verification
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BrandVerificationSection;
