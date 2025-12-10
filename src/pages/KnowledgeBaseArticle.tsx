import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { FileText, ChevronRight, ChevronLeft } from "lucide-react";
import { getArticleBySlug, getCategoriesForRole, KBCategory, KBArticle } from "@/data/knowledgeBase";

const KnowledgeBaseArticle = () => {
  const navigate = useNavigate();
  const { categorySlug, articleSlug } = useParams<{ categorySlug: string; articleSlug: string }>();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'creator' | 'brand' | null>(null);
  const [category, setCategory] = useState<KBCategory | null>(null);
  const [article, setArticle] = useState<KBArticle | null>(null);

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

      // Get article
      if (categorySlug && articleSlug) {
        const result = getArticleBySlug(categorySlug, articleSlug);
        if (result) {
          // Check if user has access to this category
          const accessibleCategories = getCategoriesForRole(role);
          if (accessibleCategories.find(c => c.slug === categorySlug)) {
            setCategory(result.category);
            setArticle(result.article);
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
  }, [navigate, categorySlug, articleSlug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!category || !article) {
    return null;
  }

  const currentIndex = category.articles.findIndex(a => a.slug === article.slug);
  const prevArticle = currentIndex > 0 ? category.articles[currentIndex - 1] : null;
  const nextArticle = currentIndex < category.articles.length - 1 ? category.articles[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-6xl mx-auto">
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
                <BreadcrumbLink asChild>
                  <Link to={`/knowledge-base/${category.slug}`}>{category.title}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{article.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Articles in this category */}
            <aside className="lg:col-span-1 order-2 lg:order-1">
              <Card className="p-4 sticky top-24">
                <h3 className="font-heading font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">
                  Articles in this section
                </h3>
                <div className="space-y-1">
                  {category.articles.map((a) => (
                    <Link
                      key={a.slug}
                      to={`/knowledge-base/${category.slug}/${a.slug}`}
                      className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-colors ${
                        a.slug === article.slug
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <FileText className="h-4 w-4 shrink-0" />
                      <span className="line-clamp-2">{a.title}</span>
                    </Link>
                  ))}
                </div>
              </Card>
            </aside>

            {/* Main Content */}
            <article className="lg:col-span-3 order-1 lg:order-2">
              <div className="bg-card rounded-xl border p-6 md:p-8">
                <h1 className="text-3xl font-heading font-bold mb-6">{article.title}</h1>
                
                {/* Article Content */}
                <div 
                  className="prose prose-slate dark:prose-invert max-w-none
                    prose-headings:font-heading prose-headings:font-semibold
                    prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                    prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                    prose-p:text-muted-foreground prose-p:leading-relaxed
                    prose-li:text-muted-foreground
                    prose-strong:text-foreground
                    prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                    [&_.alert]:p-4 [&_.alert]:rounded-lg [&_.alert]:my-4
                    [&_.alert-info]:bg-blue-50 [&_.alert-info]:dark:bg-blue-900/20 [&_.alert-info]:border [&_.alert-info]:border-blue-200 [&_.alert-info]:dark:border-blue-800
                    [&_.alert-warning]:bg-amber-50 [&_.alert-warning]:dark:bg-amber-900/20 [&_.alert-warning]:border [&_.alert-warning]:border-amber-200 [&_.alert-warning]:dark:border-amber-800
                    [&_.alert-danger]:bg-red-50 [&_.alert-danger]:dark:bg-red-900/20 [&_.alert-danger]:border [&_.alert-danger]:border-red-200 [&_.alert-danger]:dark:border-red-800
                  "
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />

                {/* Navigation between articles */}
                <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row gap-4 justify-between">
                  {prevArticle ? (
                    <Link
                      to={`/knowledge-base/${category.slug}/${prevArticle.slug}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
                    >
                      <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                      <div className="text-left">
                        <p className="text-xs uppercase tracking-wide">Previous</p>
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {prevArticle.title}
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <div />
                  )}
                  
                  {nextArticle ? (
                    <Link
                      to={`/knowledge-base/${category.slug}/${nextArticle.slug}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group text-right"
                    >
                      <div>
                        <p className="text-xs uppercase tracking-wide">Next</p>
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {nextArticle.title}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ) : (
                    <div />
                  )}
                </div>
              </div>
            </article>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default KnowledgeBaseArticle;
