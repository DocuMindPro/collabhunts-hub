import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Search, Star, Instagram, Youtube, Play, Filter, X, ChevronDown, ChevronUp, Calendar, Gift, Sparkles, Zap } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AdPlacement from "@/components/AdPlacement";
import DimmedPriceRange from "@/components/DimmedPriceRange";
import CountrySelect from "@/components/CountrySelect";
import LocationSelect from "@/components/LocationSelect";
import VettedBadge from "@/components/VettedBadge";
import VIPCreatorBadge from "@/components/VIPCreatorBadge";
import FeaturedBadge from "@/components/FeaturedBadge";
import RespondsFastBadge from "@/components/RespondsFastBadge";
import { isPast } from "date-fns";

interface CreatorWithDetails {
  id: string;
  display_name: string;
  profile_image_url: string | null;
  categories: string[];
  location_country: string | null;
  location_state: string | null;
  location_city: string | null;
  birth_date: string | null;
  gender: string | null;
  primary_language: string | null;
  secondary_languages: string[] | null;
  show_pricing_to_public: boolean | null;
  open_to_invitations: boolean | null;
  is_featured: boolean;
  verification_payment_status: string | null;
  verification_expires_at: string | null;
  avg_response_minutes: number | null;
  average_rating: number | null;
  total_reviews: number | null;
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

// Helper to check if creator has active VIP status
const isCreatorVIP = (creator: CreatorWithDetails) => {
  if (creator.verification_payment_status !== 'paid') return false;
  if (!creator.verification_expires_at) return false;
  return !isPast(new Date(creator.verification_expires_at));
};

const GENDERS = ["Male", "Female", "Non-binary"];
const LANGUAGES = ["English", "Spanish", "French", "German", "Portuguese", "Arabic", "Hindi", "Chinese", "Japanese", "Korean"];

const Influencers = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [creators, setCreators] = useState<CreatorWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  
  // Advanced filters state - now FREE for all users
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Location filters (priority for event-based platform)
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [openToFreeInvites, setOpenToFreeInvites] = useState(false);
  const [respondsFast, setRespondsFast] = useState(false);
  const [topRated, setTopRated] = useState(false);
  
  // Other filters
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [followerPlatform, setFollowerPlatform] = useState("all");
  const [minPlatformFollowers, setMinPlatformFollowers] = useState("");
  const [ageRange, setAgeRange] = useState([18, 65]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  
  const [hasBrandProfile, setHasBrandProfile] = useState(false);
  const [hasCreatorProfile, setHasCreatorProfile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const navigate = useNavigate();

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
    checkUserStatus();
  }, []);

  // Redirect non-brand users away from this page
  useEffect(() => {
    if (authCheckComplete && !hasBrandProfile) {
      navigate('/', { replace: true });
    }
  }, [authCheckComplete, hasBrandProfile, navigate]);

