import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Plus, Globe, Trash2, DollarSign } from "lucide-react";
import { format } from "date-fns";

interface FranchiseOwner {
  id: string;
  user_id: string;
  company_name: string;
  contact_email: string;
  contact_phone: string | null;
  commission_rate: number;
  status: string;
  total_earnings_cents: number;
  available_balance_cents: number;
  created_at: string;
  activated_at: string | null;
  countries: { id: string; country_code: string; country_name: string }[];
}

interface PayoutRequest {
  id: string;
  franchise_owner_id: string;
  amount_cents: number;
  status: string;
  payout_method: string | null;
  payout_details: unknown;
  admin_notes: string | null;
  requested_at: string;
  processed_at: string | null;
  franchise_owner?: { company_name: string; contact_email: string };
}

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "IN", name: "India" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "LB", name: "Lebanon" },
  { code: "EG", name: "Egypt" },
  { code: "NG", name: "Nigeria" },
  { code: "ZA", name: "South Africa" },
];

const AdminFranchisesTab = () => {
  const [franchises, setFranchises] = useState<FranchiseOwner[]>([]);
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [assignCountryDialogOpen, setAssignCountryDialogOpen] = useState(false);
  const [selectedFranchise, setSelectedFranchise] = useState<FranchiseOwner | null>(null);
  const [processDialogOpen, setProcessDialogOpen] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<PayoutRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  
  // Create form
  const [newEmail, setNewEmail] = useState("");
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  
  const { toast } = useToast();

  useEffect(() => {
    checkSuperAdmin();
    fetchFranchises();
    fetchPayoutRequests();
  }, []);

  const checkSuperAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", user.id)
      .single();
    
    setIsSuperAdmin(profile?.email === "elie.goole@gmail.com");
  };

  const fetchFranchises = async () => {
    try {
      setLoading(true);
      
      const { data: franchisesData, error } = await supabase
        .from("franchise_owners")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch countries for each franchise
      const franchisesWithCountries = await Promise.all(
        (franchisesData || []).map(async (franchise) => {
          const { data: countriesData } = await supabase
            .from("franchise_countries")
            .select("id, country_code, country_name")
            .eq("franchise_owner_id", franchise.id);

          return { ...franchise, countries: countriesData || [] };
        })
      );

      setFranchises(franchisesWithCountries);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchPayoutRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("franchise_payout_requests")
        .select("*, franchise_owner:franchise_owners(company_name, contact_email)")
        .order("requested_at", { ascending: false });

      if (error) throw error;
      setPayoutRequests(data || []);
    } catch (error: any) {
      console.error("Error fetching payout requests:", error);
    }
  };

  const handleCreateFranchise = async () => {
    if (!isSuperAdmin) {
      toast({ title: "Access Denied", description: "Only super admin can create franchises", variant: "destructive" });
      return;
    }

    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", newEmail)
        .single();

      if (!profileData) {
        toast({ title: "Error", description: "No user found with this email", variant: "destructive" });
        return;
      }

      const { error } = await supabase
        .from("franchise_owners")
        .insert({
          user_id: profileData.id,
          company_name: newCompanyName,
          contact_email: newEmail,
          contact_phone: newPhone || null,
          status: "pending",
        });

      if (error) throw error;

      await supabase.from("user_roles").insert({
        user_id: profileData.id,
        role: "franchise"
      });

      toast({ title: "Franchise created successfully" });
      setCreateDialogOpen(false);
      setNewEmail("");
      setNewCompanyName("");
      setNewPhone("");
      fetchFranchises();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleActivate = async (franchiseId: string) => {
    if (!isSuperAdmin) {
      toast({ title: "Access Denied", description: "Only super admin can activate franchises", variant: "destructive" });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("franchise_owners")
        .update({ 
          status: "active",
          activated_by: user?.id,
          activated_at: new Date().toISOString()
        })
        .eq("id", franchiseId);

      if (error) throw error;

      toast({ title: "Franchise activated" });
      fetchFranchises();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSuspend = async (franchiseId: string) => {
    try {
      const { error } = await supabase
        .from("franchise_owners")
        .update({ status: "suspended" })
        .eq("id", franchiseId);

      if (error) throw error;

      toast({ title: "Franchise suspended" });
      fetchFranchises();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleAssignCountry = async () => {
    if (!selectedFranchise || !selectedCountry) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const countryData = COUNTRIES.find(c => c.code === selectedCountry);

      const { error } = await supabase
        .from("franchise_countries")
        .insert({
          franchise_owner_id: selectedFranchise.id,
          country_code: selectedCountry,
          country_name: countryData?.name || selectedCountry,
          assigned_by: user?.id
        });

      if (error) throw error;

      toast({ title: "Country assigned" });
      setAssignCountryDialogOpen(false);
      setSelectedCountry("");
      fetchFranchises();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleRemoveCountry = async (countryId: string) => {
    try {
      const { error } = await supabase
        .from("franchise_countries")
        .delete()
        .eq("id", countryId);

      if (error) throw error;

      toast({ title: "Country removed" });
      fetchFranchises();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleProcessPayout = async (status: "approved" | "rejected") => {
    if (!selectedPayout) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("franchise_payout_requests")
        .update({
          status,
          admin_notes: adminNotes || null,
          processed_by: user?.id,
          processed_at: new Date().toISOString()
        })
        .eq("id", selectedPayout.id);

      if (error) throw error;

      toast({ title: `Payout ${status}` });
      setProcessDialogOpen(false);
      setSelectedPayout(null);
      setAdminNotes("");
      fetchPayoutRequests();
      fetchFranchises();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const assignedCountryCodes = franchises.flatMap(f => f.countries.map(c => c.country_code));
  const pendingPayouts = payoutRequests.filter(p => p.status === "pending");

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="franchises" className="space-y-4">
      <TabsList>
        <TabsTrigger value="franchises">Franchises</TabsTrigger>
        <TabsTrigger value="payouts" className="gap-2">
          Payout Requests
          {pendingPayouts.length > 0 && (
            <Badge variant="destructive" className="ml-1">{pendingPayouts.length}</Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="franchises">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Franchise Management</CardTitle>
                <CardDescription>Manage franchise owners and country assignments</CardDescription>
              </div>
              {isSuperAdmin && (
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create Franchise
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Franchise</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>User Email (must have existing account)</Label>
                        <Input value={newEmail} onChange={(e) => setNewEmail(e.target.value)} type="email" />
                      </div>
                      <div>
                        <Label>Company Name</Label>
                        <Input value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)} />
                      </div>
                      <div>
                        <Label>Contact Phone (optional)</Label>
                        <Input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
                      </div>
                      <Button onClick={handleCreateFranchise} className="w-full">Create Franchise</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            {!isSuperAdmin && (
              <p className="text-sm text-amber-600 mt-2">
                ⚠️ Only super admin (elie.goole@gmail.com) can create and activate franchises
              </p>
            )}
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Countries</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Total Earnings</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {franchises.map((franchise) => (
                  <TableRow key={franchise.id}>
                    <TableCell className="font-medium">{franchise.company_name}</TableCell>
                    <TableCell>{franchise.contact_email}</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {franchise.countries.map(country => (
                          <Badge key={country.id} variant="outline" className="gap-1">
                            {country.country_code}
                            {isSuperAdmin && (
                              <button onClick={() => handleRemoveCountry(country.id)} className="ml-1 hover:text-destructive">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </Badge>
                        ))}
                        {isSuperAdmin && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 px-2"
                            onClick={() => {
                              setSelectedFranchise(franchise);
                              setAssignCountryDialogOpen(true);
                            }}
                          >
                            <Globe className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{(franchise.commission_rate * 100).toFixed(0)}%</TableCell>
                    <TableCell className="text-green-600 font-medium">
                      ${(franchise.available_balance_cents / 100).toLocaleString()}
                    </TableCell>
                    <TableCell>${(franchise.total_earnings_cents / 100).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={franchise.status === "active" ? "default" : franchise.status === "pending" ? "secondary" : "destructive"}>
                        {franchise.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {franchise.status === "pending" && isSuperAdmin && (
                          <Button size="sm" variant="outline" onClick={() => handleActivate(franchise.id)}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        {franchise.status === "active" && (
                          <Button size="sm" variant="outline" onClick={() => handleSuspend(franchise.id)}>
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="payouts">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Franchise Payout Requests
            </CardTitle>
            <CardDescription>Review and process payout requests from franchise owners</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Franchise</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payoutRequests.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payout.franchise_owner?.company_name}</p>
                        <p className="text-sm text-muted-foreground">{payout.franchise_owner?.contact_email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">${(payout.amount_cents / 100).toLocaleString()}</TableCell>
                    <TableCell>{payout.payout_method || "Not specified"}</TableCell>
                    <TableCell>{format(new Date(payout.requested_at), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <Badge variant={
                        payout.status === "approved" ? "default" : 
                        payout.status === "rejected" ? "destructive" : 
                        "secondary"
                      }>
                        {payout.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {payout.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedPayout(payout);
                            setProcessDialogOpen(true);
                          }}
                        >
                          Process
                        </Button>
                      )}
                      {payout.admin_notes && (
                        <p className="text-xs text-muted-foreground mt-1">Note: {payout.admin_notes}</p>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {payoutRequests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No payout requests yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Assign Country Dialog */}
      <Dialog open={assignCountryDialogOpen} onOpenChange={setAssignCountryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Country to {selectedFranchise?.company_name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Country</Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.filter(c => !assignedCountryCodes.includes(c.code)).map(country => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name} ({country.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAssignCountry} className="w-full" disabled={!selectedCountry}>
              Assign Country
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Process Payout Dialog */}
      <Dialog open={processDialogOpen} onOpenChange={setProcessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Payout Request</DialogTitle>
          </DialogHeader>
          {selectedPayout && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p><strong>Franchise:</strong> {selectedPayout.franchise_owner?.company_name}</p>
                <p><strong>Amount:</strong> ${(selectedPayout.amount_cents / 100).toLocaleString()}</p>
                <p><strong>Method:</strong> {selectedPayout.payout_method || "Not specified"}</p>
                {selectedPayout.payout_details && Object.keys(selectedPayout.payout_details).length > 0 && (
                  <div>
                    <strong>Details:</strong>
                    <pre className="text-xs bg-background p-2 rounded mt-1">
                      {JSON.stringify(selectedPayout.payout_details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
              <div>
                <Label>Admin Notes (optional)</Label>
                <Textarea 
                  value={adminNotes} 
                  onChange={(e) => setAdminNotes(e.target.value)} 
                  placeholder="Add notes about this payout..."
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleProcessPayout("approved")} className="flex-1 bg-green-600 hover:bg-green-700">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button onClick={() => handleProcessPayout("rejected")} variant="destructive" className="flex-1">
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Tabs>
  );
};

export default AdminFranchisesTab;