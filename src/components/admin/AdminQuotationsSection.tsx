import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, FileText, Building2, Globe, MapPin, Users, ChevronDown, ChevronUp, DollarSign, Tag, Briefcase, CheckCircle, XCircle, Calendar, ShieldCheck } from "lucide-react";

interface BrandDetails {
  company_name: string;
  phone_number: string | null;
  first_name: string | null;
  last_name: string | null;
  industry: string | null;
  email?: string;
  company_size: string | null;
  contact_position: string | null;
  website_url: string | null;
  monthly_budget_range: string | null;
  marketing_intent: string | null;
  venue_name: string | null;
  venue_type: string | null;
  venue_address: string | null;
  venue_city: string | null;
  location_country: string | null;
  venue_capacity: number | null;
  parking_available: boolean | null;
  accessibility_info: string | null;
  amenities: string[] | null;
  preferred_platforms: string[] | null;
  preferred_categories: string[] | null;
  brand_plan: string | null;
  verification_status: string | null;
  phone_verified: boolean | null;
  created_at: string | null;
  logo_url: string | null;
}

interface QuotationInquiry {
  id: string;
  plan_type: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  brand_profile_id: string;
  brand?: BrandDetails;
}

const DetailItem = ({ icon: Icon, label, value }: { icon?: any; label: string; value: React.ReactNode }) => {
  if (!value && value !== false) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      {Icon && <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />}
      <div>
        <span className="text-muted-foreground">{label}:</span>{" "}
        <span className="font-medium">{typeof value === "boolean" ? (value ? "Yes" : "No") : value}</span>
      </div>
    </div>
  );
};

