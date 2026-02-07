import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Eye, Download, Loader2 } from "lucide-react";

interface Position {
  id: string;
  title: string;
  department: string | null;
  location: string | null;
  employment_type: string;
  description: string;
  requirements: string;
  responsibilities: string | null;
  salary_range: string | null;
  is_active: boolean;
  created_at: string;
}

interface Application {
  id: string;
  position_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  cover_letter: string | null;
  cv_url: string;
  linkedin_url: string | null;
  portfolio_url: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  career_positions?: { title: string } | null;
}

const emptyPosition = {
  title: "",
  department: "",
  location: "",
  employment_type: "Full-time",
  description: "",
  requirements: "",
  responsibilities: "",
  salary_range: "",
};

const AdminCareersTab = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPosition, setEditingPosition] = useState<Partial<Position> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [viewingApp, setViewingApp] = useState<Application | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [posRes, appRes] = await Promise.all([
      supabase.from("career_positions").select("*").order("created_at", { ascending: false }),
      supabase.from("career_applications").select("*, career_positions(title)").order("created_at", { ascending: false }),
    ]);
    if (posRes.data) setPositions(posRes.data);
    if (appRes.data) setApplications(appRes.data as Application[]);
    setLoading(false);
  };

  const handleSavePosition = async () => {
    if (!editingPosition?.title?.trim() || !editingPosition?.description?.trim() || !editingPosition?.requirements?.trim()) {
      toast({ title: "Title, description, and requirements are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: editingPosition.title.trim(),
        department: editingPosition.department?.trim() || null,
        location: editingPosition.location?.trim() || null,
        employment_type: editingPosition.employment_type || "Full-time",
        description: editingPosition.description.trim(),
        requirements: editingPosition.requirements.trim(),
        responsibilities: editingPosition.responsibilities?.trim() || null,
        salary_range: editingPosition.salary_range?.trim() || null,
      };

      if (editingPosition.id) {
        const { error } = await supabase.from("career_positions").update(payload).eq("id", editingPosition.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("career_positions").insert(payload);
        if (error) throw error;
      }

      toast({ title: editingPosition.id ? "Position updated" : "Position created" });
      setEditingPosition(null);
      setIsCreating(false);
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id: string, is_active: boolean) => {
    const { error } = await supabase.from("career_positions").update({ is_active: !is_active }).eq("id", id);
    if (!error) {
      setPositions((prev) => prev.map((p) => (p.id === id ? { ...p, is_active: !is_active } : p)));
    }
  };

  const deletePosition = async (id: string) => {
    if (!confirm("Delete this position and all its applications?")) return;
    const { error } = await supabase.from("career_positions").delete().eq("id", id);
    if (!error) fetchData();
  };

  const updateAppStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("career_applications").update({ status }).eq("id", id);
    if (!error) {
      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      if (viewingApp?.id === id) setViewingApp({ ...viewingApp, status });
      toast({ title: `Status updated to ${status}` });
    }
  };

  const updateAppNotes = async (id: string, notes: string) => {
    await supabase.from("career_applications").update({ admin_notes: notes }).eq("id", id);
  };

  const downloadCv = async (cvUrl: string, name: string) => {
    const { data, error } = await supabase.storage.from("career-cvs").download(cvUrl);
    if (error || !data) {
      toast({ title: "Error downloading CV", variant: "destructive" });
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}-CV.${cvUrl.split(".").pop()}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <Tabs defaultValue="positions" className="space-y-4">
      <TabsList>
        <TabsTrigger value="positions">Positions ({positions.length})</TabsTrigger>
        <TabsTrigger value="applications">Applications ({applications.length})</TabsTrigger>
      </TabsList>

      {/* Positions Tab */}
      <TabsContent value="positions">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Job Positions</CardTitle>
              <CardDescription>Create and manage open positions</CardDescription>
            </div>
            <Button size="sm" onClick={() => { setEditingPosition(emptyPosition); setIsCreating(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Add Position
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden md:table-cell">Department</TableHead>
                  <TableHead className="hidden md:table-cell">Type</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Apps</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((pos) => {
                  const appCount = applications.filter((a) => a.position_id === pos.id).length;
                  return (
                    <TableRow key={pos.id}>
                      <TableCell className="font-medium">{pos.title}</TableCell>
                      <TableCell className="hidden md:table-cell">{pos.department || "—"}</TableCell>
                      <TableCell className="hidden md:table-cell">{pos.employment_type}</TableCell>
                      <TableCell>
                        <Switch checked={pos.is_active} onCheckedChange={() => toggleActive(pos.id, pos.is_active)} />
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{appCount}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setEditingPosition(pos); setIsCreating(false); }}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deletePosition(pos.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {positions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No positions yet</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Applications Tab */}
      <TabsContent value="applications">
        <Card>
          <CardHeader>
            <CardTitle>Applications</CardTitle>
            <CardDescription>Review candidate submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.full_name}</TableCell>
                    <TableCell className="hidden md:table-cell">{app.email}</TableCell>
                    <TableCell>{app.career_positions?.title || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={
                        app.status === "shortlisted" ? "default" :
                        app.status === "rejected" ? "destructive" :
                        app.status === "reviewed" ? "secondary" : "outline"
                      } className="capitalize">
                        {app.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{new Date(app.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setViewingApp(app)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => downloadCv(app.cv_url, app.full_name)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {applications.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No applications yet</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Position Edit/Create Dialog */}
      <Dialog open={!!editingPosition} onOpenChange={(open) => { if (!open) { setEditingPosition(null); setIsCreating(false); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreating ? "Create Position" : "Edit Position"}</DialogTitle>
          </DialogHeader>
          {editingPosition && (
            <div className="space-y-4">
              <div>
                <Label>Title *</Label>
                <Input value={editingPosition.title || ""} onChange={(e) => setEditingPosition({ ...editingPosition, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Department</Label>
                  <Input value={editingPosition.department || ""} onChange={(e) => setEditingPosition({ ...editingPosition, department: e.target.value })} />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input value={editingPosition.location || ""} onChange={(e) => setEditingPosition({ ...editingPosition, location: e.target.value })} placeholder="e.g. Remote, Beirut" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Employment Type</Label>
                  <Select value={editingPosition.employment_type || "Full-time"} onValueChange={(v) => setEditingPosition({ ...editingPosition, employment_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                      <SelectItem value="Freelance">Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Salary Range</Label>
                  <Input value={editingPosition.salary_range || ""} onChange={(e) => setEditingPosition({ ...editingPosition, salary_range: e.target.value })} placeholder="e.g. $50k-$70k" />
                </div>
              </div>
              <div>
                <Label>Description *</Label>
                <Textarea value={editingPosition.description || ""} onChange={(e) => setEditingPosition({ ...editingPosition, description: e.target.value })} rows={4} />
              </div>
              <div>
                <Label>Requirements *</Label>
                <Textarea value={editingPosition.requirements || ""} onChange={(e) => setEditingPosition({ ...editingPosition, requirements: e.target.value })} rows={4} />
              </div>
              <div>
                <Label>Responsibilities</Label>
                <Textarea value={editingPosition.responsibilities || ""} onChange={(e) => setEditingPosition({ ...editingPosition, responsibilities: e.target.value })} rows={3} />
              </div>
              <Button onClick={handleSavePosition} disabled={saving} className="w-full">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isCreating ? "Create Position" : "Save Changes"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Application Detail Dialog */}
      <Dialog open={!!viewingApp} onOpenChange={(open) => { if (!open) setViewingApp(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
          </DialogHeader>
          {viewingApp && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><Label>Name</Label><p className="font-medium">{viewingApp.full_name}</p></div>
                <div><Label>Email</Label><p>{viewingApp.email}</p></div>
                <div><Label>Phone</Label><p>{viewingApp.phone || "—"}</p></div>
                <div><Label>Position</Label><p>{viewingApp.career_positions?.title || "—"}</p></div>
                <div><Label>LinkedIn</Label>
                  {viewingApp.linkedin_url ? <a href={viewingApp.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary underline text-xs">View</a> : <p>—</p>}
                </div>
                <div><Label>Portfolio</Label>
                  {viewingApp.portfolio_url ? <a href={viewingApp.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-primary underline text-xs">View</a> : <p>—</p>}
                </div>
              </div>

              {viewingApp.cover_letter && (
                <div>
                  <Label>Cover Letter</Label>
                  <p className="text-sm text-muted-foreground whitespace-pre-line mt-1">{viewingApp.cover_letter}</p>
                </div>
              )}

              <div>
                <Label>CV</Label>
                <Button variant="outline" size="sm" className="mt-1" onClick={() => downloadCv(viewingApp.cv_url, viewingApp.full_name)}>
                  <Download className="h-4 w-4 mr-1" /> Download CV
                </Button>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={viewingApp.status} onValueChange={(v) => updateAppStatus(viewingApp.id, v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Admin Notes</Label>
                <Textarea
                  value={viewingApp.admin_notes || ""}
                  onChange={(e) => setViewingApp({ ...viewingApp, admin_notes: e.target.value })}
                  onBlur={() => updateAppNotes(viewingApp.id, viewingApp.admin_notes || "")}
                  rows={3}
                  placeholder="Internal notes..."
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Tabs>
  );
};

export default AdminCareersTab;
