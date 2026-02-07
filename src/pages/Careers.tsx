import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, MapPin, Clock, ChevronDown, ChevronUp, Upload, Loader2 } from "lucide-react";

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
  created_at: string;
}

const Careers = () => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [applyingTo, setApplyingTo] = useState<Position | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [cvFile, setCvFile] = useState<File | null>(null);

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    const { data, error } = await supabase
      .from("career_positions")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (!error && data) setPositions(data);
    setLoading(false);
  };

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setLinkedinUrl("");
    setPortfolioUrl("");
    setCoverLetter("");
    setCvFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingTo || !cvFile) return;

    if (!fullName.trim() || !email.trim()) {
      toast({ title: "Please fill in required fields", variant: "destructive" });
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (cvFile.size > maxSize) {
      toast({ title: "CV file must be under 10MB", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      // Upload CV
      const fileExt = cvFile.name.split(".").pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("career-cvs")
        .upload(filePath, cvFile);

      if (uploadError) throw uploadError;

      // Insert application
      const { error: insertError } = await supabase
        .from("career_applications")
        .insert({
          position_id: applyingTo.id,
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          cover_letter: coverLetter.trim() || null,
          cv_url: filePath,
          linkedin_url: linkedinUrl.trim() || null,
          portfolio_url: portfolioUrl.trim() || null,
        });

      if (insertError) throw insertError;

      // Send email notification
      try {
        await supabase.functions.invoke("send-career-application-email", {
          body: {
            candidateName: fullName.trim(),
            candidateEmail: email.trim(),
            candidatePhone: phone.trim() || null,
            positionTitle: applyingTo.title,
            coverLetter: coverLetter.trim() || null,
            linkedinUrl: linkedinUrl.trim() || null,
            portfolioUrl: portfolioUrl.trim() || null,
            cvFileName: cvFile.name,
          },
        });
      } catch {
        // Email failure shouldn't block the application
      }

      toast({ title: "Application submitted!", description: "We'll review your application and get back to you." });
      setApplyingTo(null);
      resetForm();
    } catch (error: any) {
      toast({ title: "Error submitting application", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">Join Our Team</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We're building the future of creator-brand collaborations. Explore open positions and become part of something extraordinary.
          </p>
        </div>

        {/* Positions */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : positions.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No open positions right now</h2>
              <p className="text-muted-foreground">Check back later — we're always growing!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 max-w-3xl mx-auto">
            {positions.map((pos) => (
              <Card key={pos.id} className="overflow-hidden">
                <CardHeader
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setExpandedId(expandedId === pos.id ? null : pos.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{pos.title}</CardTitle>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {pos.department && (
                          <Badge variant="secondary">{pos.department}</Badge>
                        )}
                        {pos.location && (
                          <Badge variant="outline" className="gap-1">
                            <MapPin className="h-3 w-3" />
                            {pos.location}
                          </Badge>
                        )}
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          {pos.employment_type}
                        </Badge>
                        {pos.salary_range && (
                          <Badge variant="outline">{pos.salary_range}</Badge>
                        )}
                      </div>
                    </div>
                    {expandedId === pos.id ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                  </div>
                </CardHeader>

                {expandedId === pos.id && (
                  <CardContent className="border-t pt-4 space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{pos.description}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Requirements</h3>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{pos.requirements}</p>
                    </div>
                    {pos.responsibilities && (
                      <div>
                        <h3 className="font-semibold mb-2">Responsibilities</h3>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{pos.responsibilities}</p>
                      </div>
                    )}
                    <Button onClick={() => setApplyingTo(pos)} className="w-full sm:w-auto">
                      Apply Now
                    </Button>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Application Dialog */}
      <Dialog open={!!applyingTo} onOpenChange={(open) => { if (!open) { setApplyingTo(null); resetForm(); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply for {applyingTo?.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Full Name *</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <Label>Email *</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label>LinkedIn URL</Label>
              <Input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="https://linkedin.com/in/..." />
            </div>
            <div>
              <Label>Portfolio URL</Label>
              <Input value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label>Cover Letter</Label>
              <Textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows={4} placeholder="Tell us why you're a great fit..." />
            </div>
            <div>
              <Label>Upload CV * (PDF, DOC, DOCX — max 10MB)</Label>
              <div className="mt-1">
                <label className="flex items-center gap-2 cursor-pointer border border-dashed rounded-md p-4 hover:bg-muted/50 transition-colors">
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {cvFile ? cvFile.name : "Click to select file"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>
            <Button type="submit" disabled={submitting || !cvFile} className="w-full">
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting...</> : "Submit Application"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Careers;
