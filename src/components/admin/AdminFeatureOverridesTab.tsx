import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Crown, BadgeCheck, Sparkles, Star, TrendingUp, Zap, Building2, Palette, Loader2, Copy } from "lucide-react";

interface CreatorResult {
  id: string;
  user_id: string;
  display_name: string;
  verification_payment_status: string | null;
  verification_expires_at: string | null;
  is_featured: boolean | null;
  featuring_priority: number | null;
}

interface BrandResult {
  id: string;
  user_id: string;
  company_name: string;
  is_verified: boolean | null;
  verification_payment_status: string | null;
  verification_expires_at: string | null;
}

interface FeaturingRecord {
  id: string;
  feature_type: string;
  is_active: boolean | null;
  start_date: string;
  end_date: string;
}

interface ActiveSubscription {
  id: string;
  plan_type: string;
  status: string;
}

type SelectedProfile =
  | { type: "creator"; data: CreatorResult; featuring: FeaturingRecord[] }
  | { type: "brand"; data: BrandResult; subscription: ActiveSubscription | null };

const CREATOR_FEATURES = [
  { key: "vip_badge", label: "VIP Badge", description: "$99/year verification badge", icon: Crown },
  { key: "featured_badge", label: "Featured Badge", description: "Featured badge + top of search", icon: Sparkles },
  { key: "homepage_spotlight", label: "Homepage Spotlight", description: "Rotating spotlight on homepage", icon: Star },
  { key: "category_boost", label: "Category Boost", description: "Top of category results", icon: TrendingUp },
  { key: "auto_popup", label: "Auto Popup", description: "Profile popup for brands", icon: Zap },
] as const;

