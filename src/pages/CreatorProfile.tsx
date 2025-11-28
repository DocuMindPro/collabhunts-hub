import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Star, Instagram, Youtube, Twitter, DollarSign } from "lucide-react";

interface CreatorData {
  id: string;
  display_name: string;
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
    service_type: string;
    price_cents: number;
    description: string | null;
    delivery_days: number;
  }>;
}

const CreatorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [creator, setCreator] = useState<CreatorData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCreatorProfile(id);
    }
  }, [id]);

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
        .select("*")
        .eq("creator_profile_id", creatorId)
        .eq("is_active", true);

      setCreator({
        id: profileData.id,
        display_name: profileData.display_name,
        bio: profileData.bio,
        location_city: profileData.location_city,
        location_state: profileData.location_state,
        location_country: profileData.location_country,
        categories: profileData.categories,
        social_accounts: socialData || [],
        services: servicesData || []
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

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Hero Section */}
          <div className="bg-gradient-accent rounded-2xl p-8 md:p-12 mb-8 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-2">
                    {creator.display_name}
                  </h1>
                  <div className="flex items-center gap-2 text-white/80">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {[creator.location_city, creator.location_state, creator.location_country]
                        .filter(Boolean)
                        .join(", ") || "Location not specified"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur px-4 py-2 rounded-full">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="font-semibold">5.0</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {creator.categories.map((category) => (
                  <Badge key={category} variant="secondary" className="bg-white/90 backdrop-blur">
                    {category}
                  </Badge>
                ))}
              </div>

              {creator.bio && (
                <p className="text-white/90 text-lg max-w-3xl">{creator.bio}</p>
              )}
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
                        <Button className="w-full gradient-hero hover:opacity-90">
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

              <Card className="bg-gradient-accent text-white">
                <CardHeader>
                  <CardTitle className="text-white">Ready to Collaborate?</CardTitle>
                  <CardDescription className="text-white/80">
                    Get in touch to start your campaign
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-white text-primary hover:bg-white/90">
                    Contact Creator
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreatorProfile;