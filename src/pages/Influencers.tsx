import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Star, Instagram, Youtube, Play } from "lucide-react";
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
    if (socialAccounts.length === 0) return { platform: "Creator", followers: 0 };
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

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "instagram": return Instagram;
      case "youtube": return Youtube;
      case "tiktok": return Play;
      default: return Instagram;
    }
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
              {/* Collabstr-style Grid - 4 columns, taller cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredCreators.map((creator) => {
                  const mainPlatform = getMainPlatform(creator.social_accounts);
                  const lowestPrice = getLowestPrice(creator.services);
                  const PlatformIcon = getPlatformIcon(mainPlatform.platform);

                  return (
                    <Link
                      key={creator.id}
                      to={`/creator/${creator.id}`}
                      className="group block"
                    >
                      <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-hover transition-all duration-300 hover:-translate-y-1">
                        {/* Taller Image Container - 4:5 aspect ratio like Collabstr */}
                        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                          {creator.profile_image_url ? (
                            <img 
                              src={creator.profile_image_url} 
                              alt={creator.display_name}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-accent flex items-center justify-center">
                              <span className="text-7xl font-heading font-bold text-white/30">
                                {creator.display_name.charAt(0)}
                              </span>
                            </div>
                          )}
                          
                          {/* Overlay badges on image */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          
                          {/* Platform & Followers Badge - Top Left */}
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                            <PlatformIcon className="h-3.5 w-3.5" />
                            <span>{formatFollowers(mainPlatform.followers)}</span>
                          </div>

                          {/* Rating Badge - Top Right */}
                          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium">
                            <Star className="h-3 w-3 fill-primary text-primary" />
                            <span>5.0</span>
                          </div>

                          {/* Creator Info - Bottom Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="font-heading font-semibold text-lg text-white mb-0.5 line-clamp-1">
                              {creator.display_name}
                            </h3>
                            <p className="text-sm text-white/80 line-clamp-1">
                              {creator.categories[0] || "Content Creator"}
                            </p>
                          </div>
                        </div>

                        {/* Price & Location Bar */}
                        <div className="p-4 flex items-center justify-between">
                          <div>
                            {lowestPrice > 0 ? (
                              <div className="flex items-baseline gap-1">
                                <span className="text-xl font-heading font-bold">
                                  ${(lowestPrice / 100).toFixed(0)}
                                </span>
                                <span className="text-xs text-muted-foreground">+</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">Contact</span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                            {[creator.location_city, creator.location_state]
                              .filter(Boolean)
                              .join(", ") || "—"}
                          </span>
                        </div>
                      </div>
                    </Link>
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