  const checkUserStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check for brand profile
        const { data: brandProfile } = await supabase
          .from("brand_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        
        // Check for creator profile
        const { data: creatorProfile } = await supabase
          .from("creator_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        
        // Redirect creators to their dashboard - they shouldn't browse other creators
        if (creatorProfile) {
          navigate('/creator-dashboard', { replace: true });
          return;
        }
        
        // Redirect non-brand users to homepage
        if (!brandProfile) {
          navigate('/', { replace: true });
          return;
        }
        
        setHasBrandProfile(!!brandProfile);
        setHasCreatorProfile(!!creatorProfile);
        setIsLoggedIn(true);
      } else {
        // Not logged in - redirect to homepage
        navigate('/', { replace: true });
        return;
      }
    } catch (error) {
      console.error("Error checking user status:", error);
      navigate('/', { replace: true });
    } finally {
      setAuthCheckComplete(true);
    }
  };

  // Pre-validate images when creators change
  useEffect(() => {
    creators.forEach((creator) => {
      if (creator.profile_image_url && !loadedImages.has(creator.id) && !failedImages.has(creator.id)) {
        const img = new Image();
        img.onload = () => setLoadedImages(prev => new Set(prev).add(creator.id));
        img.onerror = () => setFailedImages(prev => new Set(prev).add(creator.id));
        img.src = creator.profile_image_url;
        
        const timeoutId = setTimeout(() => {
          setFailedImages(prev => {
            if (!loadedImages.has(creator.id) && !prev.has(creator.id)) {
              return new Set(prev).add(creator.id);
            }
            return prev;
          });
        }, 5000);
        
        img.onload = () => {
          clearTimeout(timeoutId);
          setLoadedImages(prev => new Set(prev).add(creator.id));
        };
        img.onerror = () => {
          clearTimeout(timeoutId);
          setFailedImages(prev => new Set(prev).add(creator.id));
        };
      } else if (!creator.profile_image_url) {
        setFailedImages(prev => new Set(prev).add(creator.id));
      }
    });
  }, [creators]);

  const fetchCreators = async () => {
    try {
      setLoading(true);

      // Fetch creators
      const { data, error } = await supabase
        .from("creator_profiles")
        .select(`
          id,
          display_name,
          profile_image_url,
          categories,
          location_country,
          location_state,
          location_city,
          birth_date,
          gender,
          primary_language,
          secondary_languages,
          show_pricing_to_public,
          open_to_invitations,
          verification_payment_status,
          verification_expires_at,
          avg_response_minutes,
          average_rating,
          total_reviews,
          creator_social_accounts(platform, username, follower_count),
          creator_services(service_type, price_cents)
        `)
        .eq("status", "approved");

      if (error) throw error;

      // Fetch active featuring records
      const now = new Date().toISOString();
      const { data: featuringData } = await supabase
        .from("creator_featuring")
        .select("creator_profile_id, feature_type")
        .eq("is_active", true)
        .gt("end_date", now);

      // Create a set of featured creator IDs
      const featuredCreatorIds = new Set(
        (featuringData || []).map(f => f.creator_profile_id)
      );

      const formattedCreators: CreatorWithDetails[] = (data || []).map((creator) => ({
        id: creator.id,
        display_name: creator.display_name,
        profile_image_url: creator.profile_image_url,
        categories: creator.categories,
        location_country: creator.location_country,
        location_state: creator.location_state,
        location_city: creator.location_city,
        birth_date: creator.birth_date,
        gender: creator.gender,
        primary_language: creator.primary_language,
        secondary_languages: creator.secondary_languages,
        show_pricing_to_public: creator.show_pricing_to_public,
        open_to_invitations: creator.open_to_invitations,
        is_featured: featuredCreatorIds.has(creator.id),
        verification_payment_status: creator.verification_payment_status,
        verification_expires_at: creator.verification_expires_at,
        avg_response_minutes: creator.avg_response_minutes,
        average_rating: creator.average_rating ? Number(creator.average_rating) : null,
        total_reviews: creator.total_reviews,
        social_accounts: creator.creator_social_accounts || [],
        services: creator.creator_services || []
      }));

      // Sort: VIP creators first, then featured, then rest
      formattedCreators.sort((a, b) => {
        const aIsVIP = isCreatorVIP(a);
        const bIsVIP = isCreatorVIP(b);
        if (aIsVIP && !bIsVIP) return -1;
        if (!aIsVIP && bIsVIP) return 1;
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return 0;
      });

      setCreators(formattedCreators);
    } catch (error: any) {
      console.error("Error fetching creators:", error.message);
    } finally {
      setLoading(false);
    }
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

  const hasActiveAdvancedFilters = selectedCountry !== "all" || selectedState !== "" || 
    selectedCity !== "" || openToFreeInvites || respondsFast || topRated || selectedLanguage !== "all" ||
    (followerPlatform !== "all" && minPlatformFollowers !== "") ||
    ageRange[0] > 18 || ageRange[1] < 65 || selectedGenders.length > 0;

  const clearAdvancedFilters = () => {
    setSelectedCountry("all");
    setSelectedState("");
    setSelectedCity("");
    setOpenToFreeInvites(false);
    setRespondsFast(false);
    setTopRated(false);
    setSelectedLanguage("all");
    setFollowerPlatform("all");
    setMinPlatformFollowers("");
    setAgeRange([18, 65]);
    setSelectedGenders([]);
  };

  const filteredCreators = creators.filter((creator) => {
    const matchesSearch = searchQuery === "" || 
      creator.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPlatform = selectedPlatform === "all" ||
      creator.social_accounts.some(acc => acc.platform.toLowerCase() === selectedPlatform.toLowerCase());

    const matchesCategory = selectedCategory === "all" ||
      creator.categories.some(cat => cat.toLowerCase() === selectedCategory.toLowerCase().replace(" categories", ""));

    // Advanced filters - now available to everyone
    let matchesAdvanced = true;
    if (hasActiveAdvancedFilters) {
      // Location filters (priority for event booking)
      if (selectedCountry !== "all") {
        matchesAdvanced = matchesAdvanced && creator.location_country === selectedCountry;
      }
      if (selectedState) {
        matchesAdvanced = matchesAdvanced && creator.location_state === selectedState;
      }
      if (selectedCity) {
        matchesAdvanced = matchesAdvanced && creator.location_city === selectedCity;
      }

      // Open to Free Invites filter
      if (openToFreeInvites) {
        matchesAdvanced = matchesAdvanced && creator.open_to_invitations === true;
      }

      // Responds Fast filter
      if (respondsFast) {
        matchesAdvanced = matchesAdvanced && 
          (creator.avg_response_minutes !== null && creator.avg_response_minutes <= 1440);
      }

      // Top Rated filter
      if (topRated) {
        matchesAdvanced = matchesAdvanced && 
          (creator.average_rating !== null && creator.average_rating >= 4.0 && (creator.total_reviews || 0) >= 3);
      }

      // Language filter
      if (selectedLanguage !== "all") {
        const matchesLanguage = creator.primary_language === selectedLanguage || 
          (creator.secondary_languages && creator.secondary_languages.includes(selectedLanguage));
        matchesAdvanced = matchesAdvanced && matchesLanguage;
      }

      // Platform-specific follower filter
      if (followerPlatform !== "all" && minPlatformFollowers !== "") {
        const minCount = parseInt(minPlatformFollowers);
        if (!isNaN(minCount)) {
          const platformAccount = creator.social_accounts.find(
            acc => acc.platform.toLowerCase() === followerPlatform.toLowerCase()
          );
          matchesAdvanced = matchesAdvanced && !!platformAccount && platformAccount.follower_count >= minCount;
        }
      }

      // Age filter
      if (ageRange[0] > 18 || ageRange[1] < 65) {
        const age = calculateAge(creator.birth_date);
        if (age !== null) {
          matchesAdvanced = matchesAdvanced && age >= ageRange[0] && age <= ageRange[1];
        }
      }

      // Gender filter
      if (selectedGenders.length > 0) {
        matchesAdvanced = matchesAdvanced && (creator.gender ? selectedGenders.includes(creator.gender) : false);
      }
    }

    return matchesSearch && matchesPlatform && matchesCategory && matchesAdvanced;
  });

  const getMainPlatform = (socialAccounts: CreatorWithDetails['social_accounts']) => {
    if (socialAccounts.length === 0) return { platform: "Creator", followers: 0 };
    const sorted = [...socialAccounts].sort((a, b) => b.follower_count - a.follower_count);
    return { platform: sorted[0].platform, followers: sorted[0].follower_count };
  };

  const getPriceRange = (services: CreatorWithDetails['services']) => {
    if (services.length === 0) return { min: 0, max: 0 };
    const prices = services.map(s => s.price_cents);
    return { 
      min: Math.min(...prices), 
      max: Math.max(...prices) 
    };
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

  const renderCreatorCard = (creator: CreatorWithDetails) => {
    const mainPlatform = getMainPlatform(creator.social_accounts);
    const priceRange = getPriceRange(creator.services);
    const PlatformIcon = getPlatformIcon(mainPlatform.platform);

    return (
      <Link
        key={creator.id}
        to={`/creator/${creator.id}`}
        className="group block"
      >
        <div className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-hover transition-all duration-300 hover:-translate-y-1">
          {/* Taller Image Container - 4:5 aspect ratio */}
          <div className="relative aspect-[4/5] overflow-hidden bg-muted">
            {/* Skeleton shown while image is loading */}
            {!failedImages.has(creator.id) && !loadedImages.has(creator.id) && (
              <Skeleton className="absolute inset-0 w-full h-full" />
            )}
            
            {!failedImages.has(creator.id) && loadedImages.has(creator.id) ? (
              <img 
                src={creator.profile_image_url!} 
                alt={creator.display_name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
              />
            ) : failedImages.has(creator.id) ? (
              <div className="absolute inset-0 bg-gradient-accent flex items-center justify-center">
                <span className="text-7xl font-heading font-bold text-white/30">
                  {creator.display_name.charAt(0)}
                </span>
              </div>
            ) : null}
            
            {/* Overlay badges on image */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* All Badges - Top Left (Collabstr-style) */}
            <div className="absolute top-3 left-3 right-12 flex flex-wrap items-center gap-1.5 z-10">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                <PlatformIcon className="h-3.5 w-3.5" />
                <span>{formatFollowers(mainPlatform.followers)}</span>
              </div>
              <VettedBadge variant="pill" size="sm" showTooltip={false} />
              {creator.is_featured && <FeaturedBadge variant="pill" size="sm" showTooltip={false} />}
              {isCreatorVIP(creator) && <VIPCreatorBadge variant="pill" size="sm" showTooltip={false} />}
              {creator.avg_response_minutes !== null && creator.avg_response_minutes <= 1440 && (
                <RespondsFastBadge variant="pill" size="sm" showTooltip={false} />
              )}
              {creator.open_to_invitations && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500 rounded-full text-white text-xs font-semibold">
                  <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse" />
                  Free Invites
                </span>
              )}
            </div>

            {/* Rating Badge - Top Right */}
            <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium">
              <Star className="h-3 w-3 fill-primary text-primary" />
              <span>{creator.average_rating ? Number(creator.average_rating).toFixed(1) : "5.0"}</span>
            </div>

            {/* Creator Info - Bottom Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="font-heading font-semibold text-lg text-white line-clamp-1">
                {creator.display_name}
              </h3>
              <p className="text-sm text-white/80 line-clamp-1">
                {creator.categories[0] || "Content Creator"}
              </p>
            </div>
          </div>

          {/* Price & Location Bar - All prices visible now */}
          <div className="p-4 flex items-center justify-between">
            <div>
              {priceRange.min > 0 ? (
                <DimmedPriceRange 
                  minPrice={priceRange.min}
                  maxPrice={priceRange.max}
                  canViewPrice={true} 
                  size="md"
                />
              ) : (
                <span className="text-sm text-muted-foreground">Contact</span>
              )}
            </div>
            <span className="text-xs text-muted-foreground truncate max-w-[100px]">
              {creator.location_country || "—"}
            </span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Book Creators for Events
            </h1>
            <p className="text-xl text-muted-foreground">
              Find verified creators available for live fan experiences at your location
            </p>
          </div>

          {/* Filters */}
          <div className="bg-card rounded-xl border border-border p-6 mb-4 shadow-card">
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

            <div className="mt-4">
              <Button
                variant={showAdvancedFilters ? "default" : "outline"}
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="gap-2"
              >
                <Filter className="h-4 w-4" />
                Advanced Filters
                {hasActiveAdvancedFilters && (
                  <Badge variant="secondary" className="ml-1 rounded-full h-5 w-5 p-0 flex items-center justify-center">
                    !
                  </Badge>
                )}
                {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Advanced Filters Panel - Now FREE for everyone */}
          {showAdvancedFilters && (
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Advanced Filters</CardTitle>
                  {hasActiveAdvancedFilters && (
                    <Button variant="ghost" size="sm" onClick={clearAdvancedFilters} className="gap-2">
                      <X className="h-4 w-4" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* LOCATION - Priority filter for event-based platform */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Location</Label>
                    <p className="text-sm text-muted-foreground">
                      Find creators near your venue
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Country</Label>
                        <Select 
                          value={selectedCountry} 
                          onValueChange={(value) => {
                            setSelectedCountry(value);
                            setSelectedState("");
                            setSelectedCity("");
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="All Countries" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Countries</SelectItem>
                            <SelectItem value="LB">Lebanon</SelectItem>
                            <SelectItem value="AE">UAE</SelectItem>
                            <SelectItem value="SA">Saudi Arabia</SelectItem>
                            <SelectItem value="KW">Kuwait</SelectItem>
                            <SelectItem value="QA">Qatar</SelectItem>
                            <SelectItem value="BH">Bahrain</SelectItem>
                            <SelectItem value="OM">Oman</SelectItem>
                            <SelectItem value="JO">Jordan</SelectItem>
                            <SelectItem value="EG">Egypt</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Region</Label>
                        <LocationSelect
                          type="state"
                          countryCode={selectedCountry === "all" ? "" : selectedCountry}
                          value={selectedState}
                          onChange={(value) => {
                            setSelectedState(value);
                            setSelectedCity("");
                          }}
                          disabled={selectedCountry === "all"}
                          placeholder="Select region"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">City</Label>
                        <LocationSelect
                          type="city"
                          countryCode={selectedCountry === "all" ? "" : selectedCountry}
                          stateFilter={selectedState}
                          value={selectedCity}
                          onChange={setSelectedCity}
                          disabled={selectedCountry === "all" || !selectedState}
                          placeholder="Select city"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Responds Fast Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-semibold flex items-center gap-2">
                        <Zap className="h-4 w-4 text-emerald-500" />
                        Responds Fast
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Show only creators who typically respond within 24 hours
                      </p>
                    </div>
                    <Switch
                      checked={respondsFast}
                      onCheckedChange={setRespondsFast}
                    />
                  </div>

                  <Separator />

                  {/* Top Rated Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-semibold flex items-center gap-2">
                        <Star className="h-4 w-4 text-primary" />
                        Top Rated
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Show only creators rated 4.0+ with at least 3 reviews
                      </p>
                    </div>
                    <Switch
                      checked={topRated}
                      onCheckedChange={setTopRated}
                    />
                  </div>

                  <Separator />

                  {/* Open to Free Invites Toggle */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base font-semibold flex items-center gap-2">
                        <Gift className="h-4 w-4 text-green-500" />
                        Open to Free Invites
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Show only creators accepting product-only or experience-based deals
                      </p>
                    </div>
                    <Switch
                      checked={openToFreeInvites}
                      onCheckedChange={setOpenToFreeInvites}
                    />
                  </div>

                  <Separator />

                  {/* Language */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Language</Label>
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

                  <Separator />

                  {/* Platform-Specific Followers */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Followers by Platform</Label>
                    <p className="text-sm text-muted-foreground">
                      Filter creators by minimum followers on a specific platform
                    </p>
                    <div className="flex flex-col md:flex-row gap-3">
                      <Select value={followerPlatform} onValueChange={(value) => {
                        setFollowerPlatform(value);
                        if (value === "all") setMinPlatformFollowers("");
                      }}>
                        <SelectTrigger className="w-full md:w-[200px]">
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Platforms</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="tiktok">TikTok</SelectItem>
                          <SelectItem value="youtube">YouTube</SelectItem>
                          <SelectItem value="twitter">Twitter</SelectItem>
                          <SelectItem value="twitch">Twitch</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        placeholder="Min followers (e.g., 10000)"
                        value={minPlatformFollowers}
                        onChange={(e) => setMinPlatformFollowers(e.target.value)}
                        disabled={followerPlatform === "all"}
                        className="w-full md:w-[200px]"
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Age Range - Demoted */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-base font-semibold">Age Range</Label>
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

                  <Separator />

                  {/* Gender - Demoted */}
                  <div className="space-y-3">
                    <Label className="text-base font-semibold">Gender</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {GENDERS.map((gender) => (
                        <div key={gender} className="flex items-center space-x-2">
                          <Checkbox
                            id={`gender-${gender}`}
                            checked={selectedGenders.includes(gender)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedGenders([...selectedGenders, gender]);
                              } else {
                                setSelectedGenders(selectedGenders.filter(g => g !== gender));
                              }
                            }}
                          />
                          <label htmlFor={`gender-${gender}`} className="text-sm cursor-pointer">
                            {gender}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Call to action for non-registered brands - hide from creators */}
          {authCheckComplete && !hasBrandProfile && !hasCreatorProfile && isLoggedIn && (
            <div className="mb-6">
              <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5 p-4 md:p-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Star className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Register your brand to book creators</p>
                      <p className="text-sm text-muted-foreground">
                        Free to register - Only pay 15% platform fee when you book events
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate('/brand-signup')}
                    className="gap-2 bg-primary hover:bg-primary/90 whitespace-nowrap"
                  >
                    <Calendar className="h-4 w-4" />
                    Register Your Brand
                  </Button>
                </div>
              </div>
            </div>
          )}

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
              {/* Sidebar Ad for Desktop */}
              <div className="hidden lg:block mb-6">
                <AdPlacement placementId="influencers_sidebar" className="h-48" />
              </div>

              {/* Creator Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredCreators.slice(0, 8).map(renderCreatorCard)}

                {/* Inline Ad 1 - After first 8 cards */}
                {filteredCreators.length > 8 && (
                  <div className="col-span-2 md:col-span-3 lg:col-span-4">
                    <AdPlacement placementId="influencers_inline_1" className="h-24 md:h-32" />
                  </div>
                )}

                {filteredCreators.slice(8, 16).map(renderCreatorCard)}

                {/* Inline Ad 2 - After 16 cards */}
                {filteredCreators.length > 16 && (
                  <div className="col-span-2 md:col-span-3 lg:col-span-4">
                    <AdPlacement placementId="influencers_inline_2" className="h-24 md:h-32" />
                  </div>
                )}

                {filteredCreators.slice(16).map(renderCreatorCard)}
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
