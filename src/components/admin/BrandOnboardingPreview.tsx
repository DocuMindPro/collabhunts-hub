import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Target, DollarSign, Tag, Share2 } from "lucide-react";

interface BrandOnboardingPreviewProps {
  onClose: () => void;
}

const BrandOnboardingPreview = ({ onClose }: BrandOnboardingPreviewProps) => {
  const [step, setStep] = useState(1);
  const [intent, setIntent] = useState("");
  const [budget, setBudget] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const intents = [
    { value: "awareness", label: "Brand Awareness", desc: "Get your brand in front of new audiences" },
    { value: "sales", label: "Drive Sales", desc: "Convert viewers into customers" },
    { value: "ugc", label: "User Generated Content", desc: "Get authentic content for your brand" },
    { value: "engagement", label: "Social Engagement", desc: "Build community and engagement" }
  ];

  const budgets = [
    { value: "under_1k", label: "Under $1,000/mo" },
    { value: "1k_5k", label: "$1,000 - $5,000/mo" },
    { value: "5k_10k", label: "$5,000 - $10,000/mo" },
    { value: "10k_plus", label: "$10,000+/mo" }
  ];

  const categoryOptions = [
    "Fashion", "Beauty", "Fitness", "Travel", "Food", "Tech", "Gaming", "Lifestyle"
  ];

  const platformOptions = [
    "Instagram", "TikTok", "YouTube", "Twitter", "Twitch"
  ];

  return (
    <div className="space-y-6">
      <div>
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2 text-center">Step {step} of {totalSteps}</p>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div className="text-center">
            <Target className="h-10 w-10 mx-auto text-primary mb-3" />
            <h3 className="text-lg font-semibold">What's your main goal?</h3>
            <p className="text-sm text-muted-foreground">We'll personalize your experience</p>
          </div>

          <div className="space-y-2">
            {intents.map((item) => (
              <div
                key={item.value}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  intent === item.value 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setIntent(item.value)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  {intent === item.value && <CheckCircle className="h-5 w-5 text-primary" />}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1">Skip</Button>
            <Button onClick={() => setStep(2)} className="flex-1">Continue</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="text-center">
            <DollarSign className="h-10 w-10 mx-auto text-primary mb-3" />
            <h3 className="text-lg font-semibold">Monthly influencer budget?</h3>
            <p className="text-sm text-muted-foreground">This helps us show relevant creators</p>
          </div>

          <div className="space-y-2">
            {budgets.map((item) => (
              <div
                key={item.value}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  budget === item.value 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setBudget(item.value)}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{item.label}</p>
                  {budget === item.value && <CheckCircle className="h-5 w-5 text-primary" />}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
            <Button onClick={() => setStep(3)} className="flex-1">Continue</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="text-center">
            <Tag className="h-10 w-10 mx-auto text-primary mb-3" />
            <h3 className="text-lg font-semibold">Interested categories?</h3>
            <p className="text-sm text-muted-foreground">Select all that apply</p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {categoryOptions.map((cat) => (
              <Badge
                key={cat}
                variant={categories.includes(cat) ? "default" : "outline"}
                className="cursor-pointer px-4 py-2"
                onClick={() => {
                  if (categories.includes(cat)) {
                    setCategories(categories.filter(c => c !== cat));
                  } else {
                    setCategories([...categories, cat]);
                  }
                }}
              >
                {cat}
              </Badge>
            ))}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
            <Button onClick={() => setStep(4)} className="flex-1">Continue</Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div className="text-center">
            <Share2 className="h-10 w-10 mx-auto text-primary mb-3" />
            <h3 className="text-lg font-semibold">Preferred platforms?</h3>
            <p className="text-sm text-muted-foreground">Where do you want to reach audiences?</p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {platformOptions.map((plat) => (
              <Badge
                key={plat}
                variant={platforms.includes(plat) ? "default" : "outline"}
                className="cursor-pointer px-4 py-2"
                onClick={() => {
                  if (platforms.includes(plat)) {
                    setPlatforms(platforms.filter(p => p !== plat));
                  } else {
                    setPlatforms([...platforms, plat]);
                  }
                }}
              >
                {plat}
              </Badge>
            ))}
          </div>

          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Preview Mode:</strong> Completing the flow will not save any preferences.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(3)} className="flex-1">Back</Button>
            <Button onClick={onClose} className="flex-1">
              <CheckCircle className="h-4 w-4 mr-2" />
              Close Preview
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandOnboardingPreview;
