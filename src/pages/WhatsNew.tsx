import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Sparkles, Rocket, Bug, Wrench, AlertCircle, Calendar } from "lucide-react";

const categoryIcons: Record<string, React.ReactNode> = {
  feature: <Rocket className="h-5 w-5 text-green-500" />,
  improvement: <Sparkles className="h-5 w-5 text-blue-500" />,
  bugfix: <Bug className="h-5 w-5 text-red-500" />,
  maintenance: <Wrench className="h-5 w-5 text-orange-500" />,
  security: <AlertCircle className="h-5 w-5 text-purple-500" />,
};

const categoryColors: Record<string, string> = {
  feature: "bg-green-500/10 text-green-600 border-green-500/20",
  improvement: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  bugfix: "bg-red-500/10 text-red-600 border-red-500/20",
  maintenance: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  security: "bg-purple-500/10 text-purple-600 border-purple-500/20",
};

interface ChangelogEntry {
  id: string;
  version: string;
  title: string;
  description: string;
  category: string;
  published_at: string | null;
}

const WhatsNew = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isKnowledgeBasePath = location.pathname.includes("/knowledge-base");
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      setIsAuthenticated(true);
      fetchEntries();
      localStorage.setItem("whats_new_last_visited", new Date().toISOString());
    };
    
    checkAuth();
  }, [navigate]);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from("platform_changelog")
        .select("id, version, title, description, category, published_at")
        .eq("is_published", true)
        .eq("is_public", true)
        .order("published_at", { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error("Error fetching changelog:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {isKnowledgeBasePath && (
              <Link 
                to="/knowledge-base" 
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Knowledge Base
              </Link>
            )}
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-heading font-bold">
                  What's New
                </h1>
                <p className="text-muted-foreground">
                  Latest features, improvements, and updates to CollabHunts
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/4 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Sparkles className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">No updates yet</h2>
                <p className="text-muted-foreground">Check back soon for platform updates!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {entries.map((entry) => (
                <Card key={entry.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {categoryIcons[entry.category] || <Sparkles className="h-5 w-5" />}
                        <div>
                          <CardTitle className="text-xl">
                            v{entry.version} — {entry.title}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-3 mt-2">
                            <Badge 
                              variant="outline" 
                              className={`capitalize ${categoryColors[entry.category] || ""}`}
                            >
                              {entry.category}
                            </Badge>
                            <span className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3.5 w-3.5" />
                              {entry.published_at 
                                ? new Date(entry.published_at).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric"
                                  })
                                : "Recently"
                              }
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {entry.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WhatsNew;
