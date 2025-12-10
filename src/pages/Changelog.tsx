import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, History, ChevronDown, ChevronUp } from "lucide-react";
import { 
  getArchivedUpdates, 
  getCategoryBadge,
  PlatformUpdate 
} from "@/data/knowledgeBase";

const Changelog = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'creator' | 'brand' | null>(null);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [selectedUpdate, setSelectedUpdate] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      const [creatorResult, brandResult] = await Promise.all([
        supabase.from("creator_profiles").select("id").eq("user_id", session.user.id).maybeSingle(),
        supabase.from("brand_profiles").select("id").eq("user_id", session.user.id).maybeSingle()
      ]);

      if (creatorResult.data) {
        setUserRole('creator');
      } else if (brandResult.data) {
        setUserRole('brand');
      }

      setLoading(false);
    };
    checkAuthAndRole();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const archivedUpdates = getArchivedUpdates(userRole);

  // Group updates by month
  const groupedUpdates = archivedUpdates.reduce((acc, update) => {
    const monthYear = update.publishedAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(update);
    return acc;
  }, {} as Record<string, PlatformUpdate[]>);

  const toggleMonth = (month: string) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(month)) {
      newExpanded.delete(month);
    } else {
      newExpanded.add(month);
    }
    setExpandedMonths(newExpanded);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-muted/50 via-muted/30 to-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Link 
              to="/knowledge-base/whats-new" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to What's New
            </Link>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center">
                <History className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-heading font-bold">
                  Changelog Archive
                </h1>
                <p className="text-muted-foreground">
                  All platform updates older than 30 days
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          {Object.keys(groupedUpdates).length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No archived updates yet.</p>
              <Link to="/knowledge-base/whats-new" className="text-primary hover:underline mt-2 inline-block">
                View recent updates
              </Link>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedUpdates).map(([monthYear, updates]) => {
                const isExpanded = expandedMonths.has(monthYear);
                
                return (
                  <div key={monthYear} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleMonth(monthYear)}
                      className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <h2 className="font-heading font-semibold text-lg">{monthYear}</h2>
                        <Badge variant="secondary">{updates.length} update{updates.length !== 1 ? 's' : ''}</Badge>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    
                    {isExpanded && (
                      <div className="divide-y">
                        {updates.map((update) => {
                          const Icon = update.icon;
                          const badge = getCategoryBadge(update.category);
                          const isSelected = selectedUpdate === update.id;
                          
                          return (
                            <div 
                              key={update.id}
                              className="p-4 hover:bg-muted/20 transition-colors"
                            >
                              <div 
                                className="flex items-start gap-4 cursor-pointer"
                                onClick={() => setSelectedUpdate(isSelected ? null : update.id)}
                              >
                                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
                                  <Icon className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 flex-wrap mb-1">
                                    <Badge className={badge.color}>{badge.label}</Badge>
                                    <span className="text-sm text-muted-foreground">
                                      {update.publishedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                  </div>
                                  <h3 className="font-medium">
                                    {update.title}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">
                                    {update.description}
                                  </p>
                                </div>
                              </div>
                              
                              {isSelected && (
                                <div className="mt-4 ml-14 pl-4 border-l-2 border-muted">
                                  <div 
                                    className="prose prose-sm max-w-none
                                      prose-headings:font-heading prose-headings:font-semibold
                                      prose-h2:text-lg prose-h2:mt-4 prose-h2:mb-2
                                      prose-h3:text-base prose-h3:mt-3 prose-h3:mb-1
                                      prose-p:text-muted-foreground prose-p:leading-relaxed
                                      prose-ul:my-2 prose-li:text-muted-foreground prose-li:text-sm
                                      prose-strong:text-foreground
                                    "
                                    dangerouslySetInnerHTML={{ __html: update.content }}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Changelog;
