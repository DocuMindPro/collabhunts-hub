import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MessageSquare, Package, ArrowRight, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";

interface Creator {
  id: string;
  display_name: string;
  profile_image_url: string | null;
  categories: string[] | null;
  location_country: string | null;
}

const BrandWelcome = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState("");

  const categories = searchParams.get("categories")?.split(",") || [];

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      // Get company name
      const { data: brandProfile } = await supabase
        .from("brand_profiles")
        .select("company_name")
        .eq("user_id", user.id)
        .single();

      if (brandProfile) {
        setCompanyName(brandProfile.company_name);
      }

      // Fetch personalized creators
      let query = supabase
        .from("creator_profiles")
        .select("id, display_name, profile_image_url, categories, location_country")
        .eq("status", "approved")
        .limit(6);

      // Filter by preferred categories if available
      if (categories.length > 0) {
        query = query.overlaps("categories", categories);
      }

      const { data } = await query;
      setCreators(data || []);
      setLoading(false);
    };

    fetchData();
  }, [navigate, searchParams]);

  const steps = [
    {
      icon: Search,
      title: "Search & Discover",
      description: "Browse creators by category, platform, or budget",
    },
    {
      icon: MessageSquare,
      title: "Connect & Collaborate",
      description: "Message creators to discuss and arrange terms directly",
    },
    {
      icon: Package,
      title: "Receive Content",
      description: "Get high-quality content delivered to you",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Setup Complete!</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            Welcome to CollabHunts, {companyName}!
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {categories.length > 0 
              ? `We found creators in ${categories.slice(0, 2).join(", ")} just for you`
              : "Discover amazing creators ready to collaborate with your brand"
            }
          </p>
        </div>

        {/* How It Works */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {steps.map((step, index) => (
            <Card key={index} className="p-6 text-center relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                {index + 1}
              </div>
              <step.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
              <h3 className="font-semibold mb-1">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </Card>
          ))}
        </div>

        {/* Personalized Creators */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {categories.length > 0 
                ? `${categories[0]} Creators for You`
                : "Featured Creators"
              }
            </h2>
            <Button variant="ghost" onClick={() => navigate("/influencers")} className="gap-2">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="w-16 h-16 rounded-full mx-auto mb-3" />
                  <Skeleton className="h-4 w-24 mx-auto mb-2" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </Card>
              ))}
            </div>
          ) : creators.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {creators.map((creator) => (
                <Card 
                  key={creator.id} 
                  className="p-4 text-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => navigate(`/creator/${creator.id}`)}
                >
                  <Avatar className="w-16 h-16 mx-auto mb-3">
                    <AvatarImage src={creator.profile_image_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {creator.display_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-medium truncate">{creator.display_name}</p>
                  {creator.categories && creator.categories[0] && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      {creator.categories[0]}
                    </Badge>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No creators found matching your preferences yet.</p>
              <Button onClick={() => navigate("/influencers")}>
                Browse All Creators
              </Button>
            </Card>
          )}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button size="lg" onClick={() => navigate("/brand-dashboard")} className="gap-2">
            Go to Dashboard <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </main>
    </div>
  );
};

export default BrandWelcome;
