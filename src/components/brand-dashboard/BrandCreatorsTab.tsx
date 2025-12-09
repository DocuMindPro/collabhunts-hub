import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Search, MapPin, Star, Filter, X, Heart } from "lucide-react";
import UpgradePrompt from "@/components/UpgradePrompt";
import { userHasAdvancedFilters } from "@/lib/subscription-utils";
import { useSaveCreator } from "@/hooks/useSaveCreator";

interface Creator {
  id: string;
  display_name: string;
  bio: string | null;
  location_city: string | null;
  location_state: string | null;
  categories: string[];
  birth_date: string | null;
  gender: string | null;
  ethnicity: string | null;
  primary_language: string | null;
  secondary_languages: string[] | null;
  social_accounts: Array<{
    follower_count: number;
  }>;
  services: Array<{
    price_cents: number;
  }>;
  avgRating: number;
  totalReviews: number;
}

const CATEGORIES = ["Fashion", "Beauty", "Fitness", "Food", "Travel", "Tech", "Gaming", "Lifestyle", "Business", "Art"];
const SORT_OPTIONS = [
  { value: "reach_desc", label: "Highest Reach" },
  { value: "reach_asc", label: "Lowest Reach" },
  { value: "price_asc", label: "Lowest Price" },
  { value: "price_desc", label: "Highest Price" },
  { value: "name_asc", label: "Name A-Z" },
  { value: "name_desc", label: "Name Z-A" },
];
const GENDERS = ["Male", "Female", "Non-binary"];
const ETHNICITIES = ["African American", "Asian", "Caucasian", "Hispanic/Latino", "Middle Eastern", "Mixed/Other"];
const LANGUAGES = ["English", "Spanish", "French", "German", "Portuguese", "Arabic", "Hindi", "Chinese", "Japanese", "Korean"];

