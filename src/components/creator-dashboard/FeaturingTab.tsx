import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Rocket, Clock, TrendingUp, Star, Badge as BadgeIcon, Sparkles, Bell } from "lucide-react";
import BoostProfileDialog from "./BoostProfileDialog";
import { getFeaturingTier } from "@/config/featuring-tiers";

interface FeaturingRecord {
  id: string;
  feature_type: string;
  category: string | null;
  start_date: string;
  end_date: string;
  price_cents: number;
  is_active: boolean;
}

interface FeaturingTabProps {
  creatorProfileId: string;
}

const iconMap = {
  featured_badge: BadgeIcon,
  homepage_spotlight: Star,
  category_boost: TrendingUp,
  auto_popup: Sparkles
};

const FeaturingTab = ({ creatorProfileId }: FeaturingTabProps) => {
  const [activeFeatures, setActiveFeatures] = useState<FeaturingRecord[]>([]);
  const [pastFeatures, setPastFeatures] = useState<FeaturingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBoostDialog, setShowBoostDialog] = useState(false);

  const fetchFeatures = async () => {
    setIsLoading(true);
    try {
      const now = new Date().toISOString();
      
      const { data: active } = await supabase
        .from("creator_featuring")
        .select("*")
        .eq("creator_profile_id", creatorProfileId)
        .eq("is_active", true)
        .gt("end_date", now)
        .order("end_date", { ascending: true });

      const { data: past } = await supabase
        .from("creator_featuring")
        .select("*")
        .eq("creator_profile_id", creatorProfileId)
        .or(`is_active.eq.false,end_date.lt.${now}`)
        .order("end_date", { ascending: false })
        .limit(10);

      setActiveFeatures(active || []);
      setPastFeatures(past || []);
    } catch (error) {
      console.error("Error fetching featuring:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (creatorProfileId) {
      fetchFeatures();
    }
  }, [creatorProfileId]);

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Boost Your Profile</h2>
          <p className="text-muted-foreground">Get more visibility and attract more brands</p>
        </div>
        <Button variant="outline" onClick={() => setShowBoostDialog(true)}>
          <Bell className="mr-2 h-4 w-4" />
          I'm Interested
        </Button>
      </div>

      {/* Coming Soon Banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Rocket className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-primary">Self-Service Boosts — Coming Soon!</p>
              <p className="text-sm text-muted-foreground">
                We're working on letting you boost your profile directly. For now, express your interest and our team will set it up for you.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Features (admin-activated) */}
      {activeFeatures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Active Boosts
            </CardTitle>
            <CardDescription>
              Your currently active profile boosts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeFeatures.map((feature) => {
                const tier = getFeaturingTier(feature.feature_type as any);
                const Icon = iconMap[feature.feature_type as keyof typeof iconMap] || Star;
                const daysLeft = getDaysRemaining(feature.end_date);
                
                return (
                  <div 
                    key={feature.id}
                    className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-primary/10 to-transparent"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{tier?.name || feature.feature_type}</p>
                        {feature.category && (
                          <p className="text-sm text-muted-foreground">Category: {feature.category}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={daysLeft <= 3 ? "destructive" : "secondary"}>
                        <Clock className="h-3 w-3 mr-1" />
                        {daysLeft} days left
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ends {format(new Date(feature.end_date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state when no active features */}
      {!isLoading && activeFeatures.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Rocket className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground mb-4">No active boosts yet</p>
              <Button variant="outline" onClick={() => setShowBoostDialog(true)}>
                <Bell className="mr-2 h-4 w-4" />
                Express Interest
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past Features */}
      {pastFeatures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Past Boosts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pastFeatures.map((feature) => {
                const tier = getFeaturingTier(feature.feature_type as any);
                
                return (
                  <div 
                    key={feature.id}
                    className="flex items-center justify-between p-3 border rounded-lg opacity-60"
                  >
                    <div>
                      <p className="font-medium">{tier?.name || feature.feature_type}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(feature.start_date), "MMM d")} - {format(new Date(feature.end_date), "MMM d, yyyy")}
                      </p>
                    </div>
                    <Badge variant="outline">Expired</Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <BoostProfileDialog
        open={showBoostDialog}
        onOpenChange={setShowBoostDialog}
        creatorProfileId={creatorProfileId}
        onSuccess={fetchFeatures}
      />
    </div>
  );
};

export default FeaturingTab;
