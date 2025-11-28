import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, Star, Heart } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Influencers = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - will be replaced with real data later
  const influencers = [
    {
      id: 1,
      name: "Sarah Johnson",
      category: "Fashion & Lifestyle",
      platform: "Instagram",
      followers: "125K",
      rating: 5.0,
      price: 500,
      location: "Los Angeles, CA",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"
    },
    {
      id: 2,
      name: "Mike Chen",
      category: "Food & Travel",
      platform: "TikTok",
      followers: "850K",
      rating: 4.9,
      price: 1200,
      location: "New York, NY",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop"
    },
    {
      id: 3,
      name: "Emma Davis",
      category: "Beauty",
      platform: "YouTube",
      followers: "450K",
      rating: 5.0,
      price: 800,
      location: "Miami, FL",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop"
    },
    {
      id: 4,
      name: "Alex Rivera",
      category: "Fitness",
      platform: "Instagram",
      followers: "320K",
      rating: 4.8,
      price: 650,
      location: "Austin, TX",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop"
    },
    {
      id: 5,
      name: "Lisa Park",
      category: "Tech & Gaming",
      platform: "Twitch",
      followers: "580K",
      rating: 4.9,
      price: 950,
      location: "Seattle, WA",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop"
    },
    {
      id: 6,
      name: "James Wilson",
      category: "Travel",
      platform: "YouTube",
      followers: "720K",
      rating: 5.0,
      price: 1100,
      location: "Denver, CO",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop"
    }
  ];

  const platforms = ["All", "Instagram", "TikTok", "YouTube", "Twitter", "Twitch"];
  const categories = [
    "All Categories",
    "Fashion",
    "Beauty",
    "Lifestyle",
    "Travel",
    "Health & Fitness",
    "Food & Drink",
    "Tech & Gaming"
  ];

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
              Browse thousands of verified creators across all platforms
            </p>
          </div>

          {/* Filters */}
          <div className="bg-card rounded-xl border border-border p-6 mb-8 shadow-card">
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

              <Select defaultValue="all">
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

              <Select defaultValue="all">
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

            <div className="flex items-center gap-2 mt-4">
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                More Filters
              </Button>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary">Price: $0-$1000</Badge>
                <Badge variant="secondary">Followers: 100K+</Badge>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {influencers.map((influencer) => (
              <div
                key={influencer.id}
                className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-hover transition-shadow group"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={influencer.image}
                    alt={influencer.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <button className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur rounded-full hover:bg-background transition-colors">
                    <Heart className="h-5 w-5" />
                  </button>
                  <Badge className="absolute bottom-4 left-4 bg-background/90 backdrop-blur">
                    {influencer.platform}
                  </Badge>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-heading font-semibold text-lg mb-1">
                        {influencer.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {influencer.category}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      <span className="text-sm font-medium">{influencer.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span>{influencer.followers} followers</span>
                    <span>{influencer.location}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-heading font-bold">${influencer.price}</span>
                      <span className="text-sm text-muted-foreground ml-1">per post</span>
                    </div>
                    <Button size="sm" className="gradient-hero hover:opacity-90">
                      View Profile
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <Button variant="outline" size="lg">
              Load More Influencers
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Influencers;
