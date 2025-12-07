import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, Star, Heart } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CreatorWithDetails {
  id: string;
  display_name: string;
  profile_image_url: string | null;
  categories: string[];
  location_city: string | null;
  location_state: string | null;
  social_accounts: Array<{
    platform: string;
    username: string;
    follower_count: number;
  }>;
  services: Array<{
    service_type: string;
    price_cents: number;
  }>;
}

const Influencers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [creators, setCreators] = useState<CreatorWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const platforms = ["All", "Instagram", "TikTok", "YouTube", "Twitter", "Twitch"];
  const categories = [
    "All Categories",
    "Lifestyle",
    "Fashion",
    "Beauty",
    "Travel",
    "Health & Fitness",
    "Food & Drink",
    "Tech & Gaming",
    "Business",
    "Education"
  ];

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("creator_profiles")
        .select(`
          id,
          display_name,
          profile_image_url,
          categories,
          location_city,
          location_state,
          creator_social_accounts(platform, username, follower_count),
          creator_services(service_type, price_cents)
        `)
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedCreators: CreatorWithDetails[] = (data || []).map((creator) => ({
        id: creator.id,
        display_name: creator.display_name,
        profile_image_url: creator.profile_image_url,
        categories: creator.categories,
        location_city: creator.location_city,
        location_state: creator.location_state,
        social_accounts: creator.creator_social_accounts || [],
        services: creator.creator_services || []
      }));

      setCreators(formattedCreators);
    } catch (error: any) {
      console.error("Error fetching creators:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredCreators = creators.filter((creator) => {
    const matchesSearch = searchQuery === "" || 
      creator.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPlatform = selectedPlatform === "all" ||
      creator.social_accounts.some(acc => acc.platform.toLowerCase() === selectedPlatform.toLowerCase());

    const matchesCategory = selectedCategory === "all" ||
      creator.categories.some(cat => cat.toLowerCase() === selectedCategory.toLowerCase().replace(" categories", ""));

    return matchesSearch && matchesPlatform && matchesCategory;
  });

  const getMainPlatform = (socialAccounts: CreatorWithDetails['social_accounts']) => {
    if (socialAccounts.length === 0) return { platform: "N/A", followers: 0 };
    const sorted = [...socialAccounts].sort((a, b) => b.follower_count - a.follower_count);
    return { platform: sorted[0].platform, followers: sorted[0].follower_count };
  };

  const getLowestPrice = (services: CreatorWithDetails['services']) => {
    if (services.length === 0) return 0;
    return Math.min(...services.map(s => s.price_cents));
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Find Your Perfect Influencer
            </h1>
            <p className="text-xl text-muted-foreground">
              Browse verified creators across all platforms
            </p>
          </div>

          {/* Filters */}
          <div className="bg-card rounded-xl border border-border p-6 mb-8 shadow-card">
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by name, niche, or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((platform) => (
                    <SelectItem key={platform} value={platform.toLowerCase()}>
                      {platform}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredCreators.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">No creators found matching your criteria</p>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCreators.map((creator) => {
                  const mainPlatform = getMainPlatform(creator.social_accounts);
                  const lowestPrice = getLowestPrice(creator.services);

                  return (
                    <div
                      key={creator.id}
                      className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-hover transition-shadow group"
                    >
                      <div className="relative aspect-square overflow-hidden bg-gradient-accent">
                        {creator.profile_image_url ? (
                          <img 
                            src={creator.profile_image_url} 
                            alt={creator.display_name}
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-6xl font-heading font-bold text-white/20">
                              {creator.display_name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <button className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur rounded-full hover:bg-background transition-colors">
                          <Heart className="h-5 w-5" />
                        </button>
                        <Badge className="absolute bottom-4 left-4 bg-background/90 backdrop-blur capitalize">
                          {mainPlatform.platform}
                        </Badge>
                      </div>

                      <div className="p-6">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-heading font-semibold text-lg mb-1">
                              {creator.display_name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {creator.categories[0] || "Creator"}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded">
                            <Star className="h-4 w-4 fill-primary text-primary" />
                            <span className="text-sm font-medium">5.0</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                          <span>{formatFollowers(mainPlatform.followers)} followers</span>
                          <span>
                            {[creator.location_city, creator.location_state]
                              .filter(Boolean)
                              .join(", ") || "Location N/A"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            {lowestPrice > 0 ? (
                              <>
                                <span className="text-2xl font-heading font-bold">
                                  ${(lowestPrice / 100).toFixed(0)}
                                </span>
                                <span className="text-sm text-muted-foreground ml-1">starting at</span>
                              </>
                            ) : (
                              <span className="text-sm text-muted-foreground">Contact for pricing</span>
                            )}
                          </div>
                          <Link to={`/creator/${creator.id}`}>
                            <Button size="sm" className="gradient-hero hover:opacity-90">
                              View Profile
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center mt-8">
                <p className="text-muted-foreground">
                  Showing {filteredCreators.length} creator{filteredCreators.length !== 1 ? "s" : ""}
                </p>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Influencers;