const AdminFeatureOverridesTab = () => {
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [creatorResults, setCreatorResults] = useState<CreatorResult[]>([]);
  const [brandResults, setBrandResults] = useState<BrandResult[]>([]);
  const [selected, setSelected] = useState<SelectedProfile | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const { toast } = useToast();

  const isUUID = (str: string) => /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i.test(str);

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({ title: "ID copied" });
  };

  const handleSearch = async () => {
    if (!search.trim() || search.length < 2) return;
    setSearching(true);
    setSelected(null);

    try {
      const query = search.trim();
      const isId = isUUID(query);

      // Search creators
      const { data: creators } = await supabase
        .from("creator_profiles")
        .select("id, user_id, display_name, verification_payment_status, verification_expires_at, is_featured, featuring_priority")
        .or(isId ? `id.eq.${query},user_id.eq.${query}` : `display_name.ilike.%${query}%`)
        .limit(10);

      // Search brands
      const { data: brands } = await supabase
        .from("brand_profiles")
        .select("id, user_id, company_name, is_verified, verification_payment_status, verification_expires_at")
        .or(isId ? `id.eq.${query},user_id.eq.${query}` : `company_name.ilike.%${query}%`)
        .limit(10);

      // Also search by email via profiles table
      const { data: profilesByEmail } = await supabase
        .from("profiles")
        .select("id, email")
        .ilike("email", `%${query}%`)
        .limit(10);

      const emailUserIds = (profilesByEmail || []).map(p => p.id);

      if (emailUserIds.length > 0) {
        const { data: creatorsbyEmail } = await supabase
          .from("creator_profiles")
          .select("id, user_id, display_name, verification_payment_status, verification_expires_at, is_featured, featuring_priority")
          .in("user_id", emailUserIds);

        const { data: brandsByEmail } = await supabase
          .from("brand_profiles")
          .select("id, user_id, company_name, is_verified, verification_payment_status, verification_expires_at")
          .in("user_id", emailUserIds);

        // Merge without duplicates
        const existingCreatorIds = new Set((creators || []).map(c => c.id));
        (creatorsbyEmail || []).forEach(c => {
          if (!existingCreatorIds.has(c.id)) creators?.push(c);
        });

        const existingBrandIds = new Set((brands || []).map(b => b.id));
        (brandsByEmail || []).forEach(b => {
          if (!existingBrandIds.has(b.id)) brands?.push(b);
        });
      }

      setCreatorResults(creators || []);
      setBrandResults(brands || []);
    } catch (error: any) {
      toast({ title: "Search failed", description: error.message, variant: "destructive" });
    } finally {
      setSearching(false);
    }
  };

  const selectCreator = async (creator: CreatorResult) => {
    const { data: featuring } = await supabase
      .from("creator_featuring")
      .select("id, feature_type, is_active, start_date, end_date")
      .eq("creator_profile_id", creator.id)
      .eq("is_active", true);

    setSelected({ type: "creator", data: creator, featuring: featuring || [] });
  };

  const selectBrand = async (brand: BrandResult) => {
    const { data: subs } = await supabase
      .from("brand_subscriptions")
      .select("id, plan_type, status")
      .eq("brand_profile_id", brand.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1);

    setSelected({ type: "brand", data: brand, subscription: subs?.[0] || null });
  };

  // --- Creator toggles ---

  const isCreatorFeatureActive = (key: string): boolean => {
    if (!selected || selected.type !== "creator") return false;
    if (key === "vip_badge") return selected.data.verification_payment_status === "paid";
    return selected.featuring.some(f => f.feature_type === key && f.is_active);
  };

  const toggleCreatorFeature = async (key: string, enable: boolean) => {
    if (!selected || selected.type !== "creator") return;
    setToggling(key);
    const profileId = selected.data.id;

    try {
      if (key === "vip_badge") {
        await supabase
          .from("creator_profiles")
          .update({
            verification_payment_status: enable ? "paid" : "unpaid",
            verification_expires_at: enable ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null,
          })
          .eq("id", profileId);

        selected.data.verification_payment_status = enable ? "paid" : "unpaid";
        selected.data.verification_expires_at = enable ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null;
      } else {
      if (enable) {
          const now = new Date();
          const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
          const { error: insertErr } = await supabase.from("creator_featuring").insert({
            creator_profile_id: profileId,
            feature_type: key,
            is_active: true,
            price_cents: 0,
            start_date: now.toISOString().split("T")[0],
            end_date: endDate.toISOString().split("T")[0],
          });
          if (insertErr) throw insertErr;

          const { error: updateErr } = await supabase
            .from("creator_profiles")
            .update({ is_featured: true, featuring_priority: 10 })
            .eq("id", profileId);
          if (updateErr) throw updateErr;
        } else {
          const { error: deactivateErr } = await supabase
            .from("creator_featuring")
            .update({ is_active: false })
            .eq("creator_profile_id", profileId)
            .eq("feature_type", key);
          if (deactivateErr) throw deactivateErr;

          const { data: remaining } = await supabase
            .from("creator_featuring")
            .select("id")
            .eq("creator_profile_id", profileId)
            .eq("is_active", true);

          if (!remaining || remaining.length === 0) {
            await supabase
              .from("creator_profiles")
              .update({ is_featured: false, featuring_priority: 0 })
              .eq("id", profileId);
          }
        }
      }

      // Log override
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("admin_feature_overrides").upsert({
        target_type: "creator",
        target_profile_id: profileId,
        feature_key: key,
        is_enabled: enable,
        granted_by: user?.id,
        granted_at: new Date().toISOString(),
        expires_at: enable ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null,
      }, { onConflict: "target_type,target_profile_id,feature_key" });

      toast({ title: enable ? "Feature activated" : "Feature deactivated" });

      // Refresh
      await selectCreator(selected.data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setToggling(null);
    }
  };

  // --- Brand toggles ---

  const toggleBrandVerification = async (enable: boolean) => {
    if (!selected || selected.type !== "brand") return;
    setToggling("verified_badge");
    const profileId = selected.data.id;

    try {
      await supabase
        .from("brand_profiles")
        .update({
          verification_payment_status: enable ? "paid" : "not_paid",
          is_verified: enable,
          verification_expires_at: enable ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null,
          verification_status: enable ? "approved" : null,
        })
        .eq("id", profileId);

      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("admin_feature_overrides").upsert({
        target_type: "brand",
        target_profile_id: profileId,
        feature_key: "verified_badge",
        is_enabled: enable,
        granted_by: user?.id,
        granted_at: new Date().toISOString(),
        expires_at: enable ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null,
      }, { onConflict: "target_type,target_profile_id,feature_key" });

      toast({ title: enable ? "Verified badge activated" : "Verified badge removed" });
      await selectBrand({ ...selected.data, is_verified: enable, verification_payment_status: enable ? "paid" : "not_paid" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setToggling(null);
    }
  };


  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Feature Overrides</CardTitle>
          <CardDescription>Search for a creator or brand to manage their paid features</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, name, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </div>

          {/* Results */}
          {(creatorResults.length > 0 || brandResults.length > 0) && (
            <div className="mt-4 space-y-3">
              {creatorResults.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Palette className="h-3.5 w-3.5" /> Creators
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {creatorResults.map((c) => (
                      <div key={c.id} className="flex items-center gap-1">
                        <Button
                          variant={selected?.type === "creator" && selected.data.id === c.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => selectCreator(c)}
                        >
                          {c.display_name}
                          <span className="ml-1.5 font-mono text-[10px] opacity-60">{c.id.slice(0, 8)}</span>
                        </Button>
                        <button onClick={() => copyId(c.id)} className="p-1 hover:bg-muted rounded" title="Copy ID">
                          <Copy className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {brandResults.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" /> Brands
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {brandResults.map((b) => (
                      <div key={b.id} className="flex items-center gap-1">
                        <Button
                          variant={selected?.type === "brand" && selected.data.id === b.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => selectBrand(b)}
                        >
                          {b.company_name}
                          <span className="ml-1.5 font-mono text-[10px] opacity-60">{b.id.slice(0, 8)}</span>
                        </Button>
                        <button onClick={() => copyId(b.id)} className="p-1 hover:bg-muted rounded" title="Copy ID">
                          <Copy className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Creator Features */}
      {selected?.type === "creator" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {selected.data.display_name}
              <Badge variant="outline">Creator</Badge>
            </CardTitle>
            <CardDescription>Toggle paid features for this creator</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {CREATOR_FEATURES.map(({ key, label, description, icon: Icon }) => {
              const active = isCreatorFeatureActive(key);
              const isLoading = toggling === key;
              return (
                <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <Label className="font-medium">{label}</Label>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={active ? "default" : "secondary"} className="text-xs">
                      {active ? "Active" : "Inactive"}
                    </Badge>
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Switch checked={active} onCheckedChange={(val) => toggleCreatorFeature(key, val)} />
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Brand Features */}
      {selected?.type === "brand" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {selected.data.company_name}
              <Badge variant="outline">Brand</Badge>
            </CardTitle>
            <CardDescription>Toggle paid features for this brand</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Verified Badge */}
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex items-center gap-3">
                <BadgeCheck className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label className="font-medium">Verified Business Badge</Label>
                  <p className="text-xs text-muted-foreground">$99/year bundle: verified badge + 3 free posts/month</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={selected.data.is_verified ? "default" : "secondary"} className="text-xs">
                  {selected.data.is_verified ? "Verified" : "Not Verified"}
                </Badge>
                {toggling === "verified_badge" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Switch
                    checked={!!selected.data.is_verified}
                    onCheckedChange={(val) => toggleBrandVerification(val)}
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminFeatureOverridesTab;
