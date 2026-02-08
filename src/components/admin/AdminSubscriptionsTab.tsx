import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Building2, Crown, Loader2, Copy, CalendarDays } from "lucide-react";

interface BrandResult {
  id: string;
  user_id: string;
  company_name: string;
  brand_plan: string;
}

interface SubscriptionRecord {
  id: string;
  plan_type: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
}

const AdminSubscriptionsTab = () => {
  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<BrandResult[]>([]);
  const [selected, setSelected] = useState<BrandResult | null>(null);
  const [activeSub, setActiveSub] = useState<SubscriptionRecord | null>(null);
  const [history, setHistory] = useState<SubscriptionRecord[]>([]);
  const [saving, setSaving] = useState(false);

  // Form state
  const [planType, setPlanType] = useState("none");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { toast } = useToast();

  const isUUID = (str: string) => /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i.test(str);
  const isHexFragment = (str: string) => /^[0-9a-f]{4,}$/i.test(str.replace(/-/g, ''));

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({ title: "ID copied" });
  };

  const handleSearch = async () => {
    if (!search.trim() || search.length < 2) return;
    setSearching(true);
    setSelected(null);
    setActiveSub(null);
    setHistory([]);

    try {
      const query = search.trim();
      const isId = isUUID(query);
      const isPartial = !isId && isHexFragment(query);

      const brandFilter = isId
        ? `id.eq.${query},user_id.eq.${query}`
        : isPartial
          ? `id.ilike.%${query}%,user_id.ilike.%${query}%`
          : `company_name.ilike.%${query}%`;

      const { data: brands } = await supabase
        .from("brand_profiles")
        .select("id, user_id, company_name, brand_plan")
        .or(brandFilter)
        .limit(10);

      // Also search by email
      const { data: profilesByEmail } = await supabase
        .from("profiles")
        .select("id, email")
        .ilike("email", `%${query}%`)
        .limit(10);

      const emailUserIds = (profilesByEmail || []).map(p => p.id);

      if (emailUserIds.length > 0) {
        const { data: brandsByEmail } = await supabase
          .from("brand_profiles")
          .select("id, user_id, company_name, brand_plan")
          .in("user_id", emailUserIds);

        const existingIds = new Set((brands || []).map(b => b.id));
        (brandsByEmail || []).forEach(b => {
          if (!existingIds.has(b.id)) brands?.push(b);
        });
      }

      setResults(brands || []);
    } catch (error: any) {
      toast({ title: "Search failed", description: error.message, variant: "destructive" });
    } finally {
      setSearching(false);
    }
  };

  const selectBrand = async (brand: BrandResult) => {
    setSelected(brand);

    // Fetch active subscription
    const { data: subs } = await supabase
      .from("brand_subscriptions")
      .select("id, plan_type, status, current_period_start, current_period_end, created_at")
      .eq("brand_profile_id", brand.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1);

    const active = subs?.[0] || null;
    setActiveSub(active);

    // Set form defaults
    if (active) {
      setPlanType(active.plan_type);
      setStartDate(active.current_period_start.split("T")[0]);
      setEndDate(active.current_period_end.split("T")[0]);
    } else {
      setPlanType("none");
      const today = new Date().toISOString().split("T")[0];
      const oneYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      setStartDate(today);
      setEndDate(oneYear);
    }

    // Fetch history
    const { data: historyData } = await supabase
      .from("brand_subscriptions")
      .select("id, plan_type, status, current_period_start, current_period_end, created_at")
      .eq("brand_profile_id", brand.id)
      .order("created_at", { ascending: false })
      .limit(5);

    setHistory(historyData || []);
  };

  const handleSave = async () => {
    if (!selected) return;
    if (planType !== "none" && (!startDate || !endDate)) {
      toast({ title: "Please set both start and end dates", variant: "destructive" });
      return;
    }
    if (planType !== "none" && new Date(endDate) <= new Date(startDate)) {
      toast({ title: "End date must be after start date", variant: "destructive" });
      return;
    }

    setSaving(true);
    const profileId = selected.id;

    try {
      // Cancel all existing active subscriptions
      await supabase
        .from("brand_subscriptions")
        .update({ status: "canceled" })
        .eq("brand_profile_id", profileId)
        .eq("status", "active");

      if (planType !== "none") {
        const { error } = await supabase
          .from("brand_subscriptions")
          .insert({
            brand_profile_id: profileId,
            plan_type: planType,
            status: "active",
            current_period_start: new Date(startDate).toISOString(),
            current_period_end: new Date(endDate).toISOString(),
          });
        if (error) throw error;
      }

      // Update brand_plan on profile
      await supabase
        .from("brand_profiles")
        .update({ brand_plan: planType === "none" ? "free" : planType })
        .eq("id", profileId);

      // Log override
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("admin_feature_overrides").upsert({
        target_type: "brand",
        target_profile_id: profileId,
        feature_key: "subscription_plan",
        is_enabled: planType !== "none",
        granted_by: user?.id,
        granted_at: new Date().toISOString(),
        notes: `Plan set to ${planType} (${startDate} → ${endDate})`,
        expires_at: planType !== "none" ? new Date(endDate).toISOString() : null,
      }, { onConflict: "target_type,target_profile_id,feature_key" });

      toast({ title: `Subscription ${planType === "none" ? "removed" : `set to ${planType}`}` });

      // Refresh
      await selectBrand({ ...selected, brand_plan: planType === "none" ? "free" : planType });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Brand Subscriptions</CardTitle>
          <CardDescription>Search for a brand to manage their subscription plan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, company name, or email..."
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

          {results.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" /> Brands
              </p>
              <div className="flex flex-wrap gap-2">
                {results.map((b) => (
                  <div key={b.id} className="flex items-center gap-1">
                    <Button
                      variant={selected?.id === b.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => selectBrand(b)}
                    >
                      {b.company_name}
                      <Badge variant="secondary" className="ml-1.5 text-[10px]">{b.brand_plan}</Badge>
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
        </CardContent>
      </Card>

      {/* Subscription Management */}
      {selected && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Crown className="h-5 w-5" />
              {selected.company_name}
              <Badge variant="outline">Current: {selected.brand_plan}</Badge>
            </CardTitle>
            <CardDescription>
              {activeSub
                ? `Active ${activeSub.plan_type} plan — ${new Date(activeSub.current_period_start).toLocaleDateString()} to ${new Date(activeSub.current_period_end).toLocaleDateString()}`
                : "No active subscription"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Plan selector + dates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Plan</Label>
                <Select value={planType} onValueChange={setPlanType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Free)</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" /> Start Date
                </Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={planType === "none"}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" /> End Date
                </Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={planType === "none"}
                />
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {planType === "none" ? "Remove Subscription" : "Save Subscription"}
            </Button>

            {/* History */}
            {history.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground mb-2 block">Subscription History</Label>
                <div className="space-y-2">
                  {history.map((h) => (
                    <div key={h.id} className="flex items-center justify-between p-2 rounded border text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant={h.status === "active" ? "default" : "secondary"} className="text-xs">
                          {h.status}
                        </Badge>
                        <span className="font-medium capitalize">{h.plan_type}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(h.current_period_start).toLocaleDateString()} – {new Date(h.current_period_end).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminSubscriptionsTab;
