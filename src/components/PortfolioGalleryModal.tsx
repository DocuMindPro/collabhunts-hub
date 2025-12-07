import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Play } from "lucide-react";

interface PortfolioMedia {
  id: string;
  media_type: "image" | "video";
  url: string;
  thumbnail_url: string | null;
}

interface PortfolioGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: PortfolioMedia[];
  initialIndex?: number;
  creatorName: string;
}

const PortfolioGalleryModal = ({
  isOpen,
  onClose,
  media,
  initialIndex = 0,
  creatorName,
}: PortfolioGalleryModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Reset to initialIndex when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
  };

  const currentMedia = media[currentIndex];

  if (!currentMedia) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>{creatorName}'s Portfolio</DialogTitle>
        </DialogHeader>

        <div className="relative bg-black aspect-video flex items-center justify-center">
          {/* Navigation Buttons */}
          {media.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70 h-10 w-10"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white hover:bg-black/70 h-10 w-10"
                onClick={handleNext}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Media Display */}
          {currentMedia.media_type === "image" ? (
            <img
              src={currentMedia.url}
              alt={`Portfolio item ${currentIndex + 1}`}
              className="max-w-full max-h-[70vh] object-contain"
            />
          ) : (
            <video
              key={currentMedia.id}
              src={currentMedia.url}
              controls
              autoPlay
              className="max-w-full max-h-[70vh]"
            />
          )}
        </div>

        {/* Thumbnails */}
        <div className="p-4 border-t bg-muted/30">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {media.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(index)}
                className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                  index === currentIndex
                    ? "border-primary"
                    : "border-transparent hover:border-primary/50"
                }`}
              >
                {item.media_type === "image" ? (
                  <img
                    src={item.url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full bg-muted">
                    <video src={item.url} className="w-full h-full object-cover" muted />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Play className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            {currentIndex + 1} of {media.length}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PortfolioGalleryModal;
