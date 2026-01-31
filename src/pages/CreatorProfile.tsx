import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star, Instagram, Youtube, Twitter, Play, Image as ImageIcon, Images, MessageCircle, Lock, Heart } from "lucide-react";
import { useSaveCreator } from "@/hooks/useSaveCreator";
import BookingDialog from "@/components/BookingDialog";
import MessageDialog from "@/components/MessageDialog";
import PortfolioGalleryModal from "@/components/PortfolioGalleryModal";
import MobilePortfolioCarousel from "@/components/MobilePortfolioCarousel";
import { useIsMobile } from "@/hooks/use-mobile";
import { SUBSCRIPTION_PLANS, type PlanType } from "@/lib/stripe-mock";
import UpgradePrompt from "@/components/UpgradePrompt";
import DimmedPrice from "@/components/DimmedPrice";
import UpgradeModal from "@/components/UpgradeModal";
interface CreatorData {
  id: string;
  user_id: string;
  display_name: string;
  profile_image_url: string | null;
  cover_image_url: string | null;
  cover_image_url_2: string | null;
  cover_image_url_3: string | null;
  bio: string | null;
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  categories: string[];
  show_pricing_to_public: boolean;
  open_to_invitations: boolean;
  social_accounts: Array<{
    platform: string;
    username: string;
    follower_count: number;
    profile_url: string | null;
  }>;
  services: Array<{
    id: string;
    service_type: string;
    price_cents: number;
    description: string | null;
    delivery_days: number;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    review_text: string | null;
    created_at: string;
    brand_profiles: {
      company_name: string;
    };
  }>;
  avgRating: number;
  totalReviews: number;
  portfolio_media: Array<{
    id: string;
    media_type: "image" | "video";
    url: string;
    thumbnail_url: string | null;
  }>;
}

const CreatorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [creator, setCreator] = useState<CreatorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [failedPortfolioImages, setFailedPortfolioImages] = useState<Set<number>>(new Set());
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [canContactCreators, setCanContactCreators] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [canViewPrice, setCanViewPrice] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  
  const { isSaved, loading: saveLoading, toggleSave, hasBrandProfile, canUseCRM } = useSaveCreator(id);

  const handleBookService = (service: any) => {
    setSelectedService(service);
    setIsBookingDialogOpen(true);
  };

  const handleContactCreator = async (service?: { service_type: string; price_cents: number; delivery_days: number }) => {
    try {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Login Required",
          description: "Please login to message creators",
          variant: "destructive"
        });
        navigate("/login");
        return;
      }

      // Check if user is admin
      const { data: adminCheck } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      // Check if user has a brand profile
      let { data: brandProfile } = await supabase
        .from("brand_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      // If admin without brand profile, auto-create one
      if (adminCheck && !brandProfile) {
        const { data: newBrandProfile, error: createError } = await supabase
          .from("brand_profiles")
          .insert({
            user_id: user.id,
            company_name: "CollabHunts Admin"
          })
          .select("id")
          .single();

        if (createError) {
          console.error("Error creating admin brand profile:", createError);
          toast({
            title: "Error",
            description: "Failed to create admin profile",
            variant: "destructive"
          });
          return;
        }
        brandProfile = newBrandProfile;
      }

      if (!brandProfile) {
        toast({
          title: "Brand Profile Required",
          description: "Please create a brand profile to message creators",
          variant: "destructive"
        });
        navigate("/brand-signup");
        return;
      }

      // Check subscription allows contact (unless admin)
      if (!adminCheck) {
        const { data: subscription } = await supabase
          .from("brand_subscriptions")
          .select("plan_type")
          .eq("brand_profile_id", brandProfile.id)
          .eq("status", "active")
          .maybeSingle();

        const planType = (subscription?.plan_type || "basic") as PlanType;
        if (!SUBSCRIPTION_PLANS[planType].canContactCreators) {
          toast({
            title: "Upgrade Required",
            description: "Upgrade to Pro to message creators",
            variant: "destructive"
          });
          navigate("/brand-dashboard?tab=subscription");
          return;
        }
      }

      // Build URL params for package context
      let packageParams = "";
      if (service) {
        const packageData = encodeURIComponent(JSON.stringify({
          service_type: service.service_type,
          price_cents: service.price_cents,
          delivery_days: service.delivery_days,
          creator_name: creator?.display_name
        }));
        packageParams = `&package=${packageData}`;
      }

      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from("conversations")
        .select("id")
        .eq("brand_profile_id", brandProfile.id)
        .eq("creator_profile_id", id)
        .single();

      if (existingConversation) {
        // Navigate to messages tab with conversation
        navigate(`/brand-dashboard?tab=messages&conversation=${existingConversation.id}${packageParams}`);
        return;
      }

      // Create new conversation
      const { data: newConversation, error: conversationError } = await supabase
        .from("conversations")
        .insert({
          brand_profile_id: brandProfile.id,
          creator_profile_id: id
        })
        .select("id")
        .single();

      if (conversationError) throw conversationError;

      // Navigate to messages tab with new conversation
      navigate(`/brand-dashboard?tab=messages&conversation=${newConversation.id}${packageParams}`);

    } catch (error: any) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to start conversation",
        variant: "destructive"
      });
    }
  };

  const openGallery = (index: number) => {
    setGalleryStartIndex(index);
    setIsGalleryOpen(true);
  };

  useEffect(() => {
    if (id) {
      fetchCreatorProfile(id);
      trackProfileView(id);
    }
  }, [id]);

  // Pre-validate avatar image
  useEffect(() => {
    if (creator?.profile_image_url && !avatarFailed) {
      const img = new Image();
      const timeoutId = setTimeout(() => {
        setAvatarFailed(true);
      }, 5000);
      
      img.onload = () => {
        clearTimeout(timeoutId);
      };
      img.onerror = () => {
        clearTimeout(timeoutId);
        setAvatarFailed(true);
      };
      img.src = creator.profile_image_url;
    } else if (creator && !creator.profile_image_url) {
      setAvatarFailed(true);
    }
  }, [creator?.profile_image_url]);

  // Pre-validate portfolio images
  useEffect(() => {
    if (creator?.portfolio_media) {
      creator.portfolio_media.forEach((media, index) => {
        if (media.media_type === "image" && !failedPortfolioImages.has(index)) {
          const img = new Image();
          const timeoutId = setTimeout(() => {
            setFailedPortfolioImages(prev => new Set(prev).add(index));
          }, 5000);
          
          img.onload = () => {
            clearTimeout(timeoutId);
          };
          img.onerror = () => {
            clearTimeout(timeoutId);
            setFailedPortfolioImages(prev => new Set(prev).add(index));
          };
          img.src = media.url;
        }
      });
    }
  }, [creator?.portfolio_media]);

  const trackProfileView = async (creatorId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("profile_views")
        .insert({
          creator_profile_id: creatorId,
          viewer_id: user?.id || null,
        });

      if (error && !error.message.includes("duplicate")) {
        console.error("Error tracking view:", error);
      }
    } catch (error) {
      console.error("Error tracking view:", error);
    }
  };

  const fetchCreatorProfile = async (creatorId: string) => {
    try {
      setLoading(true);

      const { data: profileData, error: profileError } = await supabase
        .from("creator_profiles")
        .select("*")
        .eq("id", creatorId)
        .eq("status", "approved")
        .single();

      if (profileError) throw profileError;

      // Check if this is the creator's own profile and determine price visibility
      const { data: { user } } = await supabase.auth.getUser();
      const isOwn = user && profileData.user_id === user.id;
      setIsOwnProfile(!!isOwn);
      
      // Determine if user can view price
      // Price is visible if: creator allows public pricing, OR user is the creator, OR user has active subscription
      let priceVisible = profileData.show_pricing_to_public !== false; // Default true if null
      
      if (!priceVisible && user && !isOwn) {
        // Check if user has an active brand subscription
        const { data: brandProfile } = await supabase
          .from("brand_profiles")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
          
        if (brandProfile) {
          const { data: subscription } = await supabase
            .from("brand_subscriptions")
            .select("plan_type")
            .eq("brand_profile_id", brandProfile.id)
            .eq("status", "active")
            .maybeSingle();
            
          if (subscription) {
            priceVisible = true;
          }
        }
        
        // Also check if admin
        const { data: adminCheck } = await supabase.rpc('has_role', {
          _user_id: user.id,
          _role: 'admin'
        });
        if (adminCheck) {
          priceVisible = true;
        }
      }
      
      if (isOwn) {
        priceVisible = true; // Creators can always see their own prices
      }
      
      setCanViewPrice(priceVisible);

      const { data: socialData } = await supabase
        .from("creator_social_accounts")
        .select("*")
        .eq("creator_profile_id", creatorId);

      const { data: servicesData } = await supabase
        .from("creator_services")
        .select("id, service_type, price_cents, description, delivery_days")
        .eq("creator_profile_id", creatorId)
        .eq("is_active", true);

      const { data: reviewsData } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          review_text,
          created_at,
          brand_profiles(company_name)
        `)
        .eq("creator_profile_id", creatorId)
        .order("created_at", { ascending: false });

      const { data: portfolioData } = await supabase
        .from("creator_portfolio_media")
        .select("id, media_type, url, thumbnail_url")
        .eq("creator_profile_id", creatorId)
        .order("display_order", { ascending: true });

      const reviews = reviewsData || [];
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 5.0;

      setCreator({
        id: profileData.id,
        user_id: profileData.user_id,
        display_name: profileData.display_name,
        profile_image_url: profileData.profile_image_url,
        cover_image_url: profileData.cover_image_url,
        cover_image_url_2: profileData.cover_image_url_2,
        cover_image_url_3: profileData.cover_image_url_3,
        bio: profileData.bio,
        location_city: profileData.location_city,
        location_state: profileData.location_state,
        location_country: profileData.location_country,
        categories: profileData.categories,
        show_pricing_to_public: profileData.show_pricing_to_public !== false,
        open_to_invitations: profileData.open_to_invitations ?? false,
        social_accounts: socialData || [],
        services: servicesData || [],
        reviews,
        avgRating,
        totalReviews: reviews.length,
        portfolio_media: (portfolioData || []).map(p => ({
          ...p,
          media_type: p.media_type as "image" | "video"
        }))
      });
    } catch (error: any) {
      console.error("Error fetching creator:", error.message);
    } finally {
      setLoading(false);
    }
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
      case "twitter": return Twitter;
      default: return Instagram;
    }
  };

  // Package info helpers for services display
  const getPackageInfo = (packageType: string) => {
    const packages: Record<string, { name: string; description: string; duration?: string; phases?: Array<{ title: string; items: string[] }> }> = {
      unbox_review: {
        name: 'Unbox & Review',
        description: 'Authentic unboxing and review from home',
        phases: [
          { title: 'Product Delivery', items: ['Brand ships product', 'Creator confirms receipt'] },
          { title: 'Content Created', items: ['1 Reel/TikTok', '2-3 Stories', 'Brand tagged'] },
        ],
      },
      social_boost: {
        name: 'Social Boost',
        description: 'Creator visits venue and creates engaging content',
        duration: '1-2 hours',
        phases: [
          { title: 'During Visit', items: ['Venue visit', 'Content capture', 'Try product/service'] },
          { title: 'Content Delivered', items: ['1 Reel + 1 TikTok', '3 Stories', 'Honest review'] },
        ],
      },
      meet_greet: {
        name: 'Meet & Greet',
        description: 'Creator appearance with promotional coverage',
        duration: '2-4 hours',
        phases: [
          { title: 'Pre-Event', items: ['1-week promotion', 'Announcement content'] },
          { title: 'During Event', items: ['Fan interaction', 'Photos with attendees'] },
        ],
      },
      competition: {
        name: 'Live PK Battle',
        description: 'Live PK battles at your venue',
        duration: '2-6 hours',
        phases: [
          { title: 'Pre-Event', items: ['Ticket promotion', 'Creator lineup reveal'] },
          { title: 'During Event', items: ['Live battles', 'In-person audience'] },
        ],
      },
      custom: {
        name: 'Custom Experience',
        description: 'Tailored experience for your specific needs',
        phases: [
          { title: 'Customized', items: ['Tailored deliverables', 'Flexible timeline'] },
        ],
      },
    };
    return packages[packageType] || { name: packageType.replace(/_/g, ' '), description: '' };
  };

  const getPackageIcon = (packageType: string) => {
    // Return appropriate icon based on package type
    switch (packageType) {
      case 'unbox_review':
        return <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>;
      case 'social_boost':
        return <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
      case 'meet_greet':
        return <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
      case 'competition':
        return <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>;
      default:
        return <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-heading font-bold mb-4">Creator Not Found</h1>
            <p className="text-muted-foreground mb-8">This creator profile doesn't exist or isn't available.</p>
            <Link to="/influencers">
              <Button className="gradient-hero hover:opacity-90">Browse Creators</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 py-0 md:py-8 pb-24 md:pb-8">
        {/* Mobile: Collabstr-style swipeable hero carousel */}
        {isMobile && (
          <MobilePortfolioCarousel
            media={creator.portfolio_media}
            coverImageUrl={creator.cover_image_url}
            coverImageUrl2={creator.cover_image_url_2}
            coverImageUrl3={creator.cover_image_url_3}
            profileImageUrl={creator.profile_image_url}
            displayName={creator.display_name}
            onSlideClick={(index) => {
              if (index >= 0) openGallery(index);
            }}
            avatarFailed={avatarFailed}
          />
        )}

        <div className="container mx-auto px-4 max-w-6xl">
          
          {/* Desktop: Collabstr-style 3 equal cover photos */}
          {!isMobile && (() => {
            const coverImages = [
              creator.cover_image_url,
              creator.cover_image_url_2,
              creator.cover_image_url_3
            ].filter(Boolean) as string[];
            
            if (coverImages.length === 0) return null;
            
            return (
              <div className="mb-8">
                <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden">
                  {coverImages.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => openGallery(index)}
                      className="relative overflow-hidden group"
                      style={{ aspectRatio: "4/5" }}
                    >
                      <img 
                        src={url}
                        alt={`Cover ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Show All Photos button on last image if more portfolio items exist */}
                      {index === coverImages.length - 1 && creator.portfolio_media.length > 0 && (
                        <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
                          <Images className="h-4 w-4" />
                          <span className="text-sm font-medium">Show All Photos</span>
                        </div>
                      )}
                    </button>
                  ))}
                  {/* Fill empty slots with placeholders to maintain 3-column grid */}
                  {coverImages.length < 3 && Array.from({ length: 3 - coverImages.length }).map((_, i) => (
                    <div 
                      key={`placeholder-${i}`}
                      className="bg-muted flex items-center justify-center rounded-lg"
                      style={{ aspectRatio: "4/5" }}
                    >
                      <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Creator Info Section - Below Gallery */}
          <div className="mb-8 mt-6 md:mt-0">
            {/* Mobile: Simplified info (no duplicate avatar) */}
            {isMobile ? (
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-heading font-bold">
                    {creator.display_name}
                  </h1>
                  <div className="flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-full">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="font-semibold text-sm">{creator.avgRating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({creator.totalReviews})</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">
                    {creator.location_country || "Location not specified"}
                  </span>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                  {creator.categories.map((category) => (
                    <Badge key={category} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>

                {creator.bio && (
                  <p className="text-muted-foreground text-sm px-4">{creator.bio}</p>
                )}

                {/* Mobile Edit Profile button for own profile */}
                {isOwnProfile && (
                  <div className="mt-2">
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/creator-dashboard?tab=profile')}
                    >
                      Edit Profile
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              /* Desktop: Original layout with avatar */
              <div className="flex flex-row items-start gap-4 text-left">
                {/* Avatar with Open to Invitations ring */}
                <div className="relative flex-shrink-0">
                  <Avatar className={`h-28 w-28 border-4 border-background shadow-lg ${creator.open_to_invitations ? 'ring-[3px] ring-green-500 ring-offset-2 ring-offset-background' : ''}`}>
                    {creator.profile_image_url && !avatarFailed ? (
                      <AvatarImage 
                        src={creator.profile_image_url} 
                        className="object-cover" 
                        onError={() => setAvatarFailed(true)}
                      />
                    ) : null}
                    <AvatarFallback className="text-3xl bg-gradient-accent text-white">
                      {creator.display_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Open to Invitations badge */}
                  {creator.open_to_invitations && (
                    <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 hover:bg-green-500 text-white text-[9px] px-2 py-0.5 whitespace-nowrap border-2 border-background">
                      Open to Invites
                    </Badge>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-start gap-3 flex-wrap mb-2">
                    <h1 className="text-3xl font-heading font-bold">
                      {creator.display_name}
                    </h1>
                    <div className="flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-full">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="font-semibold text-sm">{creator.avgRating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">({creator.totalReviews})</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-start gap-2 text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="text-sm">
                      {[creator.location_city, creator.location_state, creator.location_country]
                        .filter(Boolean)
                        .join(", ") || "Location not specified"}
                    </span>
                  </div>

                  <div className="flex flex-wrap justify-start gap-2 mb-4">
                    {creator.categories.map((category) => (
                      <Badge key={category} variant="secondary">
                        {category}
                      </Badge>
                    ))}
                  </div>

                  {creator.bio && (
                    <p className="text-muted-foreground max-w-2xl">{creator.bio}</p>
                  )}

                  {/* Message Creator Button - Under bio, above Social Media (hide on own profile) */}
                  <div className="mt-4">
                    {isOwnProfile ? (
                      <Button 
                        size="lg"
                        variant="outline"
                        onClick={() => navigate('/creator-dashboard?tab=profile')}
                      >
                        Edit Profile
                      </Button>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Button 
                          size="lg"
                          className="gradient-hero hover:opacity-90"
                          onClick={() => handleContactCreator()}
                        >
                          <MessageCircle className="h-5 w-5 mr-2" />
                          Message Creator
                        </Button>
                        {hasBrandProfile && (
                          <Button
                            size="lg"
                            variant="outline"
                            onClick={toggleSave}
                            disabled={saveLoading}
                            className="px-4"
                            title={canUseCRM ? (isSaved ? "Remove from saved" : "Save creator") : "Upgrade to Pro to save creators"}
                          >
                            <Heart 
                              className={`h-5 w-5 ${isSaved ? 'fill-primary text-primary' : ''}`} 
                            />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-8">
              {/* Social Accounts */}
              <Card>
                <CardHeader>
                  <CardTitle>Social Media Presence</CardTitle>
                  <CardDescription>Connect with me on these platforms</CardDescription>
                </CardHeader>
                <CardContent>
                  {creator.social_accounts.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No social accounts linked yet
                    </p>
                  ) : (
                    <div className="grid gap-4">
                      {creator.social_accounts.map((account, index) => {
                        const Icon = getPlatformIcon(account.platform);
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-muted rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-background rounded-lg">
                                <Icon className="h-6 w-6 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium capitalize">{account.platform}</p>
                                <p className="text-sm text-muted-foreground">
                                  @{account.username} • {formatFollowers(account.follower_count)} followers
                                </p>
                              </div>
                            </div>
                            {account.profile_url && (
                              <a
                                href={account.profile_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-sm"
                              >
                                Visit Profile
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Reviews */}
              {creator.reviews.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Reviews ({creator.totalReviews})</CardTitle>
                    <CardDescription>What brands say about working with {creator.display_name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {creator.reviews.slice(0, 5).map((review) => (
                        <div key={review.id} className="border-b last:border-0 pb-4 last:pb-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold">{review.brand_profiles.company_name}</p>
                              <div className="flex gap-1 my-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= review.rating
                                        ? "fill-primary text-primary"
                                        : "text-muted-foreground"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(review.created_at), "MMM dd, yyyy")}
                            </span>
                          </div>
                          {review.review_text && (
                            <p className="text-sm text-muted-foreground">{review.review_text}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Services & Pricing - Using Package Cards */}
              <Card>
                <CardHeader>
                  <CardTitle>Event Packages</CardTitle>
                  <CardDescription>Available experiences you can book with {creator.display_name}</CardDescription>
                </CardHeader>
                <CardContent>
                  {creator.services.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No packages available yet
                    </p>
                  ) : (
                    <div className="grid gap-4">
                      {creator.services.map((service, index) => {
                        const packageType = service.service_type as any;
                        const packageInfo = getPackageInfo(packageType);
                        
                        return (
                          <div
                            key={index}
                            className="border rounded-lg p-5 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-4 mb-4">
                              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                {getPackageIcon(packageType)}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-heading font-semibold text-lg">
                                  {packageInfo.name}
                                </h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {packageInfo.description}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                {packageType === 'competition' ? (
                                  <p className="text-lg font-semibold text-muted-foreground">Contact for pricing</p>
                                ) : (
                                  <DimmedPrice 
                                    price={service.price_cents} 
                                    canViewPrice={canViewPrice} 
                                    size="lg"
                                    onClick={() => setIsPricingModalOpen(true)}
                                  />
                                )}
                                {packageInfo.duration && (
                                  <Badge variant="outline" className="mt-1 text-xs">
                                    {packageInfo.duration}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Show package phases/deliverables */}
                            {packageInfo.phases && packageInfo.phases.length > 0 && (
                              <div className="bg-muted/50 rounded-lg p-3 mb-4">
                                <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">What's Included</p>
                                <div className="space-y-2">
                                  {packageInfo.phases.slice(0, 2).map((phase: any, phaseIdx: number) => (
                                    <div key={phaseIdx}>
                                      <p className="text-xs font-medium text-foreground">{phase.title}</p>
                                      <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                                        {phase.items.slice(0, 3).map((item: string, itemIdx: number) => (
                                          <li key={itemIdx} className="flex items-center gap-1.5">
                                            <span className="h-1 w-1 rounded-full bg-primary flex-shrink-0" />
                                            {item}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {!isOwnProfile && (
                              <Button 
                                className="w-full gradient-hero hover:opacity-90"
                                onClick={() => handleBookService(service)}
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Inquire About This Package
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total Reach</p>
                    <p className="text-2xl font-heading font-bold">
                      {formatFollowers(
                        creator.social_accounts.reduce((sum, acc) => sum + acc.follower_count, 0)
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Platforms</p>
                    <p className="text-2xl font-heading font-bold">
                      {creator.social_accounts.length}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Starting Price</p>
                    {creator.services.length > 0 ? (
                      <DimmedPrice 
                        price={Math.min(...creator.services.map(s => s.price_cents))} 
                        canViewPrice={canViewPrice} 
                        size="lg"
                        onClick={() => setIsPricingModalOpen(true)}
                      />
                    ) : (
                      <p className="text-2xl font-heading font-bold text-muted-foreground">
                        N/A
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </main>

      {/* Mobile Floating Contact Button (hide on own profile and when no services) */}
      {!isOwnProfile && creator.services.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent md:hidden z-50">
          <div className="flex items-center gap-2">
            <Button 
              size="lg"
              className="flex-1 gradient-hero hover:opacity-90 shadow-lg"
              onClick={() => {
                const lowestService = creator.services.reduce((min, s) => 
                  s.price_cents < min.price_cents ? s : min, creator.services[0]);
                if (lowestService) handleBookService(lowestService);
              }}
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Book Creator
            </Button>
            {hasBrandProfile && (
              <Button
                size="lg"
                variant="outline"
                onClick={toggleSave}
                disabled={saveLoading}
                className="px-4 bg-background shadow-lg"
                title={canUseCRM ? (isSaved ? "Remove from saved" : "Save creator") : "Upgrade to Pro to save creators"}
              >
                <Heart 
                  className={`h-5 w-5 ${isSaved ? 'fill-primary text-primary' : ''}`} 
                />
              </Button>
            )}
          </div>
        </div>
      )}

      <Footer />

      <BookingDialog
        isOpen={isBookingDialogOpen}
        onClose={() => {
          setIsBookingDialogOpen(false);
          setSelectedService(null);
        }}
        service={selectedService}
        creatorProfileId={id || ""}
      />

      <MessageDialog
        isOpen={isMessageDialogOpen}
        onClose={() => setIsMessageDialogOpen(false)}
        conversationId={conversationId}
        recipientName={creator.display_name}
      />

      <PortfolioGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        media={creator.portfolio_media}
        creatorName={creator.display_name}
        initialIndex={galleryStartIndex}
      />

      <UpgradeModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        feature="pricing"
      />
    </div>
  );
};

export default CreatorProfile;