const BrandExpandedDetails = ({ brand }: { brand: BrandDetails }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 bg-muted/30 rounded-lg">
    {/* Contact Info */}
    <div className="space-y-2">
      <h4 className="font-semibold text-sm flex items-center gap-1.5"><Phone className="h-4 w-4 text-primary" /> Contact</h4>
      <DetailItem label="Name" value={[brand.first_name, brand.last_name].filter(Boolean).join(" ") || null} />
      <DetailItem label="Position" value={brand.contact_position} icon={Briefcase} />
      {brand.phone_number && (
        <DetailItem label="Phone" value={<a href={`tel:${brand.phone_number}`} className="text-primary hover:underline">{brand.phone_number}</a>} icon={Phone} />
      )}
      {brand.email && (
        <DetailItem label="Email" value={<a href={`mailto:${brand.email}`} className="text-primary hover:underline">{brand.email}</a>} icon={Mail} />
      )}
    </div>

    {/* Company Info */}
    <div className="space-y-2">
      <h4 className="font-semibold text-sm flex items-center gap-1.5"><Building2 className="h-4 w-4 text-primary" /> Company</h4>
      <DetailItem label="Company" value={brand.company_name} />
      <DetailItem label="Industry" value={brand.industry} icon={Tag} />
      <DetailItem label="Size" value={brand.company_size} icon={Users} />
      {brand.website_url && (
        <DetailItem label="Website" value={<a href={brand.website_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{brand.website_url}</a>} icon={Globe} />
      )}
      <DetailItem label="Budget" value={brand.monthly_budget_range} icon={DollarSign} />
      <DetailItem label="Intent" value={brand.marketing_intent} />
    </div>

    {/* Venue/Location */}
    <div className="space-y-2">
      <h4 className="font-semibold text-sm flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" /> Venue / Location</h4>
      <DetailItem label="Venue" value={brand.venue_name} />
      <DetailItem label="Type" value={brand.venue_type} />
      <DetailItem label="Address" value={[brand.venue_address, brand.venue_city, brand.location_country].filter(Boolean).join(", ") || null} icon={MapPin} />
      <DetailItem label="Capacity" value={brand.venue_capacity} icon={Users} />
      <DetailItem label="Parking" value={brand.parking_available} />
      <DetailItem label="Accessibility" value={brand.accessibility_info} />
      {brand.amenities && brand.amenities.length > 0 && (
        <DetailItem label="Amenities" value={brand.amenities.join(", ")} />
      )}
    </div>

    {/* Preferences */}
    <div className="space-y-2">
      <h4 className="font-semibold text-sm flex items-center gap-1.5"><Tag className="h-4 w-4 text-primary" /> Preferences</h4>
      {brand.preferred_platforms && brand.preferred_platforms.length > 0 && (
        <DetailItem label="Platforms" value={brand.preferred_platforms.join(", ")} />
      )}
      {brand.preferred_categories && brand.preferred_categories.length > 0 && (
        <DetailItem label="Categories" value={brand.preferred_categories.join(", ")} />
      )}
    </div>

    {/* Account Info */}
    <div className="space-y-2">
      <h4 className="font-semibold text-sm flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-primary" /> Account</h4>
      <DetailItem label="Plan" value={brand.brand_plan ? <Badge variant="outline" className="capitalize">{brand.brand_plan}</Badge> : null} />
      <DetailItem label="Verified" value={brand.verification_status} />
      <DetailItem label="Phone verified" value={brand.phone_verified} icon={brand.phone_verified ? CheckCircle : XCircle} />
      {brand.created_at && (
        <DetailItem label="Joined" value={new Date(brand.created_at).toLocaleDateString()} icon={Calendar} />
      )}
    </div>
  </div>
);

const AdminQuotationsSection = () => {
  const [inquiries, setInquiries] = useState<QuotationInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
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
      if (!data || data.length === 0) { setInquiries([]); return; }

      const brandIds = [...new Set(data.map((d) => d.brand_profile_id))];
      const { data: brands } = await supabase
        .from("brand_profiles")
        .select("*")
        .in("id", brandIds);

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
                company_size: brand.company_size,
                contact_position: brand.contact_position,
                website_url: brand.website_url,
                monthly_budget_range: brand.monthly_budget_range,
                marketing_intent: brand.marketing_intent,
                venue_name: brand.venue_name,
                venue_type: brand.venue_type,
                venue_address: brand.venue_address,
                venue_city: brand.venue_city,
                location_country: brand.location_country,
                venue_capacity: brand.venue_capacity,
                parking_available: brand.parking_available,
                accessibility_info: brand.accessibility_info,
                amenities: brand.amenities,
                preferred_platforms: brand.preferred_platforms,
                preferred_categories: brand.preferred_categories,
                brand_plan: brand.brand_plan,
                verification_status: brand.verification_status,
                phone_verified: brand.phone_verified,
                created_at: brand.created_at,
                logo_url: brand.logo_url,
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
      setInquiries((prev) => prev.map((inq) => (inq.id === id ? { ...inq, status: newStatus } : inq)));
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
      setInquiries((prev) => prev.map((inq) => (inq.id === id ? { ...inq, admin_notes: notes } : inq)));
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
              Brands requesting pricing for Basic/Pro plans ({inquiries.length} total) — click a row to see full details
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
          <div className="text-center py-8 text-muted-foreground">No quotation inquiries yet</div>
        ) : (
          <div className="overflow-x-auto -mx-4 md:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
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
                  <>
                    <TableRow
                      key={inq.id}
                      className="cursor-pointer"
                      onClick={() => setExpandedId(expandedId === inq.id ? null : inq.id)}
                    >
                      <TableCell className="px-2">
                        {expandedId === inq.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{inq.brand?.company_name || "Unknown"}</p>
                          <p className="text-xs text-muted-foreground">{inq.brand?.first_name} {inq.brand?.last_name}</p>
                          {inq.brand?.industry && <p className="text-xs text-muted-foreground">{inq.brand.industry}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {inq.brand?.phone_number && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              <a href={`tel:${inq.brand.phone_number}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                                {inq.brand.phone_number}
                              </a>
                            </div>
                          )}
                          {inq.brand?.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              <a href={`mailto:${inq.brand.email}`} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                                {inq.brand.email}
                              </a>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{inq.plan_type}</Badge>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Select value={inq.status} onValueChange={(val) => updateStatus(inq.id, val)} disabled={updatingId === inq.id}>
                          <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-sm">{new Date(inq.created_at).toLocaleDateString()}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Textarea
                          placeholder="Add notes..."
                          value={inq.admin_notes || ""}
                          onChange={(e) =>
                            setInquiries((prev) => prev.map((i) => (i.id === inq.id ? { ...i, admin_notes: e.target.value } : i)))
                          }
                          onBlur={(e) => updateNotes(inq.id, e.target.value)}
                          className="min-w-[150px] min-h-[60px] text-xs"
                        />
                      </TableCell>
                    </TableRow>
                    {expandedId === inq.id && inq.brand && (
                      <TableRow key={`${inq.id}-details`}>
                        <TableCell colSpan={7} className="p-2">
                          <BrandExpandedDetails brand={inq.brand} />
                        </TableCell>
                      </TableRow>
                    )}
                  </>
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
