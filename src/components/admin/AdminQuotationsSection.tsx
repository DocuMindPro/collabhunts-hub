import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, FileText } from "lucide-react";

interface QuotationInquiry {
  id: string;
  plan_type: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  brand_profile_id: string;
  brand?: {
    company_name: string;
    phone_number: string | null;
    first_name: string | null;
    last_name: string | null;
    industry: string | null;
    email?: string;
  };
}

const AdminQuotationsSection = () => {
  const [inquiries, setInquiries] = useState<QuotationInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("quotation_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        setInquiries([]);
        return;
      }

      // Fetch brand details
      const brandIds = [...new Set(data.map((d) => d.brand_profile_id))];
      const { data: brands } = await supabase
        .from("brand_profiles")
        .select("id, company_name, phone_number, first_name, last_name, industry, user_id")
        .in("id", brandIds);

      // Fetch emails from profiles
      const userIds = brands?.map((b) => b.user_id) || [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds);

      const enriched = data.map((inquiry) => {
        const brand = brands?.find((b) => b.id === inquiry.brand_profile_id);
        const profile = profiles?.find((p) => p.id === brand?.user_id);
        return {
          ...inquiry,
          brand: brand
            ? {
                company_name: brand.company_name,
                phone_number: brand.phone_number,
                first_name: brand.first_name,
                last_name: brand.last_name,
                industry: brand.industry,
                email: profile?.email,
              }
            : undefined,
        };
      });

      setInquiries(enriched);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const { error } = await supabase
        .from("quotation_inquiries")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq))
      );
      toast({ title: "Updated", description: `Status changed to ${newStatus}` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUpdatingId(null);
    }
  };

  const updateNotes = async (id: string, notes: string) => {
    try {
      const { error } = await supabase
        .from("quotation_inquiries")
        .update({ admin_notes: notes })
        .eq("id", id);

      if (error) throw error;

      setInquiries((prev) =>
        prev.map((inq) => (inq.id === id ? { ...inq, admin_notes: notes } : inq))
      );
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "contacted":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Contacted</Badge>;
      case "closed":
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="p-4 md:p-6">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-lg">Quotation Inquiries</CardTitle>
            <CardDescription>
              Brands requesting pricing for Basic/Pro plans ({inquiries.length} total)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No quotation inquiries yet
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inquiries.map((inq) => (
                  <TableRow key={inq.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{inq.brand?.company_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">
                          {inq.brand?.first_name} {inq.brand?.last_name}
                        </p>
                        {inq.brand?.industry && (
                          <p className="text-xs text-muted-foreground">{inq.brand.industry}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {inq.brand?.phone_number && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            <a href={`tel:${inq.brand.phone_number}`} className="hover:underline">
                              {inq.brand.phone_number}
                            </a>
                          </div>
                        )}
                        {inq.brand?.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            <a href={`mailto:${inq.brand.email}`} className="hover:underline">
                              {inq.brand.email}
                            </a>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {inq.plan_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={inq.status}
                        onValueChange={(val) => updateStatus(inq.id, val)}
                        disabled={updatingId === inq.id}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(inq.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Textarea
                        placeholder="Add notes..."
                        value={inq.admin_notes || ""}
                        onChange={(e) =>
                          setInquiries((prev) =>
                            prev.map((i) =>
                              i.id === inq.id ? { ...i, admin_notes: e.target.value } : i
                            )
                          )
                        }
                        onBlur={(e) => updateNotes(inq.id, e.target.value)}
                        className="min-w-[150px] min-h-[60px] text-xs"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminQuotationsSection;
