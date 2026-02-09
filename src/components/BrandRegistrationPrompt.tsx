import { useNavigate } from "react-router-dom";
import { Building2, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface BrandRegistrationPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BrandRegistrationPrompt = ({ open, onOpenChange }: BrandRegistrationPromptProps) => {
  const navigate = useNavigate();

  const handleRegister = () => {
    onOpenChange(false);
    navigate("/brand-signup");
  };

  const benefits = [
    "Free registration — no credit card required",
    "Set up in under 2 minutes",
    "Direct access to vetted influencers",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[400px] p-6 gap-0 rounded-xl [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex flex-col space-y-4">
          {/* Icon */}
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Header */}
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-xl font-bold tracking-tight">
              Register your brand
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Start connecting with top creators today.
            </DialogDescription>
          </DialogHeader>

          {/* Benefits */}
          <div className="flex flex-col gap-2 pt-1">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2.5">
                <Check className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-sm text-foreground">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button
            onClick={handleRegister}
            size="lg"
            className="w-full h-11 text-sm font-semibold bg-foreground text-background hover:bg-foreground/90 mt-2"
          >
            Get Started
          </Button>

          {/* Skip */}
          <button
            onClick={() => onOpenChange(false)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BrandRegistrationPrompt;
