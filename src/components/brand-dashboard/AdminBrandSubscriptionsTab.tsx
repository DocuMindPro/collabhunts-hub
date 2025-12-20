import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Building2, CreditCard, Search, AlertCircle, CheckCircle } from "lucide-react";
import { format, isPast } from "date-fns";
import { SUBSCRIPTION_PLANS, PlanType } from "@/lib/stripe-mock";

interface BrandSubscription {
  id: string;
  brand_profile_id: string;
  plan_type: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at?: string;
  brand_profiles: {
    company_name: string;
    user_id: string;
  };
  email?: string;
}

const AdminBrandSubscriptionsTab = () => {
  const [subscriptions, setSubscriptions] = useState<BrandSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] = useState<BrandSubscription | null>(null);
  const [newPlanType, setNewPlanType] = useState("");
  const [periodEndDate, setPeriodEndDate] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"current" | "active" | "expired" | "all">("current");
  const { toast } = useToast();

  const isExpired = (periodEnd: string) => isPast(new Date(periodEnd));

  // Get only the latest subscription per brand (excludes canceled, groups by brand)
  const latestSubscriptionsPerBrand = useMemo(() => {
    // First, filter out canceled subscriptions for the "current" view
    const nonCanceled = subscriptions.filter(s => s.status !== "canceled");
    
    // Group by brand_profile_id and get the most recent one
    const brandMap = new Map<string, BrandSubscription>();
    nonCanceled.forEach(sub => {
      const existing = brandMap.get(sub.brand_profile_id);
      if (!existing || new Date(sub.created_at || sub.current_period_start) > new Date(existing.created_at || existing.current_period_start)) {
        brandMap.set(sub.brand_profile_id, sub);
      }
    });
    
    return Array.from(brandMap.values());
  }, [subscriptions]);

  const filteredSubscriptions = useMemo(() => {
    // Use latest per brand for "current" view, all for "all" view
    const baseList = statusFilter === "all" ? subscriptions : latestSubscriptionsPerBrand;
    
    return baseList.filter((sub) => {
      // Search filter
      const matchesSearch =
        sub.brand_profiles.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sub.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      // Status filter
      const expired = isExpired(sub.current_period_end);
      let matchesStatus = true;
      
      if (statusFilter === "active") {
        matchesStatus = !expired && sub.status !== "canceled";
      } else if (statusFilter === "expired") {
        matchesStatus = expired && sub.status !== "canceled";
      } else if (statusFilter === "current") {
        // Already filtered to latest per brand, no additional filter needed
        matchesStatus = true;
      }
      // "all" shows everything including canceled

      return matchesSearch && matchesStatus;
    });
  }, [subscriptions, latestSubscriptionsPerBrand, searchQuery, statusFilter]);

  // Count based on latest subscriptions per brand (not all historical records)
  const expiredCount = useMemo(
    () => latestSubscriptionsPerBrand.filter((s) => isExpired(s.current_period_end)).length,
    [latestSubscriptionsPerBrand]
  );
  const activeCount = latestSubscriptionsPerBrand.length - expiredCount;
  const totalBrands = latestSubscriptionsPerBrand.length;

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("brand_subscriptions")
        .select(`
          *,
          brand_profiles(company_name, user_id)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch emails for each brand profile
      const subscriptionsWithEmails = await Promise.all(
        (data || []).map(async (sub) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", sub.brand_profiles.user_id)
            .single();
          
          return {
            ...sub,
            email: profileData?.email || ""
          };
        })
      );

      setSubscriptions(subscriptionsWithEmails);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSubscription = async () => {
    if (!selectedSubscription || !newPlanType) return;

    try {
      setIsUpdating(true);

      const updates: any = {
        plan_type: newPlanType,
      };

      if (periodEndDate) {
        updates.current_period_end = new Date(periodEndDate).toISOString();
      }

      const { error } = await supabase
        .from("brand_subscriptions")
        .update(updates)
        .eq("id", selectedSubscription.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Subscription updated successfully"
      });

      fetchSubscriptions();
      setSelectedSubscription(null);
      setNewPlanType("");
      setPeriodEndDate("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const openEditDialog = (subscription: BrandSubscription) => {
    setSelectedSubscription(subscription);
    setNewPlanType(subscription.plan_type);
    setPeriodEndDate(subscription.current_period_end.split("T")[0]);
  };

  const getPlanBadge = (planType: string) => {
    const colors: Record<string, string> = {
      none: "bg-gray-400",
      basic: "bg-green-500",
      pro: "bg-blue-500",
      premium: "bg-purple-500"
    };
    const labels: Record<string, string> = {
      none: "FREE",
      basic: "BASIC",
      pro: "PRO",
      premium: "PREMIUM"
    };
    return <Badge className={colors[planType] || "bg-gray-500"}>{labels[planType] || planType.toUpperCase()}</Badge>;
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Brands</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBrands}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{expiredCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Brands</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestSubscriptionsPerBrand.filter(s => s.plan_type !== "none").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Brand Subscriptions</CardTitle>
          <CardDescription>Manage all brand subscription plans</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by company name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current (Latest per Brand)</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="expired">Expired Only</SelectItem>
                <SelectItem value="all">All History</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Period End</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.map((subscription) => {
                const expired = isExpired(subscription.current_period_end);
                const isCanceled = subscription.status === "canceled";
                return (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{subscription.brand_profiles.company_name}</div>
                        <div className="text-sm text-muted-foreground font-normal">
                          {subscription.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getPlanBadge(subscription.plan_type)}</TableCell>
                    <TableCell>
                      {isCanceled ? (
                        <Badge variant="secondary">Canceled</Badge>
                      ) : expired ? (
                        <Badge variant="destructive">Expired</Badge>
                      ) : (
                        <Badge variant="outline" className="border-green-500 text-green-600">
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(subscription.current_period_end), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(subscription)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedSubscription} onOpenChange={() => setSelectedSubscription(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Subscription</DialogTitle>
            <DialogDescription>
              Change the subscription plan for {selectedSubscription?.brand_profiles.company_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="planType">Subscription Plan</Label>
              <Select value={newPlanType} onValueChange={setNewPlanType}>
                <SelectTrigger id="planType">
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(SUBSCRIPTION_PLANS) as PlanType[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      {SUBSCRIPTION_PLANS[key].name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="periodEnd">Period End Date</Label>
              <Input
                id="periodEnd"
                type="date"
                value={periodEndDate}
                onChange={(e) => setPeriodEndDate(e.target.value)}
              />
            </div>

            <Button
              onClick={handleUpdateSubscription}
              disabled={isUpdating || !newPlanType}
              className="w-full"
            >
              {isUpdating ? "Updating..." : "Update Subscription"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBrandSubscriptionsTab;