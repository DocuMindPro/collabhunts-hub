import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ProfileAvatarProps {
  src: string | null | undefined;
  fallbackName: string;
  className?: string;
  fallbackClassName?: string;
  imageClassName?: string;
}

/**
 * ProfileAvatar - A reusable avatar component with automatic 404 fallback handling.
 * Shows a gradient background with the first letter of the name when image fails to load.
 */
const ProfileAvatar = ({
  src,
  fallbackName,
  className,
  fallbackClassName,
  imageClassName,
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

  return (
    <Avatar className={cn("relative", className)}>
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
  );
};

export default ProfileAvatar;
