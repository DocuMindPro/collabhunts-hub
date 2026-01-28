import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { generateWhatsAppLink } from "@/config/lebanese-market";
import { cn } from "@/lib/utils";

interface WhatsAppButtonProps {
  phoneNumber: string;
  message?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

const WhatsAppButton = ({
  phoneNumber,
  message,
  variant = "default",
  size = "default",
  className,
  children,
}: WhatsAppButtonProps) => {
  const handleClick = () => {
    const url = generateWhatsAppLink(phoneNumber, message);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn(
        "bg-[#25D366] hover:bg-[#128C7E] text-white",
        variant === "outline" && "bg-transparent text-[#25D366] border-[#25D366] hover:bg-[#25D366] hover:text-white",
        variant === "ghost" && "bg-transparent text-[#25D366] hover:bg-[#25D366]/10",
        className
      )}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      {children || "WhatsApp"}
    </Button>
  );
};

export default WhatsAppButton;
