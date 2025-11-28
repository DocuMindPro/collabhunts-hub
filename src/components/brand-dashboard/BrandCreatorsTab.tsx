import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star } from "lucide-react";

interface Creator {
  id: string;
  display_name: string;
  bio: string | null;
  location_city: string | null;
  location_state: string | null;
  categories: string[];
  social_accounts: Array<{
    follower_count: number;
  }>;
  services: Array<{
    price_cents: number;
  }>;
}

const BrandCreatorsTab = () => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from("creator_profiles")
        .select("*")
        .eq("status", "approved");

      if (profilesError) throw profilesError;

      const creatorsWithDetails = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const [socialData, servicesData] = await Promise.all([
            supabase
              .from("creator_social_accounts")
              .select("follower_count")
              .eq("creator_profile_id", profile.id),
            supabase
              .from("creator_services")
              .select("price_cents")
              .eq("creator_profile_id", profile.id)
              .eq("is_active", true),
          ]);

          return {
            id: profile.id,
            display_name: profile.display_name,
            bio: profile.bio,
            location_city: profile.location_city,
            location_state: profile.location_state,
            categories: profile.categories,
            social_accounts: socialData.data || [],
            services: servicesData.data || [],
          };
        })
      );

      setCreators(creatorsWithDetails);
    } catch (error) {
      console.error("Error fetching creators:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCreators = creators.filter(c => 
    c.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const getTotalReach = (accounts: Array<{ follower_count: number }>) => {
    return accounts.reduce((sum, acc) => sum + acc.follower_count, 0);
  };

  const getMinPrice = (services: Array<{ price_cents: number }>) => {
    if (services.length === 0) return null;
    return Math.min(...services.map(s => s.price_cents / 100));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold mb-2">Discover Creators</h2>
        <p className="text-muted-foreground">Find the perfect influencer for your campaign</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCreators.map((creator) => {
          const totalReach = getTotalReach(creator.social_accounts);
          const minPrice = getMinPrice(creator.services);

          return (
            <Card key={creator.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-accent text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white">{creator.display_name}</CardTitle>
                    <div className="flex items-center gap-1 text-white/80 text-sm mt-1">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {[creator.location_city, creator.location_state]
                          .filter(Boolean)
                          .join(", ") || "Location not set"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-1 rounded-full">
                    <Star className="h-3 w-3 fill-primary text-primary" />
                    <span className="text-xs font-semibold">5.0</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex flex-wrap gap-1">
                  {creator.categories.slice(0, 3).map((category) => (
                    <Badge key={category} variant="secondary" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>

                {creator.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {creator.bio}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Reach</p>
                    <p className="font-semibold">{formatFollowers(totalReach)}</p>
                  </div>
                  {minPrice && (
                    <div>
                      <p className="text-muted-foreground">Starting at</p>
                      <p className="font-semibold">${minPrice.toFixed(0)}</p>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full gradient-hero hover:opacity-90"
                  onClick={() => window.location.href = `/creator/${creator.id}`}
                >
                  View Profile
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCreators.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">No creators found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BrandCreatorsTab;
