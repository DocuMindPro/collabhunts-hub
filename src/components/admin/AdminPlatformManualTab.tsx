import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  RefreshCw
} from "lucide-react";
import { platformManual, searchManual, getAllTags, ManualSection, ManualArticle } from "@/data/platformManual";
import { supabase } from "@/integrations/supabase/client";

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
};

interface LiveStats {
  tableCount: number;
  creatorCount: number;
  brandCount: number;
  bookingCount: number;
  lastBackup: string | null;
}

const AdminPlatformManualTab = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<ManualArticle | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<"all" | "technical" | "operational">("all");
  const [liveStats, setLiveStats] = useState<LiveStats>({
    tableCount: 27,
    creatorCount: 0,
    brandCount: 0,
    bookingCount: 0,
    lastBackup: null,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchLiveStats();
  }, []);

  const fetchLiveStats = async () => {
    setLoadingStats(true);
    try {
      // Fetch counts
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
    // Simple markdown rendering
    return content
      .split('\n')
      .map((line, i) => {
        // Headers
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-xl font-bold mt-6 mb-3 text-foreground">{line.replace('## ', '')}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={i} className="text-lg font-semibold mt-4 mb-2 text-foreground">{line.replace('### ', '')}</h3>;
        }
        // Code blocks
        if (line.startsWith('```')) {
          return null; // Handled separately
        }
        // Tables
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
        // Bold
        if (line.includes('**')) {
          const parts = line.split(/\*\*(.*?)\*\*/g);
          return (
            <p key={i} className="mb-2 text-muted-foreground">
              {parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="text-foreground">{part}</strong> : part)}
            </p>
          );
        }
        // Regular paragraph
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
        <Button variant="outline" size="sm" onClick={fetchLiveStats} disabled={loadingStats}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loadingStats ? 'animate-spin' : ''}`} />
          Refresh Stats
        </Button>
      </div>

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
    </div>
  );
};

export default AdminPlatformManualTab;
