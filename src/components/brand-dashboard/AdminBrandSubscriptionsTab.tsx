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
  const [expiryFilter, setExpiryFilter] = useState<"all" | "active" | "expired">("all");
  const { toast } = useToast();

  const isExpired = (periodEnd: string) => isPast(new Date(periodEnd));

  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      // Search filter
      const matchesSearch =
        sub.brand_profiles.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sub.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

      // Expiry filter
      const expired = isExpired(sub.current_period_end);
      const matchesExpiry =
        expiryFilter === "all" ||
        (expiryFilter === "active" && !expired) ||
        (expiryFilter === "expired" && expired);

      return matchesSearch && matchesExpiry;
    });
  }, [subscriptions, searchQuery, expiryFilter]);

  const expiredCount = useMemo(
    () => subscriptions.filter((s) => isExpired(s.current_period_end)).length,
    [subscriptions]
  );
  const activeCount = subscriptions.length - expiredCount;

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
      basic: "bg-gray-500",
      pro: "bg-blue-500",
      premium: "bg-purple-500"
    };
    return <Badge className={colors[planType] || "bg-gray-500"}>{planType.toUpperCase()}</Badge>;
  };

  const getMarketplaceFee = (planType: string) => {
    const plan = SUBSCRIPTION_PLANS[planType as PlanType];
    if (plan) {
      return `${(plan.marketplaceFee * 100).toFixed(0)}%`;
    }
    return "20%"; // Default to Basic fee
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
            <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions.length}</div>
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
            <CardTitle className="text-sm font-medium">Premium Subscribers</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions.filter(s => s.plan_type === "premium").length}
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
            <Select value={expiryFilter} onValueChange={(v) => setExpiryFilter(v as any)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subscriptions</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="expired">Expired Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Marketplace Fee</TableHead>
                <TableHead>Period End</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.map((subscription) => {
                const expired = isExpired(subscription.current_period_end);
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
                      <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
                        {subscription.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={expired ? "destructive" : "outline"}
                        className={expired ? "" : "border-green-500 text-green-600"}
                      >
                        {expired ? "Expired" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>{getMarketplaceFee(subscription.plan_type)}</TableCell>
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
                      {SUBSCRIPTION_PLANS[key].name} ({(SUBSCRIPTION_PLANS[key].marketplaceFee * 100).toFixed(0)}% fee)
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
