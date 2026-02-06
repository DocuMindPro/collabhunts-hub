import { useNavigate } from "react-router-dom";
import { Building2, CheckCircle, ArrowRight } from "lucide-react";
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
    "Free registration",
    "Takes less than 2 minutes",
    "Direct access to all influencers",
  ];

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-[425px] p-0 overflow-hidden gap-0 [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Gradient accent line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-primary via-primary/70 to-primary/40" />

        <div className="p-8 flex flex-col items-center text-center space-y-6">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>

          {/* Title */}
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-2xl font-bold tracking-tight">
              Register Your Brand
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              Connect with top influencers and grow your business
            </DialogDescription>
          </DialogHeader>

          {/* Benefits */}
          <div className="flex flex-col gap-2.5 w-full">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-primary/5 border border-primary/10"
              >
                <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <Button
            onClick={handleRegister}
            size="lg"
            className="w-full h-12 text-base font-semibold gap-2"
          >
            Register Now
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BrandRegistrationPrompt;
