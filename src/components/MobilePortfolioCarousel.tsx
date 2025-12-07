import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Play, Image as ImageIcon } from "lucide-react";

interface PortfolioMedia {
  id: string;
  media_type: "image" | "video";
  url: string;
  thumbnail_url: string | null;
}

interface MobilePortfolioCarouselProps {
  media: PortfolioMedia[];
  coverImageUrl?: string | null;
  coverImageUrl2?: string | null;
  coverImageUrl3?: string | null;
  profileImageUrl?: string | null;
  displayName: string;
  onSlideClick: (index: number) => void;
  avatarFailed?: boolean;
}

const MobilePortfolioCarousel = ({
  media,
  coverImageUrl,
  coverImageUrl2,
  coverImageUrl3,
  profileImageUrl,
  displayName,
  onSlideClick,
  avatarFailed = false,
}: MobilePortfolioCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());

  // Build slides array: cover images first (up to 3), then portfolio media
  const coverImages = [coverImageUrl, coverImageUrl2, coverImageUrl3].filter(Boolean) as string[];
  const coverSlides = coverImages.map((url, i) => ({
    id: `cover-${i}`,
    media_type: "image" as const,
    url,
    thumbnail_url: null,
  }));
  
  const slides = [...coverSlides, ...media];

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const handleImageError = (index: number) => {
    setFailedImages((prev) => new Set(prev).add(index));
  };

  if (slides.length === 0) {
    // Fallback: gradient background with avatar
    return (
      <div className="relative w-full aspect-[4/5] bg-gradient-to-br from-primary/20 via-accent/20 to-secondary/20 flex items-center justify-center">
        <Avatar className="h-32 w-32 border-4 border-background shadow-2xl">
          {profileImageUrl && !avatarFailed ? (
            <AvatarImage src={profileImageUrl} className="object-cover" />
          ) : null}
          <AvatarFallback className="text-5xl bg-gradient-accent text-white">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        {/* Floating profile avatar on right */}
        <div className="absolute bottom-4 right-4">
          <Avatar className="h-16 w-16 border-4 border-background shadow-lg">
            {profileImageUrl && !avatarFailed ? (
              <AvatarImage src={profileImageUrl} className="object-cover" />
            ) : null}
            <AvatarFallback className="text-xl bg-gradient-accent text-white">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Main Carousel */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              className="relative flex-[0_0_100%] min-w-0 aspect-[4/5]"
              onClick={() => onSlideClick(index >= coverSlides.length ? index - coverSlides.length : -1)}
            >
              {slide.media_type === "image" ? (
                failedImages.has(index) ? (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
                  </div>
                ) : (
                  <img
                    src={slide.url}
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={() => handleImageError(index)}
                  />
                )
              ) : (
                <div className="relative w-full h-full">
                  <video
                    src={slide.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="p-4 rounded-full bg-white/20 backdrop-blur-sm">
                      <Play className="h-12 w-12 text-white fill-white" />
                    </div>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Slide Counter Badge - Bottom Left */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-sm font-medium">
          {selectedIndex + 1}/{slides.length}
        </div>
      )}

      {/* Floating Profile Avatar - Bottom Right (Collabstr Style) */}
      <div className="absolute bottom-4 right-4">
        <Avatar className="h-16 w-16 border-4 border-background shadow-lg">
          {profileImageUrl && !avatarFailed ? (
            <AvatarImage src={profileImageUrl} className="object-cover" />
          ) : null}
          <AvatarFallback className="text-xl bg-gradient-accent text-white">
            {displayName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Dot Indicators */}
      {slides.length > 1 && slides.length <= 10 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === selectedIndex
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/50"
              }`}
              onClick={() => emblaApi?.scrollTo(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MobilePortfolioCarousel;