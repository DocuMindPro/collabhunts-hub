import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoriesStepProps {
  value: string[];
  onChange: (value: string[]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

const categories = [
  "Fashion & Style",
  "Beauty & Makeup",
  "Fitness & Health",
  "Food & Cooking",
  "Travel & Adventure",
  "Tech & Gaming",
  "Lifestyle",
  "Business & Finance",
  "Parenting & Family",
  "Home & DIY",
  "Art & Photography",
  "Music & Entertainment",
];

const CategoriesStep = ({ value, onChange, onNext, onBack, onSkip }: CategoriesStepProps) => {
  const toggleCategory = (category: string) => {
    if (value.includes(category)) {
      onChange(value.filter((c) => c !== category));
    } else {
      onChange([...value, category]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">What categories interest you?</h2>
        <p className="text-muted-foreground">
          Select all that apply to your brand
        </p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => toggleCategory(category)}
            className={cn(
              "px-4 py-2 rounded-full border text-sm font-medium transition-all",
              value.includes(category)
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background hover:border-primary/50 hover:bg-muted"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <Button variant="ghost" onClick={onSkip} className="flex-1">
          Skip
        </Button>
        <Button onClick={onNext} disabled={value.length === 0} className="gap-2">
          Continue <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CategoriesStep;
