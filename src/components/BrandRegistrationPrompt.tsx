import { useNavigate } from "react-router-dom";
import { Building2, Check, Sparkles } from "lucide-react";
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
        className="sm:max-w-[400px] p-0 gap-0 rounded-xl shadow-xl overflow-hidden [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Orange accent strip */}
        <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/30" />

        <div className="flex flex-col space-y-4 p-6">
          {/* Icon */}
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>

          {/* Header */}
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
              Register your brand
              <Sparkles className="h-4 w-4 text-primary" />
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Start connecting with top creators today.
            </DialogDescription>
          </DialogHeader>

          {/* Benefits */}
          <div className="flex flex-col gap-2.5 pt-1">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2.5">
                <div className="flex-shrink-0 w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="h-2.5 w-2.5 text-primary" />
                </div>
                <span className="text-sm text-foreground">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-1.5 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">Trusted by 500+ brands in Lebanon</span>
          </div>

          {/* CTA */}
          <Button
            onClick={handleRegister}
            size="lg"
            className="w-full h-11 text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 mt-1"
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
