import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Search, FileText, ChevronRight } from "lucide-react";
import { getCategoryBySlug, getCategoriesForRole, KBCategory } from "@/data/knowledgeBase";

const KnowledgeBaseCategory = () => {
  const navigate = useNavigate();
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'creator' | 'brand' | null>(null);
  const [category, setCategory] = useState<KBCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

      let role: 'creator' | 'brand' | null = null;
      if (creatorResult.data) {
        role = 'creator';
      } else if (brandResult.data) {
        role = 'brand';
      }
      setUserRole(role);

      // Get category
      if (categorySlug) {
        const cat = getCategoryBySlug(categorySlug);
        if (cat) {
          // Check if user has access to this category
          const accessibleCategories = getCategoriesForRole(role);
          if (accessibleCategories.find(c => c.slug === categorySlug)) {
            setCategory(cat);
          } else {
            navigate("/knowledge-base");
            return;
          }
        } else {
          navigate("/knowledge-base");
          return;
        }
      }

      setLoading(false);
    };
    checkAuthAndRole();
  }, [navigate, categorySlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!category) {
    return null;
  }

  const Icon = category.icon;
  const filteredArticles = searchQuery.trim()
    ? category.articles.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : category.articles;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/knowledge-base">Knowledge Base</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{category.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Category Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
              <Icon className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold">{category.title}</h1>
              <p className="text-muted-foreground">{category.description}</p>
            </div>
          </div>

          {/* Search within category */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={`Search in ${category.title}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Articles List */}
          <div className="space-y-3">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <Link
                  key={article.slug}
                  to={`/knowledge-base/${category.slug}/${article.slug}`}
                >
                  <Card className="p-4 hover:border-primary/50 hover:shadow-md transition-all duration-200 group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium group-hover:text-primary transition-colors">
                          {article.title}
                        </h3>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    </div>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No articles found matching "{searchQuery}"
              </div>
            )}
          </div>

          {/* Back link */}
          <div className="mt-8 pt-8 border-t">
            <Link 
              to="/knowledge-base" 
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              ← Back to all categories
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default KnowledgeBaseCategory;
