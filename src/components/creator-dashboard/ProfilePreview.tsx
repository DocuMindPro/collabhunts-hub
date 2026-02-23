import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, isPast } from "date-fns";
import { DELIVERABLE_PLATFORMS, CONTENT_TYPES, DURATION_OPTIONS, type DeliverablePlatform, type ContentType } from "@/config/packages";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Instagram, Youtube, Twitter, Images, Image as ImageIcon, Pencil } from "lucide-react";
import PortfolioGalleryModal from "@/components/PortfolioGalleryModal";
import MobilePortfolioCarousel from "@/components/MobilePortfolioCarousel";
import { useIsMobile } from "@/hooks/use-mobile";
import VettedBadge from "@/components/VettedBadge";
import VIPCreatorBadge from "@/components/VIPCreatorBadge";
import FeaturedBadge from "@/components/FeaturedBadge";
import RespondsFastBadge from "@/components/RespondsFastBadge";
import { Loader2 } from "lucide-react";

interface CreatorData {
  id: string;
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
  is_featured: boolean | null;
  avg_response_minutes: number | null;
  verification_payment_status: string | null;
  verification_expires_at: string | null;
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
    deliverables?: Array<{
      id: string;
      platform: string;
      content_type: string;
      quantity: number;
      duration_seconds: number | null;
      price_cents: number;
    }>;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    review_text: string | null;
    created_at: string;
    brand_profiles: { company_name: string };
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

interface ProfilePreviewProps {
  creatorProfileId: string;
  onEdit: () => void;
  refreshKey?: number;
}

const isVIP = (creator: CreatorData) => {
  if (creator.verification_payment_status !== 'paid') return false;
  if (!creator.verification_expires_at) return false;
  return !isPast(new Date(creator.verification_expires_at));
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

const getPackageInfo = (packageType: string) => {
  const packages: Record<string, { name: string; description: string; duration?: string }> = {
    unbox_review: { name: 'Unbox & Review', description: 'Authentic unboxing and review from home' },
    social_boost: { name: 'Social Boost', description: 'Creator visits venue and creates engaging content', duration: '1-2 hours' },
    meet_greet: { name: 'Meet & Greet', description: 'Creator appearance with promotional coverage', duration: '2-4 hours' },
    competition: { name: 'Live PK Battle', description: 'Live PK battles at your venue', duration: '2-6 hours' },
    custom: { name: 'Custom Experience', description: 'Tailored experience for your specific needs' },
  };
  return packages[packageType] || { name: packageType.replace(/_/g, ' '), description: '' };
};

const getPackageIcon = (packageType: string) => {
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

const ProfilePreview = ({ creatorProfileId, onEdit, refreshKey = 0 }: ProfilePreviewProps) => {
  const isMobile = useIsMobile();
  const [creator, setCreator] = useState<CreatorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryStartIndex, setGalleryStartIndex] = useState(0);

  useEffect(() => {
    if (creatorProfileId) fetchData();
  }, [creatorProfileId, refreshKey]);

  useEffect(() => {
    if (creator?.profile_image_url && !avatarFailed) {
      const img = new Image();
      const t = setTimeout(() => setAvatarFailed(true), 5000);
      img.onload = () => clearTimeout(t);
      img.onerror = () => { clearTimeout(t); setAvatarFailed(true); };
      img.src = creator.profile_image_url;
    } else if (creator && !creator.profile_image_url) {
      setAvatarFailed(true);
    }
  }, [creator?.profile_image_url]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data: profileData, error } = await supabase
        .from("creator_profiles")
        .select("*")
        .eq("id", creatorProfileId)
        .single();
      if (error) throw error;

      const [socialRes, servicesRes, portfolioRes] = await Promise.all([
        supabase.from("creator_social_accounts").select("*").eq("creator_profile_id", creatorProfileId),
        supabase.from("creator_services").select("id, service_type, price_cents, description, delivery_days").eq("creator_profile_id", creatorProfileId).eq("is_active", true),
        supabase.from("creator_portfolio_media").select("id, media_type, url, thumbnail_url").eq("creator_profile_id", creatorProfileId).order("display_order", { ascending: true }),
      ]);

      const serviceIds = (servicesRes.data || []).map(s => s.id);
      let deliverablesMap: Record<string, any[]> = {};
      if (serviceIds.length > 0) {
        const { data: delData } = await supabase
          .from("creator_service_deliverables")
          .select("id, creator_service_id, platform, content_type, quantity, duration_seconds, price_cents")
          .in("creator_service_id", serviceIds)
          .order("sort_order");
        if (delData) {
          delData.forEach(d => {
            if (!deliverablesMap[d.creator_service_id]) deliverablesMap[d.creator_service_id] = [];
            deliverablesMap[d.creator_service_id].push(d);
          });
        }
      }

      const reviewsRes = await supabase
        .from("reviews")
        .select("id, rating, review_text, created_at, brand_profiles(company_name)")
        .eq("creator_profile_id", creatorProfileId)
        .order("created_at", { ascending: false });

      const reviews = reviewsRes.data || [];
      const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 5.0;

      setCreator({
        id: profileData.id,
        display_name: profileData.display_name,
        profile_image_url: profileData.profile_image_url,
        cover_image_url: profileData.cover_image_url,
        cover_image_url_2: profileData.cover_image_url_2,
        cover_image_url_3: profileData.cover_image_url_3,
        bio: profileData.bio,
        location_city: profileData.location_city,
        location_state: profileData.location_state,
        location_country: profileData.location_country,
        categories: profileData.categories || [],
        show_pricing_to_public: profileData.show_pricing_to_public !== false,
        open_to_invitations: profileData.open_to_invitations ?? false,
        is_featured: profileData.is_featured,
        avg_response_minutes: profileData.avg_response_minutes,
        verification_payment_status: profileData.verification_payment_status,
        verification_expires_at: profileData.verification_expires_at,
        social_accounts: socialRes.data || [],
        services: (servicesRes.data || []).map(s => ({ ...s, deliverables: deliverablesMap[s.id] || [] })),
        reviews,
        avgRating,
        totalReviews: reviews.length,
        portfolio_media: (portfolioRes.data || []).map(p => ({ ...p, media_type: p.media_type as "image" | "video" })),
      });
      setAvatarFailed(false);
    } catch (err) {
      console.error("ProfilePreview fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const openGallery = (index: number) => {
    setGalleryStartIndex(index);
    setIsGalleryOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>Could not load your profile preview.</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Mobile: Swipeable hero */}
      {isMobile && (
        <MobilePortfolioCarousel
          media={creator.portfolio_media}
          coverImageUrl={creator.cover_image_url}
          coverImageUrl2={creator.cover_image_url_2}
          coverImageUrl3={creator.cover_image_url_3}
          profileImageUrl={creator.profile_image_url}
          displayName={creator.display_name}
          onSlideClick={(index) => { if (index >= 0) openGallery(index); }}
          avatarFailed={avatarFailed}
        />
      )}

      {/* Desktop: 3 cover photos */}
      {!isMobile && (() => {
        const coverImages = [creator.cover_image_url, creator.cover_image_url_2, creator.cover_image_url_3].filter(Boolean) as string[];
        if (coverImages.length === 0) return null;
        return (
          <div className="mb-8">
            <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden">
              {coverImages.map((url, index) => (
                <button key={index} onClick={() => openGallery(index)} className="relative overflow-hidden group" style={{ aspectRatio: "4/5" }}>
                  <img src={url} alt={`Cover ${index + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  {index === coverImages.length - 1 && creator.portfolio_media.length > 0 && (
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
                      <Images className="h-4 w-4" />
                      <span className="text-sm font-medium">Show All Photos</span>
                    </div>
                  )}
                </button>
              ))}
              {coverImages.length < 3 && Array.from({ length: 3 - coverImages.length }).map((_, i) => (
                <div key={`placeholder-${i}`} className="bg-muted flex items-center justify-center rounded-lg" style={{ aspectRatio: "4/5" }}>
                  <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Creator Info */}
      <div className="mb-8 mt-6 md:mt-0">
        {isMobile ? (
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <VettedBadge variant="pill" size="sm" />
              {creator.is_featured && <FeaturedBadge variant="pill" size="sm" />}
              {isVIP(creator) && <VIPCreatorBadge variant="pill" size="sm" />}
              {creator.avg_response_minutes !== null && creator.avg_response_minutes <= 1440 && <RespondsFastBadge variant="pill" size="sm" />}
              {creator.open_to_invitations && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500 rounded-full text-white text-xs font-semibold">
                  <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse" /> Free Invites
                </span>
              )}
            </div>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <h1 className="text-2xl font-heading font-bold">{creator.display_name}</h1>
              <div className="flex items-center gap-1 bg-primary/10 px-2.5 py-1 rounded-full">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="font-semibold text-sm">{creator.avgRating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({creator.totalReviews})</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{creator.location_country || "Location not specified"}</span>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {creator.categories.map((category) => <Badge key={category} variant="secondary">{category}</Badge>)}
            </div>
            {creator.bio && <p className="text-muted-foreground text-sm px-4">{creator.bio}</p>}

            {/* Mobile social icons */}
            {creator.social_accounts.length > 0 && (
              <div className="flex items-center justify-center gap-4 mt-2">
                {creator.social_accounts.map((account, i) => {
                  const Icon = getPlatformIcon(account.platform);
                  return (
                    <a key={i} href={account.profile_url || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium">{formatFollowers(account.follower_count)}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-row items-start gap-4 text-left">
            <div className="relative flex-shrink-0">
              <Avatar className={`h-20 w-20 border-[3px] border-background shadow-lg ${creator.open_to_invitations ? 'ring-[3px] ring-green-500 ring-offset-2 ring-offset-background' : ''}`}>
                {creator.profile_image_url && !avatarFailed ? (
                  <AvatarImage src={creator.profile_image_url} className="object-cover" onError={() => setAvatarFailed(true)} />
                ) : null}
                <AvatarFallback className="text-2xl bg-gradient-accent text-white">{creator.display_name.charAt(0)}</AvatarFallback>
              </Avatar>
              {creator.open_to_invitations && (
                <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 hover:bg-green-500 text-white text-[8px] px-1.5 py-0.5 whitespace-nowrap border-2 border-background">Open to Invites</Badge>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <VettedBadge variant="pill" size="sm" />
                {creator.is_featured && <FeaturedBadge variant="pill" size="sm" />}
                {isVIP(creator) && <VIPCreatorBadge variant="pill" size="sm" />}
                {creator.avg_response_minutes !== null && creator.avg_response_minutes <= 1440 && <RespondsFastBadge variant="pill" size="sm" />}
                {creator.open_to_invitations && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500 rounded-full text-white text-xs font-semibold">
                    <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse" /> Free Invites
                  </span>
                )}
              </div>
              <div className="flex items-center justify-start gap-2 flex-wrap mb-1">
                <h1 className="text-2xl font-heading font-bold">{creator.display_name}</h1>
                <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full">
                  <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                  <span className="font-semibold text-sm">{creator.avgRating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({creator.totalReviews})</span>
                </div>
              </div>
              <div className="flex items-center justify-start gap-1.5 text-muted-foreground mb-2">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="text-sm">
                  {[creator.location_city, creator.location_state, creator.location_country].filter(Boolean).join(", ") || "Location not specified"}
                </span>
              </div>
              <div className="flex flex-wrap justify-start gap-1.5 mb-2">
                {creator.categories.map((category) => <Badge key={category} variant="secondary" className="text-xs">{category}</Badge>)}
              </div>
              {creator.bio && <p className="text-muted-foreground text-sm max-w-2xl line-clamp-2">{creator.bio}</p>}
              {creator.social_accounts.length > 0 && (
                <div className="flex items-center gap-4 mt-3">
                  {creator.social_accounts.map((account, i) => {
                    const Icon = getPlatformIcon(account.platform);
                    return (
                      <a key={i} href={account.profile_url || '#'} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors group">
                        <Icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">{formatFollowers(account.follower_count)}</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Content grid */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
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
                              <Star key={star} className={`h-4 w-4 ${star <= review.rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">{format(new Date(review.created_at), "MMM dd, yyyy")}</span>
                      </div>
                      {review.review_text && <p className="text-sm text-muted-foreground">{review.review_text}</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Packages */}
          <Card>
            <CardHeader>
              <CardTitle>Event Packages</CardTitle>
              <CardDescription>Available experiences brands can book</CardDescription>
            </CardHeader>
            <CardContent>
              {creator.services.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No packages available yet</p>
              ) : (
                <div className="grid gap-3">
                  {creator.services.map((service, index) => {
                    const packageType = service.service_type as any;
                    const packageInfo = getPackageInfo(packageType);
                    return (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {getPackageIcon(packageType)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-heading font-semibold">{packageInfo.name}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{packageInfo.description}</p>
                            {packageInfo.duration && <Badge variant="outline" className="mt-1.5 text-xs">{packageInfo.duration}</Badge>}
                          </div>
                        </div>
                        {packageType === 'custom' && service.deliverables && service.deliverables.length > 0 && (
                          <div className="space-y-1.5 mt-3 p-2.5 bg-muted/50 rounded-lg">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Content Menu</p>
                            {service.deliverables.map((d, di) => {
                              const durLabel = d.duration_seconds ? DURATION_OPTIONS.find(o => o.value === d.duration_seconds)?.label : null;
                              return (
                                <div key={di} className="flex items-center justify-between text-sm">
                                  <span>
                                    {d.quantity}x {DELIVERABLE_PLATFORMS[d.platform as DeliverablePlatform] || d.platform}{" "}
                                    {CONTENT_TYPES[d.content_type as ContentType] || d.content_type}
                                    {durLabel && <span className="text-muted-foreground"> ({durLabel})</span>}
                                  </span>
                                  
                                </div>
                              );
                            })}
                          </div>
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
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Reach</p>
                <p className="text-2xl font-heading font-bold">
                  {formatFollowers(creator.social_accounts.reduce((sum, acc) => sum + acc.follower_count, 0))}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Platforms</p>
                <p className="text-2xl font-heading font-bold">{creator.social_accounts.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Packages</p>
                <p className="text-2xl font-heading font-bold">
                  {creator.services.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Edit Button */}
      <Button
        onClick={onEdit}
        size="icon"
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-40 h-14 w-14 rounded-full shadow-xl gradient-hero hover:opacity-90"
      >
        <Pencil className="h-5 w-5" />
        <span className="sr-only">Edit Profile</span>
      </Button>

      {/* Gallery modal */}
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

export default ProfilePreview;
