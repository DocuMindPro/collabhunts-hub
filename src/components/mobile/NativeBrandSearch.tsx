import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { safeNativeAsync } from "@/lib/supabase-native";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Star, MapPin } from "lucide-react";

interface CreatorCard {
  id: string;
  display_name: string;
  profile_image_url: string | null;
  categories: string[] | null;
  location_city: string | null;
  location_country: string | null;
  average_rating: number | null;
  is_featured: boolean | null;
}

const NativeBrandSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [creators, setCreators] = useState<CreatorCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreators();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchCreators(), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const fetchCreators = async () => {
    const data = await safeNativeAsync(
      async () => {
        let q = supabase
          .from("creator_profiles")
          .select("id, display_name, profile_image_url, categories, location_city, location_country, average_rating, is_featured")
          .eq("status", "approved")
          .order("is_featured", { ascending: false })
          .limit(30);

        if (query.trim()) {
          q = q.ilike("display_name", `%${query.trim()}%`);
        }

        const { data } = await q;
        return data;
      },
      [],
      5000
    );

    setCreators(data || []);
    setLoading(false);
  };

  return (
    <div className="px-4 pt-4 pb-2">
      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search creators..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 h-11"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : creators.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No creators found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {creators.map((creator) => (
            <button
              key={creator.id}
              onClick={() => navigate(`/creator/${creator.id}`)}
              className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage src={creator.profile_image_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {creator.display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-medium text-sm text-foreground truncate">
                    {creator.display_name}
                  </p>
                  {creator.is_featured && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      ★
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                  {creator.categories && creator.categories.length > 0 && (
                    <span className="text-xs text-muted-foreground truncate">
                      {creator.categories[0]}
                    </span>
                  )}
                  {creator.location_city && (
                    <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                      <MapPin className="h-3 w-3" />
                      {creator.location_city}
                    </span>
                  )}
                </div>
              </div>

              {creator.average_rating && creator.average_rating > 0 && (
                <div className="flex items-center gap-0.5 text-xs text-muted-foreground">
                  <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                  {creator.average_rating.toFixed(1)}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NativeBrandSearch;