// Separate component for creator card with save functionality
const CreatorCardWithSave = ({ creator, totalReach, minPrice, formatFollowers }: {
  creator: Creator;
  totalReach: number;
  minPrice: number | null;
  formatFollowers: (count: number) => string;
}) => {
  const { isSaved, toggleSave, hasBrandProfile } = useSaveCreator(creator.id);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
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
          <div className="flex items-center gap-2">
            {hasBrandProfile && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSave();
                }}
                className="p-1.5 rounded-full bg-white/90 hover:bg-white transition-colors"
              >
                <Heart className={`h-4 w-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
              </button>
            )}
            <div className="flex items-center gap-1 bg-white/90 backdrop-blur px-2 py-1 rounded-full">
              <Star className="h-3 w-3 fill-primary text-primary" />
              <span className="text-xs font-semibold">{creator.avgRating.toFixed(1)}</span>
              {creator.totalReviews > 0 && (
                <span className="text-xs text-primary/70">({creator.totalReviews})</span>
              )}
            </div>
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
};

const BrandCreatorsTab = () => {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  
  // Basic filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [followerRange, setFollowerRange] = useState([0, 10000000]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [sortBy, setSortBy] = useState("reach_desc");

  // Advanced filter states
  const [hasAdvancedFilters, setHasAdvancedFilters] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [ageRange, setAgeRange] = useState([18, 65]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedEthnicities, setSelectedEthnicities] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState("all");

  useEffect(() => {
    fetchCreators();
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    setCheckingSubscription(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const canUseFilters = await userHasAdvancedFilters(user.id);
        setHasAdvancedFilters(canUseFilters);
      } else {
        setHasAdvancedFilters(false);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      setHasAdvancedFilters(false);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const fetchCreators = async () => {
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from("creator_profiles")
        .select("*")
        .eq("status", "approved");

      if (profilesError) throw profilesError;

      const creatorsWithDetails = await Promise.all(
        (profilesData || []).map(async (profile) => {
          const [socialData, servicesData, reviewsData] = await Promise.all([
            supabase
              .from("creator_social_accounts")
              .select("follower_count")
              .eq("creator_profile_id", profile.id),
            supabase
              .from("creator_services")
              .select("price_cents")
              .eq("creator_profile_id", profile.id)
              .eq("is_active", true),
            supabase
              .from("reviews")
              .select("rating")
              .eq("creator_profile_id", profile.id),
          ]);

          const reviews = reviewsData.data || [];
          const avgRating = reviews.length > 0 
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
            : 5.0;

          return {
            id: profile.id,
            display_name: profile.display_name,
            bio: profile.bio,
            location_city: profile.location_city,
            location_state: profile.location_state,
            categories: profile.categories,
            birth_date: profile.birth_date,
            gender: profile.gender,
            ethnicity: profile.ethnicity,
            primary_language: profile.primary_language,
            secondary_languages: profile.secondary_languages,
            social_accounts: socialData.data || [],
            services: servicesData.data || [],
            avgRating,
            totalReviews: reviews.length
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

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const calculateAge = (birthDate: string | null): number | null => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getTotalReach = (accounts: Array<{ follower_count: number }>) => {
    return accounts.reduce((sum, acc) => sum + acc.follower_count, 0);
  };

  const getMinPrice = (services: Array<{ price_cents: number }>) => {
    if (services.length === 0) return null;
    return Math.min(...services.map(s => s.price_cents / 100));
  };

  const hasActiveAdvancedFilters = ageRange[0] > 18 || ageRange[1] < 65 || 
    selectedGenders.length > 0 || selectedEthnicities.length > 0 || selectedLanguage !== "all";

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setFollowerRange([0, 10000000]);
    setPriceRange([0, 10000]);
    setSelectedCountry("all");
    setSortBy("reach_desc");
    setSearchTerm("");
    setAgeRange([18, 65]);
    setSelectedGenders([]);
    setSelectedEthnicities([]);
    setSelectedLanguage("all");
  };

  const hasActiveFilters = selectedCategories.length > 0 || 
    followerRange[0] > 0 || followerRange[1] < 10000000 ||
    priceRange[0] > 0 || priceRange[1] < 10000 ||
    selectedCountry !== "all" || searchTerm.length > 0 ||
    hasActiveAdvancedFilters;

  let filteredCreators = creators.filter(c => {
    // Search filter
    const matchesSearch = searchTerm.length === 0 || 
      c.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.categories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Category filter
    const matchesCategory = selectedCategories.length === 0 || 
      selectedCategories.some(cat => c.categories.includes(cat));
    
    // Follower range filter
    const totalReach = getTotalReach(c.social_accounts);
    const matchesFollowers = totalReach >= followerRange[0] && totalReach <= followerRange[1];
    
    // Price range filter
    const minPrice = getMinPrice(c.services);
    const matchesPrice = minPrice === null || 
      (minPrice >= priceRange[0] && minPrice <= priceRange[1]);
    
    // Country filter
    const matchesCountry = selectedCountry === "all" || c.location_state === selectedCountry;

    // Advanced filters (only apply if user has access)
    let matchesAdvanced = true;
    if (hasAdvancedFilters && hasActiveAdvancedFilters) {
      // Age filter
      if (ageRange[0] > 18 || ageRange[1] < 65) {
        const age = calculateAge(c.birth_date);
        if (age !== null) {
          matchesAdvanced = matchesAdvanced && age >= ageRange[0] && age <= ageRange[1];
        }
      }

      // Gender filter
      if (selectedGenders.length > 0) {
        matchesAdvanced = matchesAdvanced && (c.gender ? selectedGenders.includes(c.gender) : false);
      }

      // Ethnicity filter
      if (selectedEthnicities.length > 0) {
        matchesAdvanced = matchesAdvanced && (c.ethnicity ? selectedEthnicities.includes(c.ethnicity) : false);
      }

      // Language filter
      if (selectedLanguage !== "all") {
        const matchesLanguage = c.primary_language === selectedLanguage || 
          (c.secondary_languages && c.secondary_languages.includes(selectedLanguage));
        matchesAdvanced = matchesAdvanced && matchesLanguage;
      }
    }
    
    return matchesSearch && matchesCategory && matchesFollowers && matchesPrice && matchesCountry && matchesAdvanced;
  });

  // Sort creators
  filteredCreators = [...filteredCreators].sort((a, b) => {
    switch (sortBy) {
      case "reach_desc":
        return getTotalReach(b.social_accounts) - getTotalReach(a.social_accounts);
      case "reach_asc":
        return getTotalReach(a.social_accounts) - getTotalReach(b.social_accounts);
      case "price_asc":
        const priceA = getMinPrice(a.services) || Infinity;
        const priceB = getMinPrice(b.services) || Infinity;
        return priceA - priceB;
      case "price_desc":
        const priceA2 = getMinPrice(a.services) || 0;
        const priceB2 = getMinPrice(b.services) || 0;
        return priceB2 - priceA2;
      case "name_asc":
        return a.display_name.localeCompare(b.display_name);
      case "name_desc":
        return b.display_name.localeCompare(a.display_name);
      default:
        return 0;
    }
  });

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
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

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, bio, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={showFilters ? "default" : "outline"} 
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 rounded-full h-5 w-5 p-0 flex items-center justify-center">
                !
              </Badge>
            )}
          </Button>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Filters</CardTitle>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="gap-2">
                  <X className="h-4 w-4" />
                  Clear All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Categories */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Categories</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {CATEGORIES.map(category => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox 
                      id={category}
                      checked={selectedCategories.includes(category)}
                      onCheckedChange={() => toggleCategory(category)}
                    />
                    <label htmlFor={category} className="text-sm cursor-pointer">
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Follower Range */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Total Reach</Label>
                <span className="text-sm text-muted-foreground">
                  {formatFollowers(followerRange[0])} - {formatFollowers(followerRange[1])}
                </span>
              </div>
              <Slider
                min={0}
                max={10000000}
                step={100000}
                value={followerRange}
                onValueChange={setFollowerRange}
                className="w-full"
              />
            </div>

            <Separator />

            {/* Price Range */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Price Range</Label>
                <span className="text-sm text-muted-foreground">
                  ${priceRange[0]} - ${priceRange[1]}
                </span>
              </div>
              <Slider
                min={0}
                max={10000}
                step={100}
                value={priceRange}
                onValueChange={setPriceRange}
                className="w-full"
              />
            </div>

            <Separator />

            {/* Location */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Location</Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="California">California</SelectItem>
                  <SelectItem value="New York">New York</SelectItem>
                  <SelectItem value="Texas">Texas</SelectItem>
                  <SelectItem value="Florida">Florida</SelectItem>
                  <SelectItem value="Illinois">Illinois</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Advanced Filters Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Advanced Filters (Demographics)</Label>
                {hasAdvancedFilters && hasActiveAdvancedFilters && (
                  <Badge variant="secondary" className="text-xs">Active</Badge>
                )}
              </div>

              {!hasAdvancedFilters && !checkingSubscription ? (
                <UpgradePrompt feature="filters" inline />
              ) : checkingSubscription ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-6 pt-2">
                  {/* Age Range */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Age Range</Label>
                      <span className="text-sm text-muted-foreground">
                        {ageRange[0]} - {ageRange[1]}+ years
                      </span>
                    </div>
                    <Slider
                      min={18}
                      max={65}
                      step={1}
                      value={ageRange}
                      onValueChange={setAgeRange}
                      className="w-full"
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-3">
                    <Label>Gender</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {GENDERS.map((gender) => (
                        <div key={gender} className="flex items-center space-x-2">
                          <Checkbox
                            id={`brand-gender-${gender}`}
                            checked={selectedGenders.includes(gender)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedGenders([...selectedGenders, gender]);
                              } else {
                                setSelectedGenders(selectedGenders.filter(g => g !== gender));
                              }
                            }}
                          />
                          <label htmlFor={`brand-gender-${gender}`} className="text-sm cursor-pointer">
                            {gender}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ethnicity */}
                  <div className="space-y-3">
                    <Label>Ethnicity</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {ETHNICITIES.map((ethnicity) => (
                        <div key={ethnicity} className="flex items-center space-x-2">
                          <Checkbox
                            id={`brand-ethnicity-${ethnicity}`}
                            checked={selectedEthnicities.includes(ethnicity)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedEthnicities([...selectedEthnicities, ethnicity]);
                              } else {
                                setSelectedEthnicities(selectedEthnicities.filter(e => e !== ethnicity));
                              }
                            }}
                          />
                          <label htmlFor={`brand-ethnicity-${ethnicity}`} className="text-sm cursor-pointer">
                            {ethnicity}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Language */}
                  <div className="space-y-3">
                    <Label>Language</Label>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger className="w-full md:w-[300px]">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Languages</SelectItem>
                        {LANGUAGES.map((lang) => (
                          <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredCreators.length} of {creators.length} creators
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCreators.map((creator) => {
          const totalReach = getTotalReach(creator.social_accounts);
          const minPrice = getMinPrice(creator.services);

          return (
            <CreatorCardWithSave 
              key={creator.id} 
              creator={creator} 
              totalReach={totalReach} 
              minPrice={minPrice} 
              formatFollowers={formatFollowers}
            />
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