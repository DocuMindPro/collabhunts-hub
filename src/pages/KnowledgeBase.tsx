import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowRight, Sparkles } from "lucide-react";
import { getCategoriesForRole, searchArticles, getRecentUpdates, KBCategory, KBArticle } from "@/data/knowledgeBase";

const KnowledgeBase = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'creator' | 'brand' | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ category: KBCategory; article: KBArticle }>>([]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const checkAuthAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      // Check if user is creator or brand
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

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = searchArticles(searchQuery, userRole);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, userRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const categories = getCategoriesForRole(userRole);
  const recentUpdates = getRecentUpdates(userRole);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              How can we help you?
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Search our knowledge base or browse categories below
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg rounded-xl border-2 border-border/50 focus:border-primary shadow-sm"
              />
            </div>

            {/* Search Results */}
            {searchQuery.trim() && (
              <div className="mt-4 text-left bg-card rounded-xl shadow-lg border max-h-80 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <div className="p-2">
                    {searchResults.map((result, index) => (
                      <Link
                        key={index}
                        to={`/knowledge-base/${result.category.slug}/${result.article.slug}`}
                        className="block p-3 hover:bg-muted rounded-lg transition-colors"
                      >
                        <p className="font-medium text-foreground">{result.article.title}</p>
                        <p className="text-sm text-muted-foreground">{result.category.title}</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No articles found for "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <main className="container mx-auto px-4 py-12 flex-1">
        <div className="max-w-5xl mx-auto">
          {/* What's New Card */}
          {recentUpdates.length > 0 && (
            <div className="mb-10">
              <Link to="/knowledge-base/whats-new">
                <Card className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all duration-200 group cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Sparkles className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-heading font-semibold text-lg group-hover:text-primary transition-colors">
                            What's New
                          </h3>
                          <Badge variant="default" className="bg-primary/90">
                            {recentUpdates.length} update{recentUpdates.length !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Latest platform updates and improvements
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Card>
              </Link>
            </div>
          )}

          <h2 className="text-2xl font-heading font-semibold mb-8 text-center">
            Browse by Category
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.slug} to={`/knowledge-base/${category.slug}`}>
                  <Card className="p-6 h-full hover:border-primary/50 hover:shadow-lg transition-all duration-200 group cursor-pointer">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                          {category.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {category.description}
                        </p>
                        <p className="text-sm text-primary mt-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {category.articles.length} article{category.articles.length !== 1 ? 's' : ''}
                          <ArrowRight className="h-4 w-4" />
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Role-based message */}
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">
              {userRole === 'creator' && (
                <>Showing articles for creators. <Link to="/brand-signup" className="text-primary hover:underline">Join as a brand</Link> to see brand resources.</>
              )}
              {userRole === 'brand' && (
                <>Showing articles for brands. <Link to="/creator-signup" className="text-primary hover:underline">Join as a creator</Link> to see creator resources.</>
              )}
              {!userRole && (
                <>Complete your profile to see personalized content.</>
              )}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default KnowledgeBase;
