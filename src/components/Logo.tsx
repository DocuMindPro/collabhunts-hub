interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const Logo = ({ className = "", showText = true, size = "md" }: LogoProps) => {
  const sizes = {
    sm: { icon: 24, text: "text-lg" },
    md: { icon: 32, text: "text-xl" },
    lg: { icon: 40, text: "text-2xl" },
  };

  const { icon, text } = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* SVG Logo Icon */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Background circle with gradient */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--secondary))" />
          </linearGradient>
        </defs>
        
        {/* Main circle */}
        <circle cx="20" cy="20" r="18" fill="url(#logoGradient)" />
        
        {/* Crosshair/Target element */}
        <circle cx="20" cy="20" r="8" stroke="white" strokeWidth="2" fill="none" />
        <circle cx="20" cy="20" r="3" fill="white" />
        
        {/* Connection lines representing collaboration */}
        <path
          d="M12 20 H8 M28 20 H32 M20 12 V8 M20 28 V32"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Small dots at connection points */}
        <circle cx="8" cy="20" r="2" fill="white" />
        <circle cx="32" cy="20" r="2" fill="white" />
        <circle cx="20" cy="8" r="2" fill="white" />
        <circle cx="20" cy="32" r="2" fill="white" />
      </svg>

      {/* Text */}
      {showText && (
        <span className={`font-heading font-bold bg-gradient-accent bg-clip-text text-transparent ${text}`}>
          CollabHunts
        </span>
      )}
    </div>
  );
};

export default Logo;
