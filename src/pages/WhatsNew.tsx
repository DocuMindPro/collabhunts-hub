import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { 
  getRecentUpdates, 
  formatUpdateDate, 
  getCategoryBadge,
  PlatformUpdate 
} from "@/data/knowledgeBase";

const WhatsNew = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'creator' | 'brand' | null>(null);
  const [selectedUpdate, setSelectedUpdate] = useState<PlatformUpdate | null>(null);

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

  const recentUpdates = getRecentUpdates(userRole);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Link 
              to="/knowledge-base" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Knowledge Base
            </Link>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-heading font-bold">
                  What's New
                </h1>
                <p className="text-muted-foreground">
                  Latest updates and improvements from the past 30 days
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          {recentUpdates.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No recent updates in the past 30 days.</p>
              <Link to="/knowledge-base/changelog" className="text-primary hover:underline mt-2 inline-block">
                View older updates in the changelog
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {recentUpdates.map((update) => {
                const Icon = update.icon;
                const badge = getCategoryBadge(update.category);
                const isExpanded = selectedUpdate?.id === update.id;
                
                return (
                  <Card 
                    key={update.id}
                    className={`overflow-hidden transition-all duration-200 ${isExpanded ? 'ring-2 ring-primary/50' : 'hover:border-primary/30'}`}
                  >
                    <div 
                      className="p-6 cursor-pointer"
                      onClick={() => setSelectedUpdate(isExpanded ? null : update)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap mb-2">
                            <Badge className={badge.color}>{badge.label}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatUpdateDate(update.publishedAt)}
                            </span>
                          </div>
                          <h3 className="font-heading font-semibold text-lg mb-1">
                            {update.title}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {update.description}
                          </p>
                        </div>
                        <ArrowRight className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-0 border-t">
                        <div 
                          className="prose prose-sm max-w-none pt-4
                            prose-headings:font-heading prose-headings:font-semibold
                            prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3
                            prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2
                            prose-p:text-muted-foreground prose-p:leading-relaxed
                            prose-ul:my-3 prose-li:text-muted-foreground
                            prose-strong:text-foreground
                          "
                          dangerouslySetInnerHTML={{ __html: update.content }}
                        />
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Link to Changelog */}
          <div className="mt-8 text-center">
            <Link to="/knowledge-base/changelog">
              <Button variant="outline" className="gap-2">
                View older updates
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WhatsNew;
