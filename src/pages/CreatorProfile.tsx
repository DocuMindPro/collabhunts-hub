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
import { MapPin, Star, Instagram, Youtube, Twitter, Play, Image as ImageIcon, Images, MessageCircle } from "lucide-react";
import BookingDialog from "@/components/BookingDialog";
import MessageDialog from "@/components/MessageDialog";
import PortfolioGalleryModal from "@/components/PortfolioGalleryModal";

interface CreatorData {
  id: string;
  display_name: string;
  profile_image_url: string | null;
  bio: string | null;
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  categories: string[];
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

  const handleBookService = (service: any) => {
    setSelectedService(service);
    setIsBookingDialogOpen(true);
  };

  const handleContactCreator = async () => {
    try {
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Login Required",
          description: "Please login to contact creators",
          variant: "destructive"
        });
        navigate("/login");
        return;
      }

      // Check if user has a brand profile
      const { data: brandProfile, error: brandError } = await supabase
        .from("brand_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (brandError || !brandProfile) {
        toast({
          title: "Brand Profile Required",
          description: "Please create a brand profile to contact creators",
          variant: "destructive"
        });
        navigate("/brand-signup");
        return;
      }

      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from("conversations")
        .select("id")
        .eq("brand_profile_id", brandProfile.id)
        .eq("creator_profile_id", id)
        .single();

      if (existingConversation) {
        // Open dialog with existing conversation
        setConversationId(existingConversation.id);
        setIsMessageDialogOpen(true);
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

      // Open dialog with new conversation
      setConversationId(newConversation.id);
      setIsMessageDialogOpen(true);

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
        display_name: profileData.display_name,
        profile_image_url: profileData.profile_image_url,
        bio: profileData.bio,
        location_city: profileData.location_city,
        location_state: profileData.location_state,
        location_country: profileData.location_country,
        categories: profileData.categories,
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

      <main className="flex-1 py-8 pb-24 md:pb-8">
        <div className="container mx-auto px-4 max-w-6xl">
          
          {/* Large Portfolio Gallery at Top - Collabstr Style */}
          {creator.portfolio_media.length > 0 && (
            <div className="mb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 rounded-2xl overflow-hidden" style={{ height: "clamp(250px, 40vh, 500px)" }}>
                {/* Main Large Image - Takes 2 columns and full height */}
                <button
                  onClick={() => openGallery(0)}
                  className="col-span-2 row-span-2 relative overflow-hidden group"
                >
                {creator.portfolio_media[0]?.media_type === "image" ? (
                    failedPortfolioImages.has(0) ? (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    ) : (
                      <img 
                        src={creator.portfolio_media[0]?.url} 
                        alt="Portfolio"
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={() => setFailedPortfolioImages(prev => new Set(prev).add(0))}
                      />
                    )
                  ) : (
                    <div className="relative w-full h-full">
                      <video src={creator.portfolio_media[0]?.url} className="w-full h-full object-cover" muted />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                    </div>
                  )}
                </button>

                {/* Second Image - Top Right */}
                {creator.portfolio_media[1] && (
                  <button
                    onClick={() => openGallery(1)}
                    className="col-span-2 relative overflow-hidden group"
                  >
                  {creator.portfolio_media[1].media_type === "image" ? (
                      failedPortfolioImages.has(1) ? (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      ) : (
                        <img 
                          src={creator.portfolio_media[1].url} 
                          alt="Portfolio"
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={() => setFailedPortfolioImages(prev => new Set(prev).add(1))}
                        />
                      )
                    ) : (
                      <div className="relative w-full h-full">
                        <video src={creator.portfolio_media[1].url} className="w-full h-full object-cover" muted />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    )}
                  </button>
                )}

                {/* Third Image - Bottom Right, with "Show All" overlay if more images */}
                {creator.portfolio_media[2] && (
                  <button
                    onClick={() => openGallery(2)}
                    className="col-span-2 relative overflow-hidden group"
                  >
                  {creator.portfolio_media[2].media_type === "image" ? (
                      failedPortfolioImages.has(2) ? (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      ) : (
                        <img 
                          src={creator.portfolio_media[2].url} 
                          alt="Portfolio"
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={() => setFailedPortfolioImages(prev => new Set(prev).add(2))}
                        />
                      )
                    ) : (
                      <div className="relative w-full h-full">
                        <video src={creator.portfolio_media[2].url} className="w-full h-full object-cover" muted />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    )}
                    
                    {/* Show All Photos Overlay */}
                    {creator.portfolio_media.length > 3 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/60 transition-colors">
                        <div className="text-white text-center">
                          <Images className="h-8 w-8 mx-auto mb-2" />
                          <span className="font-medium">+{creator.portfolio_media.length - 3} more</span>
                        </div>
                      </div>
                    )}
                  </button>
                )}

                {/* Fill empty slots if less than 3 images */}
                {creator.portfolio_media.length === 1 && (
                  <>
                    <div className="col-span-2 bg-muted flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                    <div className="col-span-2 bg-muted flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  </>
                )}
                {creator.portfolio_media.length === 2 && (
                  <div className="col-span-2 bg-muted flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Creator Info Section - Below Gallery */}
          <div className="mb-8">
            {/* Avatar and Basic Info - Stack on mobile */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-background shadow-lg flex-shrink-0">
                {creator.profile_image_url && !avatarFailed ? (
                  <AvatarImage 
                    src={creator.profile_image_url} 
                    className="object-cover" 
                    onError={() => setAvatarFailed(true)}
                  />
                ) : null}
                <AvatarFallback className="text-2xl md:text-3xl bg-gradient-accent text-white">
                  {creator.display_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap mb-2">
                  <h1 className="text-2xl md:text-3xl font-heading font-bold">
                    {creator.display_name}
                  </h1>
                  <div className="flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-full">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="font-semibold text-sm">{creator.avgRating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({creator.totalReviews})</span>
                  </div>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground mb-3">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">
                    {[creator.location_city, creator.location_state, creator.location_country]
                      .filter(Boolean)
                      .join(", ") || "Location not specified"}
                  </span>
                </div>

                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
                  {creator.categories.map((category) => (
                    <Badge key={category} variant="secondary">
                      {category}
                    </Badge>
                  ))}
                </div>

                {creator.bio && (
                  <p className="text-muted-foreground max-w-2xl">{creator.bio}</p>
                )}

                {/* Contact Creator Button - Under bio, above Social Media */}
                <div className="mt-4">
                  <Button 
                    size="lg"
                    className="w-full sm:w-auto gradient-hero hover:opacity-90"
                    onClick={handleContactCreator}
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Contact Creator
                  </Button>
                </div>
              </div>
            </div>
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

              {/* Services & Pricing */}
              <Card>
                <CardHeader>
                  <CardTitle>Services & Pricing</CardTitle>
                  <CardDescription>Available collaboration packages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {creator.services.map((service, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-heading font-semibold text-lg capitalize mb-1">
                              {service.service_type.replace(/_/g, " ")}
                            </h3>
                            {service.description && (
                              <p className="text-sm text-muted-foreground">{service.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-heading font-bold">
                              ${(service.price_cents / 100).toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {service.delivery_days} day{service.delivery_days !== 1 ? "s" : ""} delivery
                            </div>
                          </div>
                        </div>
                        <Button 
                          className="w-full gradient-hero hover:opacity-90"
                          onClick={() => handleBookService(service)}
                        >
                          Book Now
                        </Button>
                      </div>
                    ))}
                  </div>
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
                    <p className="text-2xl font-heading font-bold">
                      ${Math.min(...creator.services.map(s => s.price_cents / 100)).toFixed(0)}
                    </p>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </main>

      {/* Mobile Floating Contact Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent md:hidden z-50">
        <Button 
          size="lg"
          className="w-full gradient-hero hover:opacity-90 shadow-lg"
          onClick={handleContactCreator}
        >
          <MessageCircle className="h-5 w-5 mr-2" />
          Contact Creator
        </Button>
      </div>

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
    </div>
  );
};

export default CreatorProfile;