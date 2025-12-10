import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Server, 
  Zap, 
  Database, 
  Key, 
  Clock, 
  Mail, 
  Timer, 
  CreditCard, 
  CheckCircle, 
  Gavel, 
  Users, 
  FolderOpen, 
  Phone,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  BookOpen,
  RefreshCw,
  Download,
  Sparkles,
  Plus,
  Calendar,
  Rocket,
  Bug,
  Wrench,
  AlertCircle
} from "lucide-react";
import { platformManual, searchManual, getAllTags, ManualSection, ManualArticle } from "@/data/platformManual";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
// jsPDF is dynamically imported to avoid React bundling conflicts

const iconMap: Record<string, React.ReactNode> = {
  Server: <Server className="h-4 w-4" />,
  Zap: <Zap className="h-4 w-4" />,
  Database: <Database className="h-4 w-4" />,
  Key: <Key className="h-4 w-4" />,
  Clock: <Clock className="h-4 w-4" />,
  Mail: <Mail className="h-4 w-4" />,
  Timer: <Timer className="h-4 w-4" />,
  CreditCard: <CreditCard className="h-4 w-4" />,
  CheckCircle: <CheckCircle className="h-4 w-4" />,
  Gavel: <Gavel className="h-4 w-4" />,
  Users: <Users className="h-4 w-4" />,
  FolderOpen: <FolderOpen className="h-4 w-4" />,
  Phone: <Phone className="h-4 w-4" />,
  Sparkles: <Sparkles className="h-4 w-4" />,
};

const categoryIcons: Record<string, React.ReactNode> = {
  feature: <Rocket className="h-4 w-4 text-green-500" />,
  improvement: <Sparkles className="h-4 w-4 text-blue-500" />,
  bugfix: <Bug className="h-4 w-4 text-red-500" />,
  maintenance: <Wrench className="h-4 w-4 text-orange-500" />,
  security: <AlertCircle className="h-4 w-4 text-purple-500" />,
};

interface LiveStats {
  tableCount: number;
  creatorCount: number;
  brandCount: number;
  bookingCount: number;
  lastBackup: string | null;
}

interface ChangelogEntry {
  id: string;
  version: string;
  title: string;
  description: string;
  category: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
}

const AdminPlatformManualTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<ManualArticle | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<"all" | "technical" | "operational">("all");
  const [activeView, setActiveView] = useState<"manual" | "changelog">("manual");
  const [liveStats, setLiveStats] = useState<LiveStats>({
    tableCount: 27,
    creatorCount: 0,
    brandCount: 0,
    bookingCount: 0,
    lastBackup: null,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);
  
  // Changelog state
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);
  const [loadingChangelog, setLoadingChangelog] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newEntry, setNewEntry] = useState({
    version: "",
    title: "",
    description: "",
    category: "feature",
    is_published: false,
  });
  const [savingEntry, setSavingEntry] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    fetchLiveStats();
    fetchChangelog();
  }, []);

  const fetchLiveStats = async () => {
    setLoadingStats(true);
    try {
      const [creatorsRes, brandsRes, bookingsRes, backupRes] = await Promise.all([
        supabase.from("creator_profiles").select("id", { count: "exact", head: true }),
        supabase.from("brand_profiles").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id", { count: "exact", head: true }),
        supabase.from("backup_history").select("created_at").order("created_at", { ascending: false }).limit(1).single(),
      ]);

      setLiveStats({
        tableCount: 27,
        creatorCount: creatorsRes.count || 0,
        brandCount: brandsRes.count || 0,
        bookingCount: bookingsRes.count || 0,
        lastBackup: backupRes.data?.created_at || null,
      });
    } catch (error) {
      console.error("Error fetching live stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchChangelog = async () => {
    setLoadingChangelog(true);
    try {
      const { data, error } = await supabase
        .from("platform_changelog")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setChangelog(data || []);
    } catch (error) {
      console.error("Error fetching changelog:", error);
    } finally {
      setLoadingChangelog(false);
    }
  };

  const handleAddEntry = async () => {
    if (!newEntry.version || !newEntry.title || !newEntry.description) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSavingEntry(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("platform_changelog").insert({
        version: newEntry.version,
        title: newEntry.title,
        description: newEntry.description,
        category: newEntry.category,
        is_published: newEntry.is_published,
        published_at: newEntry.is_published ? new Date().toISOString() : null,
        created_by: userData.user?.id,
      });

      if (error) throw error;

      toast({
        title: "Entry added",
        description: "Changelog entry has been saved successfully",
      });

      setNewEntry({
        version: "",
        title: "",
        description: "",
        category: "feature",
        is_published: false,
      });
      setShowAddDialog(false);
      fetchChangelog();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingEntry(false);
    }
  };

  const togglePublish = async (entry: ChangelogEntry) => {
    try {
      const { error } = await supabase
        .from("platform_changelog")
        .update({
          is_published: !entry.is_published,
          published_at: !entry.is_published ? new Date().toISOString() : null,
        })
        .eq("id", entry.id);

      if (error) throw error;
      
      toast({
        title: entry.is_published ? "Unpublished" : "Published",
        description: `Entry "${entry.title}" has been ${entry.is_published ? 'unpublished' : 'published'}`,
      });
      
      fetchChangelog();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from("platform_changelog")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      toast({
        title: "Deleted",
        description: "Changelog entry has been deleted",
      });
      
      fetchChangelog();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const exportToPdf = async () => {
    setExportingPdf(true);
    try {
      const jsPDF = (await import("jspdf")).default;
      const doc = new jsPDF();
      let yPos = 20;
      const pageHeight = 280;
      const margin = 20;
      const lineHeight = 7;

      // Title
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("CollabHunts Platform Manual", margin, yPos);
      yPos += 15;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, margin, yPos);
      yPos += 20;

      // Live Stats
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Platform Statistics", margin, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`• Database Tables: ${liveStats.tableCount}`, margin, yPos);
      yPos += lineHeight;
      doc.text(`• Total Creators: ${liveStats.creatorCount}`, margin, yPos);
      yPos += lineHeight;
      doc.text(`• Total Brands: ${liveStats.brandCount}`, margin, yPos);
      yPos += lineHeight;
      doc.text(`• Total Bookings: ${liveStats.bookingCount}`, margin, yPos);
      yPos += lineHeight;
      doc.text(`• Last Backup: ${liveStats.lastBackup ? new Date(liveStats.lastBackup).toLocaleDateString() : 'N/A'}`, margin, yPos);
      yPos += 20;

      // Sections
      for (const section of platformManual) {
        // Check for page break
        if (yPos > pageHeight - 40) {
          doc.addPage();
          yPos = 20;
        }

        // Section title
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(`${section.title} (${section.category})`, margin, yPos);
        yPos += 12;

        for (const article of section.articles) {
          // Check for page break
          if (yPos > pageHeight - 40) {
            doc.addPage();
            yPos = 20;
          }

          // Article title
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text(article.title, margin + 5, yPos);
          yPos += 8;

          // Article content (simplified - strip markdown)
          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          
          const cleanContent = article.content
            .replace(/#{1,3}\s/g, '')
            .replace(/\*\*/g, '')
            .replace(/`{1,3}/g, '')
            .replace(/\|/g, ' ')
            .replace(/-{3,}/g, '');

          const lines = doc.splitTextToSize(cleanContent, 170);
          
          for (const line of lines) {
            if (yPos > pageHeight - 10) {
              doc.addPage();
              yPos = 20;
            }
            doc.text(line, margin + 5, yPos);
            yPos += 5;
          }
          
          yPos += 10;
        }
        
        yPos += 10;
      }

      // Changelog section
      if (changelog.length > 0) {
        doc.addPage();
        yPos = 20;

        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("What's New / Changelog", margin, yPos);
        yPos += 15;

        for (const entry of changelog.filter(e => e.is_published)) {
          if (yPos > pageHeight - 30) {
            doc.addPage();
            yPos = 20;
          }

          doc.setFontSize(11);
          doc.setFont("helvetica", "bold");
          doc.text(`v${entry.version} - ${entry.title}`, margin, yPos);
          yPos += 7;

          doc.setFontSize(9);
          doc.setFont("helvetica", "normal");
          doc.text(`Category: ${entry.category} | Published: ${entry.published_at ? new Date(entry.published_at).toLocaleDateString() : 'N/A'}`, margin, yPos);
          yPos += 7;

          const descLines = doc.splitTextToSize(entry.description, 170);
          for (const line of descLines) {
            if (yPos > pageHeight - 10) {
              doc.addPage();
              yPos = 20;
            }
            doc.text(line, margin, yPos);
            yPos += 5;
          }
          
          yPos += 10;
        }
      }

      doc.save(`CollabHunts-Manual-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "PDF Exported",
        description: "Platform manual has been downloaded",
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Export failed",
        description: "Could not generate PDF",
        variant: "destructive",
      });
    } finally {
      setExportingPdf(false);
    }
  };

  const searchResults = searchQuery.length >= 2 ? searchManual(searchQuery) : [];
  const allTags = getAllTags();

  const filteredSections = platformManual.filter(section => 
    activeCategory === "all" || section.category === activeCategory
  );

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const renderMarkdown = (content: string) => {
    return content
      .split('\n')
      .map((line, i) => {
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-xl font-bold mt-6 mb-3 text-foreground">{line.replace('## ', '')}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={i} className="text-lg font-semibold mt-4 mb-2 text-foreground">{line.replace('### ', '')}</h3>;
        }
        if (line.startsWith('```')) {
          return null;
        }
        if (line.startsWith('|')) {
          const cells = line.split('|').filter(c => c.trim());
          if (line.includes('---')) return null;
          return (
            <div key={i} className="flex border-b border-border">
              {cells.map((cell, j) => (
                <div key={j} className={`flex-1 px-3 py-2 text-sm ${j === 0 ? 'font-medium' : ''}`}>
                  {cell.trim()}
                </div>
              ))}
            </div>
          );
        }
        if (line.includes('**')) {
          const parts = line.split(/\*\*(.*?)\*\*/g);
          return (
            <p key={i} className="mb-2 text-muted-foreground">
              {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-foreground">{part}</strong> : part)}
            </p>
          );
        }
        if (line.trim()) {
          return <p key={i} className="mb-2 text-muted-foreground">{line}</p>;
        }
        return null;
      });
  };

  return (
    <div className="space-y-6">
      {/* Header with Live Stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            Platform Operations Manual
          </h2>
          <p className="text-muted-foreground">
            Complete documentation for CollabHunts platform operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchLiveStats} disabled={loadingStats}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loadingStats ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportToPdf} disabled={exportingPdf}>
            <Download className={`h-4 w-4 mr-2 ${exportingPdf ? 'animate-pulse' : ''}`} />
            {exportingPdf ? 'Exporting...' : 'Export PDF'}
          </Button>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={activeView === "manual" ? "default" : "outline"}
          onClick={() => setActiveView("manual")}
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Documentation
        </Button>
        <Button
          variant={activeView === "changelog" ? "default" : "outline"}
          onClick={() => setActiveView("changelog")}
        >
          <Sparkles className="h-4 w-4 mr-2" />
          What's New
          {changelog.filter(e => e.is_published).length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {changelog.filter(e => e.is_published).length}
            </Badge>
          )}
        </Button>
      </div>

      {activeView === "changelog" ? (
        /* Changelog View */
        <div className="space-y-6">
          {/* Add Entry Button */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Platform Changelog</h3>
              <p className="text-sm text-muted-foreground">Track and publish feature updates</p>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Changelog Entry</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Version</label>
                      <Input
                        placeholder="e.g. 2.1.0"
                        value={newEntry.version}
                        onChange={(e) => setNewEntry({ ...newEntry, version: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <Select
                        value={newEntry.category}
                        onValueChange={(v) => setNewEntry({ ...newEntry, category: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="feature">Feature</SelectItem>
                          <SelectItem value="improvement">Improvement</SelectItem>
                          <SelectItem value="bugfix">Bug Fix</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      placeholder="Brief title for this update"
                      value={newEntry.title}
                      onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      placeholder="Describe what changed and why it matters..."
                      rows={4}
                      value={newEntry.description}
                      onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={newEntry.is_published}
                        onCheckedChange={(checked) => setNewEntry({ ...newEntry, is_published: checked })}
                      />
                      <label className="text-sm">Publish immediately</label>
                    </div>
                    <Button onClick={handleAddEntry} disabled={savingEntry}>
                      {savingEntry ? "Saving..." : "Save Entry"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Changelog List */}
          {loadingChangelog ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : changelog.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No changelog entries yet</p>
                <p className="text-sm text-muted-foreground">Add your first entry to track platform updates</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {changelog.map((entry) => (
                <Card key={entry.id} className={!entry.is_published ? "opacity-60" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {categoryIcons[entry.category] || <Sparkles className="h-4 w-4" />}
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            v{entry.version} - {entry.title}
                            {!entry.is_published && (
                              <Badge variant="outline">Draft</Badge>
                            )}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs capitalize">
                              {entry.category}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {entry.published_at 
                                ? new Date(entry.published_at).toLocaleDateString()
                                : new Date(entry.created_at).toLocaleDateString()
                              }
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => togglePublish(entry)}
                        >
                          {entry.is_published ? "Unpublish" : "Publish"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteEntry(entry.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap">{entry.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Documentation View */
        <>
          {/* Live Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{liveStats.tableCount}</div>
                <p className="text-xs text-muted-foreground">Database Tables</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{liveStats.creatorCount}</div>
                <p className="text-xs text-muted-foreground">Total Creators</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{liveStats.brandCount}</div>
                <p className="text-xs text-muted-foreground">Total Brands</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{liveStats.bookingCount}</div>
                <p className="text-xs text-muted-foreground">Total Bookings</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-sm">
                  {liveStats.lastBackup 
                    ? new Date(liveStats.lastBackup).toLocaleDateString()
                    : 'N/A'
                  }
                </div>
                <p className="text-xs text-muted-foreground">Last Backup</p>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={activeCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory("all")}
              >
                All
              </Button>
              <Button
                variant={activeCategory === "technical" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory("technical")}
              >
                Technical
              </Button>
              <Button
                variant={activeCategory === "operational" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory("operational")}
              >
                Operational
              </Button>
            </div>
          </div>

          {/* Search Results */}
          {searchQuery.length >= 2 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Search Results ({searchResults.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {searchResults.length === 0 ? (
                  <p className="text-muted-foreground">No results found for "{searchQuery}"</p>
                ) : (
                  <div className="space-y-2">
                    {searchResults.map((article) => (
                      <button
                        key={article.id}
                        onClick={() => {
                          setSelectedArticle(article);
                          setSearchQuery("");
                        }}
                        className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <div className="font-medium">{article.title}</div>
                        <div className="flex gap-1 mt-1">
                          {article.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Main Content */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Sidebar - Sections */}
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Sections</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="p-4 space-y-1">
                    {filteredSections.map((section) => (
                      <Collapsible
                        key={section.id}
                        open={expandedSections.includes(section.id)}
                        onOpenChange={() => toggleSection(section.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors text-left">
                            <span className="flex items-center gap-2">
                              {iconMap[section.icon]}
                              <span className="font-medium">{section.title}</span>
                            </span>
                            {expandedSections.includes(section.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="ml-6 space-y-1 pb-2">
                            {section.articles.map((article) => (
                              <button
                                key={article.id}
                                onClick={() => setSelectedArticle(article)}
                                className={`w-full text-left p-2 rounded text-sm hover:bg-accent transition-colors ${
                                  selectedArticle?.id === article.id ? 'bg-accent' : ''
                                }`}
                              >
                                {article.title}
                              </button>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Main Content - Article View */}
            <Card className="md:col-span-2">
              <CardContent className="p-0">
                <ScrollArea className="h-[650px]">
                  {selectedArticle ? (
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className="text-2xl font-bold">{selectedArticle.title}</h2>
                          <p className="text-sm text-muted-foreground">
                            Last updated: {selectedArticle.lastUpdated}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(selectedArticle.content)}
                        >
                          {copiedText === selectedArticle.content ? (
                            <Check className="h-4 w-4 mr-1" />
                          ) : (
                            <Copy className="h-4 w-4 mr-1" />
                          )}
                          Copy
                        </Button>
                      </div>
                      
                      <div className="flex gap-1 mb-6">
                        {selectedArticle.tags.map(tag => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="prose prose-sm max-w-none">
                        {renderMarkdown(selectedArticle.content)}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Select an article to view</p>
                      <p className="text-sm">Browse sections on the left or use search above</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Quick Reference Tags */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Quick Reference Tags</CardTitle>
              <CardDescription>Click a tag to find related articles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => setSearchQuery(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminPlatformManualTab;
