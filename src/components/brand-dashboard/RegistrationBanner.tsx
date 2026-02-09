import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowRight } from "lucide-react";

const RegistrationBanner = () => {
  const navigate = useNavigate();

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 mb-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          <AlertTriangle className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="font-semibold text-sm">Complete your brand registration</p>
            <p className="text-xs text-muted-foreground">
              Unlock all features — browse creators, send messages, and post opportunities.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => navigate("/brand-onboarding")}
          className="gap-1.5 shrink-0 w-full sm:w-auto"
        >
          Complete Registration
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default RegistrationBanner;
