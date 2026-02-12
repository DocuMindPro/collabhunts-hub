import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { safeNativeAsync } from "@/lib/supabase-native";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Star, MapPin, SlidersHorizontal, ChevronRight } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface CreatorCard {
  id: string;
  display_name: string;
  profile_image_url: string | null;
  categories: string[] | null;
  location_city: string | null;
  location_country: string | null;
  average_rating: number | null;
  is_featured: boolean | null;
  bio: string | null;
}

const CATEGORIES = [
  "All",
  "Lifestyle",
  "Fashion",
  "Beauty",
  "Travel",
  "Food",
  "Fitness",
  "Tech",
  "Photography",
  "Music",
  "Art",
  "Gaming",
  "Education",
  "Comedy",
  "Business",
];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
];

const CITIES = [
  "All Cities",
  "Beirut",
  "Jounieh",
  "Tripoli",
  "Sidon",
  "Byblos",
  "Zahle",
  "Batroun",
];

const NativeBrandSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [creators, setCreators] = useState<CreatorCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;

  useEffect(() => {
    setPage(0);
    setCreators([]);
    fetchCreators(0);
  }, [query, selectedCategory, selectedCity, sortBy]);

  const fetchCreators = async (pageNum: number) => {
    setLoading(pageNum === 0);

    const data = await safeNativeAsync(
      async () => {
        let q = supabase
          .from("creator_profiles")
          .select("id, display_name, profile_image_url, categories, location_city, location_country, average_rating, is_featured, bio")
          .eq("status", "approved");

        if (query.trim()) {
          q = q.ilike("display_name", `%${query.trim()}%`);
        }

        if (selectedCategory !== "All") {
          q = q.contains("categories", [selectedCategory]);
        }

        if (selectedCity !== "All Cities") {
          q = q.ilike("location_city", `%${selectedCity}%`);
        }

        switch (sortBy) {
          case "featured":
            q = q.order("is_featured", { ascending: false }).order("average_rating", { ascending: false, nullsFirst: false });
            break;
          case "rating":
            q = q.order("average_rating", { ascending: false, nullsFirst: false });
            break;
          case "newest":
            q = q.order("created_at", { ascending: false });
            break;
        }

        q = q.range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

        const { data } = await q;
        return data;
      },
      [],
      5000
    );

    const results = data || [];
    setHasMore(results.length === PAGE_SIZE);

    if (pageNum === 0) {
      setCreators(results);
    } else {
      setCreators((prev) => [...prev, ...results]);
    }
    setLoading(false);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchCreators(nextPage);
  };

  const activeFilterCount = [
    selectedCategory !== "All",
    selectedCity !== "All Cities",
    sortBy !== "featured",
  ].filter(Boolean).length;

  return (
    <div className="pb-4">
      {/* Search Header */}
      <div className="sticky top-0 z-30 bg-background px-4 pt-4 pb-2 border-b border-border">
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search creators..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            size="icon"
            className="h-11 w-11 shrink-0 relative"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Category Chips */}
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Extended Filters */}
        {showFilters && (
          <div className="flex gap-2 pt-2 pb-1">
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="h-9 text-xs flex-1">
                <MapPin className="h-3 w-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CITIES.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-9 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="px-4 py-2">
        <p className="text-xs text-muted-foreground">
          {loading ? "Searching..." : `${creators.length} creator${creators.length !== 1 ? "s" : ""} found`}
        </p>
      </div>

      {/* Results */}
      <div className="px-4">
        {loading && creators.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : creators.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="font-medium text-foreground mb-1">No creators found</p>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your filters or search term
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory("All");
                setSelectedCity("All Cities");
                setSortBy("featured");
                setQuery("");
              }}
            >
              Clear all filters
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {creators.map((creator) => (
              <button
                key={creator.id}
                onClick={() => navigate(`/creator/${creator.id}`)}
                className="w-full text-left bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all active:scale-[0.98]"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-14 w-14 flex-shrink-0 rounded-xl">
                    <AvatarImage src={creator.profile_image_url || undefined} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary rounded-xl text-lg">
                      {creator.display_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {creator.display_name}
                      </p>
                      {creator.is_featured && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          ★ Featured
                        </Badge>
                      )}
                    </div>

                    {/* Categories */}
                    {creator.categories && creator.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        {creator.categories.slice(0, 3).map((cat) => (
                          <span
                            key={cat}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                          >
                            {cat}
                          </span>
                        ))}
                        {creator.categories.length > 3 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{creator.categories.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Bio snippet */}
                    {creator.bio && (
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-1.5">
                        {creator.bio}
                      </p>
                    )}

                    {/* Stats Row */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {creator.location_city && (
                        <span className="flex items-center gap-0.5">
                          <MapPin className="h-3 w-3" />
                          {creator.location_city}
                        </span>
                      )}
                      {creator.average_rating && creator.average_rating > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-primary text-primary" />
                          {creator.average_rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-muted-foreground mt-1 shrink-0" />
                </div>
              </button>
            ))}

            {/* Load More */}
            {hasMore && (
              <Button
                variant="outline"
                className="w-full"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? <Loader2Icon /> : "Load more creators"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Loader2Icon = () => (
  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
);

export default NativeBrandSearch;
