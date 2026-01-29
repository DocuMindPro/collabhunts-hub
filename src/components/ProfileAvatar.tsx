import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProfileAvatarProps {
  src: string | null | undefined;
  fallbackName: string;
  className?: string;
  fallbackClassName?: string;
  imageClassName?: string;
  openToInvitations?: boolean;
  showBadge?: boolean;
}

/**
 * ProfileAvatar - A reusable avatar component with automatic 404 fallback handling.
 * Shows a gradient background with the first letter of the name when image fails to load.
 * Optionally displays a green "Open to Invitations" ring around the avatar.
 */
const ProfileAvatar = ({
  src,
  fallbackName,
  className,
  fallbackClassName,
  imageClassName,
  openToInvitations = false,
  showBadge = false,
}: ProfileAvatarProps) => {
  const [imageFailed, setImageFailed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset state when src changes
  useEffect(() => {
    setImageFailed(false);
    setImageLoaded(false);
  }, [src]);

  // Pre-validate image with timeout
  useEffect(() => {
    if (!src) {
      setImageFailed(true);
      return;
    }

    const img = new Image();
    const timeoutId = setTimeout(() => {
      if (!imageLoaded) {
        setImageFailed(true);
      }
    }, 5000);

    img.onload = () => {
      clearTimeout(timeoutId);
      setImageLoaded(true);
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      setImageFailed(true);
    };

    img.src = src;

    return () => clearTimeout(timeoutId);
  }, [src, imageLoaded]);

  const initial = fallbackName?.charAt(0)?.toUpperCase() || "?";

  const avatarElement = (
    <div className="relative inline-block">
      <Avatar 
        className={cn(
          "relative",
          openToInvitations && "ring-[3px] ring-green-500 ring-offset-2 ring-offset-background",
          className
        )}
      >
        {src && !imageFailed && (
          <AvatarImage
            src={src}
            alt={fallbackName}
            className={cn("object-cover", imageClassName)}
            onError={() => setImageFailed(true)}
            onLoad={() => setImageLoaded(true)}
          />
        )}
        <AvatarFallback
          className={cn(
            "bg-gradient-accent text-white font-semibold",
            fallbackClassName
          )}
        >
          {initial}
        </AvatarFallback>
      </Avatar>
      
      {/* Small badge indicator */}
      {openToInvitations && showBadge && (
        <Badge 
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-green-500 hover:bg-green-500 text-white text-[8px] px-1.5 py-0 h-4 whitespace-nowrap border-2 border-background"
        >
          Open to Invites
        </Badge>
      )}
    </div>
  );

  // Wrap with tooltip if open to invitations
  if (openToInvitations) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {avatarElement}
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">Open to experience-based collaborations</p>
            <p className="text-xs text-muted-foreground">Free collabs in exchange for products/services</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return avatarElement;
};

export default ProfileAvatar;
