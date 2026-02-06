import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Instagram, Youtube } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";
import VettedBadge from "@/components/VettedBadge";
import VIPCreatorBadge from "@/components/VIPCreatorBadge";
import FeaturedBadge from "@/components/FeaturedBadge";
import RespondsFastBadge from "@/components/RespondsFastBadge";
import BrandRegistrationPrompt from "@/components/BrandRegistrationPrompt";
import { safeNativeAsync, isNativePlatform } from "@/lib/supabase-native";

interface Creator {
  id: string;
  display_name: string;
  profile_image_url: string | null;
  categories: string[] | null;
  is_featured: boolean | null;
  featuring_priority: number | null;
  status: string | null;
  avg_response_minutes: number | null;
}

interface SocialAccount {
  platform: string;
  follower_count: number | null;
}

interface CreatorWithSocial extends Creator {
  socialAccounts: SocialAccount[];
}

const formatFollowers = (count: number | null): string => {
  if (!count) return "0";
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
  return count.toString();
};

const getPlatformIcon = (platform: string) => {
  if (platform.toLowerCase().includes('instagram')) return Instagram;
  if (platform.toLowerCase().includes('youtube')) return Youtube;
  return Instagram;
};

const CreatorSpotlight = () => {
  const navigate = useNavigate();
  const [creators, setCreators] = useState<CreatorWithSocial[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [hasBrandProfile, setHasBrandProfile] = useState(false);
  const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const session = await safeNativeAsync(
        async () => {
          const { data } = await supabase.auth.getSession();
          return data.session;
        },
        null,
        3000
      );
      
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const brandProfile = await safeNativeAsync(
          async () => {
            const { data } = await supabase
              .from('brand_profiles')
              .select('id')
              .eq('user_id', session.user.id)
              .maybeSingle();
            return data;
          },
          null,
          3000
        );
        setHasBrandProfile(!!brandProfile);
      }
    };

    if (isNativePlatform()) {
      setTimeout(checkAuth, 200);
    } else {
      checkAuth();
    }
  }, []);

  useEffect(() => {
    const fetchCreators = async () => {
      // Fetch creators
      const { data: creatorData, error: creatorError } = await supabase
        .from('creator_profiles')
        .select('id, display_name, profile_image_url, categories, is_featured, featuring_priority, status, avg_response_minutes')
        .eq('status', 'approved')
        .order('featuring_priority', { ascending: false, nullsFirst: false })
        .limit(8);

      if (creatorError || !creatorData) {
        setLoading(false);
        return;
      }

      // Fetch social accounts for these creators
      const creatorIds = creatorData.map(c => c.id);
      const { data: socialData } = await supabase
        .from('creator_social_accounts')
        .select('creator_profile_id, platform, follower_count')
        .in('creator_profile_id', creatorIds);

      // Combine data
      const creatorsWithSocial: CreatorWithSocial[] = creatorData.map(creator => ({
        ...creator,
        socialAccounts: (socialData || [])
          .filter(s => s.creator_profile_id === creator.id)
          .map(s => ({ platform: s.platform, follower_count: s.follower_count }))
      }));

      setCreators(creatorsWithSocial);
      setLoading(false);
    };

    fetchCreators();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (creators.length === 0) return null;

  return (
    <section className="py-20 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <AnimatedSection animation="fade-up" className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-3">
            Featured Influencers
          </h2>
          <p className="text-muted-foreground text-lg">
            See who's already on CollabHunts
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 lg:gap-6 mb-10">
          {creators.map((creator, index) => {
            const primarySocial = creator.socialAccounts[0];
            const PlatformIcon = primarySocial ? getPlatformIcon(primarySocial.platform) : Instagram;
            const isVip = (creator.featuring_priority || 0) >= 3;
            const isFeatured = creator.is_featured === true;
            const isVetted = creator.status === 'approved';
            const respondsFast = creator.avg_response_minutes !== null && creator.avg_response_minutes <= 1440;

            return (
              <AnimatedSection 
                key={creator.id} 
                animation="fade-up" 
                delay={Math.min(index * 50, 400)}
              >
                <Link 
                  to={`/creator/${creator.id}`}
                  className="group block"
                >
                  <div className="relative rounded-xl overflow-hidden bg-card border border-border/50 transition-all duration-300 hover:shadow-hover hover:-translate-y-1">
                    <div className="aspect-[3/4] relative overflow-hidden">
                      {creator.profile_image_url ? (
                        <img
                          src={creator.profile_image_url}
                          alt={creator.display_name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <span className="text-3xl font-bold text-primary/50">
                            {creator.display_name.charAt(0)}
                          </span>
                        </div>
                      )}
                      
                      <div className="absolute top-2 left-2 flex flex-wrap items-center gap-1.5 z-10">
                        {isVetted && <VettedBadge variant="pill" size="sm" showTooltip={false} />}
                        {isFeatured && <FeaturedBadge variant="pill" size="sm" showTooltip={false} />}
                        {isVip && <VIPCreatorBadge variant="pill" size="sm" showTooltip={false} />}
                        {respondsFast && <RespondsFastBadge variant="pill" size="sm" showTooltip={false} />}
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 text-white">
                      <p className="font-semibold text-sm md:text-base truncate">{creator.display_name}</p>
                      
                      <div className="flex items-center gap-2 text-xs opacity-90 mt-1">
                        {primarySocial && primarySocial.follower_count ? (
                          <span className="flex items-center gap-1">
                            <PlatformIcon className="h-3 w-3" />
                            {formatFollowers(primarySocial.follower_count)}
                          </span>
                        ) : null}
                        
                        {creator.categories && creator.categories.length > 0 && (
                          <span className="truncate">
                            {primarySocial?.follower_count ? "· " : ""}{creator.categories[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            );
          })}
        </div>

        <AnimatedSection animation="fade-up" delay={600} className="text-center">
          <Button 
            variant="outline" 
            size="lg" 
            className="group"
            onClick={() => {
              if (hasBrandProfile) {
                navigate('/influencers');
              } else {
                setShowRegistrationPrompt(true);
              }
            }}
          >
            Browse All Creators
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </AnimatedSection>
      </div>

      <BrandRegistrationPrompt 
        open={showRegistrationPrompt} 
        onOpenChange={setShowRegistrationPrompt} 
      />
    </section>
  );
};

export default CreatorSpotlight;