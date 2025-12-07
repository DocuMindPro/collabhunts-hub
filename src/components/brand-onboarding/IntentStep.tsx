import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, RefreshCw, Search, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface IntentStepProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onSkip: () => void;
}

const intents = [
  {
    id: "one-time",
    label: "One-time campaign",
    description: "I need creators for a specific campaign or launch",
    icon: Megaphone,
  },
  {
    id: "ongoing",
    label: "Ongoing content",
    description: "I want to build long-term creator relationships",
    icon: RefreshCw,
  },
  {
    id: "exploring",
    label: "Just exploring",
    description: "I'm researching the platform and options",
    icon: Search,
  },
];

const IntentStep = ({ value, onChange, onNext, onSkip }: IntentStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">What are you looking for?</h2>
        <p className="text-muted-foreground">
          This helps us personalize your experience
        </p>
      </div>

      <div className="grid gap-3">
        {intents.map((intent) => (
          <Card
            key={intent.id}
            className={cn(
              "p-4 cursor-pointer transition-all hover:border-primary/50",
              value === intent.id && "border-primary bg-primary/5"
            )}
            onClick={() => onChange(intent.id)}
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-full",
                value === intent.id ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                <intent.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{intent.label}</p>
                <p className="text-sm text-muted-foreground">{intent.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="ghost" onClick={onSkip} className="flex-1">
          Skip for now
        </Button>
        <Button onClick={onNext} disabled={!value} className="flex-1 gap-2">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default IntentStep;
