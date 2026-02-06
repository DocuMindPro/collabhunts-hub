import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BudgetStepProps {
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const budgetRanges = [
  { id: "under-200", label: "Under $200", description: "Product reviews, small events" },
  { id: "200-500", label: "$200 - $500", description: "Social boosts, meet & greets" },
  { id: "500-1500", label: "$500 - $1,500", description: "Larger events, multi-day" },
  { id: "1500-plus", label: "$1,500+", description: "Premium experiences" },
];

const BudgetStep = ({ value, onChange, onNext, onBack, onSkip }: BudgetStepProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">What's your budget per event?</h2>
        <p className="text-muted-foreground">
          This helps us recommend the right creators and packages
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {budgetRanges.map((budget) => (
          <Card
            key={budget.id}
            className={cn(
              "p-4 cursor-pointer transition-all hover:border-primary/50 text-center",
              value === budget.id && "border-primary bg-primary/5"
            )}
            onClick={() => onChange(budget.id)}
          >
            <p className="font-semibold">{budget.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{budget.description}</p>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button variant="ghost" onClick={onSkip} className="flex-1">
          Skip
        </Button>
        <Button onClick={onNext} disabled={!value} className="gap-2">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default BudgetStep;
