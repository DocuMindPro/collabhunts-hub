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
import { Search, Star, Instagram, Youtube, Play, Filter, X, ChevronDown, ChevronUp, Zap, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import UpgradePrompt from "@/components/UpgradePrompt";
import UpgradeBanner from "@/components/UpgradeBanner";
import { userHasAdvancedFilters, getBrandSubscription } from "@/lib/subscription-utils";
import AdPlacement from "@/components/AdPlacement";
import DimmedPrice from "@/components/DimmedPrice";
import UpgradeModal from "@/components/UpgradeModal";
import { canViewCreatorPricing, type PlanType } from "@/lib/stripe-mock";

interface CreatorWithDetails {
  id: string;
  display_name: string;
  profile_image_url: string | null;
  categories: string[];
  location_country: string | null;
  birth_date: string | null;
  gender: string | null;
  ethnicity: string | null;
  primary_language: string | null;
  secondary_languages: string[] | null;
  show_pricing_to_public: boolean | null;
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

const GENDERS = ["Male", "Female", "Non-binary"];
const ETHNICITIES = ["African American", "Asian", "Caucasian", "Hispanic/Latino", "Middle Eastern", "Mixed/Other"];
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
  
  // Advanced filters state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [hasAdvancedFilters, setHasAdvancedFilters] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [ageRange, setAgeRange] = useState([18, 65]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedEthnicities, setSelectedEthnicities] = useState<string[]>([]);
  const [currentPlan, setCurrentPlan] = useState<PlanType>("none");
  const [hasBrandProfile, setHasBrandProfile] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [followerPlatform, setFollowerPlatform] = useState("all");
  const [minPlatformFollowers, setMinPlatformFollowers] = useState("");

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
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    setCheckingSubscription(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
      if (user) {
        const canUseFilters = await userHasAdvancedFilters(user.id);
        setHasAdvancedFilters(canUseFilters);
        
        // Check brand profile and subscription
        const { data: brandProfile } = await supabase
          .from("brand_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        
        setHasBrandProfile(!!brandProfile);
        
        if (brandProfile) {
          const subscription = await getBrandSubscription(user.id);
          setCurrentPlan((subscription?.plan_type || "none") as PlanType);
        }
      } else {
        setHasAdvancedFilters(false);
        setHasBrandProfile(false);
        setCurrentPlan("none");
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      setHasAdvancedFilters(false);
    } finally {
      setCheckingSubscription(false);
    }
  };

  // Check if user can view a creator's pricing
  const canViewPrice = (creator: CreatorWithDetails): boolean => {
    // If creator allows public pricing, everyone can see
    if (creator.show_pricing_to_public !== false) return true;
    // Otherwise, only subscribed users can see
    return canViewCreatorPricing(currentPlan);
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

      const { data, error } = await supabase
        .from("creator_profiles")
        .select(`
          id,
          display_name,
          profile_image_url,
          categories,
          location_country,
          birth_date,
          gender,
          ethnicity,
          primary_language,
          secondary_languages,
          show_pricing_to_public,
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
        location_country: creator.location_country,
        birth_date: creator.birth_date,
        gender: creator.gender,
        ethnicity: creator.ethnicity,
        primary_language: creator.primary_language,
        secondary_languages: creator.secondary_languages,
        show_pricing_to_public: creator.show_pricing_to_public,
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

  const hasActiveAdvancedFilters = ageRange[0] > 18 || ageRange[1] < 65 || 
    selectedGenders.length > 0 || selectedEthnicities.length > 0 || selectedLanguage !== "all" ||
    (followerPlatform !== "all" && minPlatformFollowers !== "");

  const clearAdvancedFilters = () => {
    setAgeRange([18, 65]);
    setSelectedGenders([]);
    setSelectedEthnicities([]);
    setSelectedLanguage("all");
    setFollowerPlatform("all");
    setMinPlatformFollowers("");
  };

  const filteredCreators = creators.filter((creator) => {
    const matchesSearch = searchQuery === "" || 
      creator.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPlatform = selectedPlatform === "all" ||
      creator.social_accounts.some(acc => acc.platform.toLowerCase() === selectedPlatform.toLowerCase());

    const matchesCategory = selectedCategory === "all" ||
      creator.categories.some(cat => cat.toLowerCase() === selectedCategory.toLowerCase().replace(" categories", ""));

    // Advanced filters (only apply if user has access)
    let matchesAdvanced = true;
    if (hasAdvancedFilters && hasActiveAdvancedFilters) {
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

      // Ethnicity filter
      if (selectedEthnicities.length > 0) {
        matchesAdvanced = matchesAdvanced && (creator.ethnicity ? selectedEthnicities.includes(creator.ethnicity) : false);
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
    }

    return matchesSearch && matchesPlatform && matchesCategory && matchesAdvanced;
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
                {hasActiveAdvancedFilters && hasAdvancedFilters && (
                  <Badge variant="secondary" className="ml-1 rounded-full h-5 w-5 p-0 flex items-center justify-center">
                    !
                  </Badge>
                )}
                {showAdvancedFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Advanced Filters</CardTitle>
                  {hasAdvancedFilters && hasActiveAdvancedFilters && (
                    <Button variant="ghost" size="sm" onClick={clearAdvancedFilters} className="gap-2">
                      <X className="h-4 w-4" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!hasAdvancedFilters && !checkingSubscription ? (
                  <UpgradePrompt feature="filters" inline />
                ) : checkingSubscription ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Age Range */}
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

                    {/* Gender */}
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

                    <Separator />

                    {/* Ethnicity */}
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">Ethnicity</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {ETHNICITIES.map((ethnicity) => (
                          <div key={ethnicity} className="flex items-center space-x-2">
                            <Checkbox
                              id={`ethnicity-${ethnicity}`}
                              checked={selectedEthnicities.includes(ethnicity)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedEthnicities([...selectedEthnicities, ethnicity]);
                                } else {
                                  setSelectedEthnicities(selectedEthnicities.filter(e => e !== ethnicity));
                                }
                              }}
                            />
                            <label htmlFor={`ethnicity-${ethnicity}`} className="text-sm cursor-pointer">
                              {ethnicity}
                            </label>
                          </div>
                        ))}
                      </div>
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
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Top Upsell Banner for brands on free/basic plans */}
          {hasBrandProfile && (currentPlan === "none" || currentPlan === "basic") && (
            <div className="mb-6">
              <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/5 p-4 md:p-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {currentPlan === "none" ? "Upgrade to chat with creators" : "Upgrade to Pro for advanced filters"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {currentPlan === "none" 
                          ? "Start at $39/mo - Plus get 10GB content library storage" 
                          : "Filter by age, ethnicity, language + save favorites & post campaigns"}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate('/brand-dashboard?tab=subscription')}
                    className="gap-2 bg-primary hover:bg-primary/90 whitespace-nowrap"
                  >
                    <Zap className="h-4 w-4" />
                    {currentPlan === "none" ? "Get Basic - $39/mo" : "Get Pro - $99/mo"}
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

              {/* Collabstr-style Grid - 4 columns, taller cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredCreators.slice(0, 8).map((creator) => {
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
                                <DimmedPrice 
                                  price={lowestPrice} 
                                  canViewPrice={canViewPrice(creator)} 
                                  size="md"
                                  onClick={() => setIsPricingModalOpen(true)}
                                />
                                <span className="text-xs text-muted-foreground">+</span>
                              </div>
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
                })}

                {/* Inline Ad 1 - After first 8 cards */}
                {filteredCreators.length > 8 && (
                  <div className="col-span-2 md:col-span-3 lg:col-span-4">
                    <AdPlacement placementId="influencers_inline_1" className="h-24 md:h-32" />
                  </div>
                )}

                {/* Rest of the creators */}
                {filteredCreators.slice(8, 16).map((creator) => {
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
                        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
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
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                            <PlatformIcon className="h-3.5 w-3.5" />
                            <span>{formatFollowers(mainPlatform.followers)}</span>
                          </div>

                          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium">
                            <Star className="h-3 w-3 fill-primary text-primary" />
                            <span>5.0</span>
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="font-heading font-semibold text-lg text-white mb-0.5 line-clamp-1">
                              {creator.display_name}
                            </h3>
                            <p className="text-sm text-white/80 line-clamp-1">
                              {creator.categories[0] || "Content Creator"}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 flex items-center justify-between">
                          <div>
                            {lowestPrice > 0 ? (
                              <div className="flex items-baseline gap-1">
                                <DimmedPrice 
                                  price={lowestPrice} 
                                  canViewPrice={canViewPrice(creator)} 
                                  size="md"
                                  onClick={() => setIsPricingModalOpen(true)}
                                />
                                <span className="text-xs text-muted-foreground">+</span>
                              </div>
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
                })}

                {/* Inline Ad 2 - After 16 cards */}
                {filteredCreators.length > 16 && (
                  <div className="col-span-2 md:col-span-3 lg:col-span-4">
                    <AdPlacement placementId="influencers_inline_2" className="h-24 md:h-32" />
                  </div>
                )}

                {/* Remaining creators */}
                {filteredCreators.slice(16).map((creator) => {
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
                        <div className="relative aspect-[4/5] overflow-hidden bg-muted">
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
                          
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          
                          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                            <PlatformIcon className="h-3.5 w-3.5" />
                            <span>{formatFollowers(mainPlatform.followers)}</span>
                          </div>

                          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium">
                            <Star className="h-3 w-3 fill-primary text-primary" />
                            <span>5.0</span>
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="font-heading font-semibold text-lg text-white mb-0.5 line-clamp-1">
                              {creator.display_name}
                            </h3>
                            <p className="text-sm text-white/80 line-clamp-1">
                              {creator.categories[0] || "Content Creator"}
                            </p>
                          </div>
                        </div>

                        <div className="p-4 flex items-center justify-between">
                          <div>
                            {lowestPrice > 0 ? (
                              <div className="flex items-baseline gap-1">
                                <DimmedPrice 
                                  price={lowestPrice} 
                                  canViewPrice={canViewPrice(creator)} 
                                  size="md"
                                  onClick={() => setIsPricingModalOpen(true)}
                                />
                                <span className="text-xs text-muted-foreground">+</span>
                              </div>
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

      <UpgradeModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        feature="pricing"
      />
    </div>
  );
};

export default Influencers;