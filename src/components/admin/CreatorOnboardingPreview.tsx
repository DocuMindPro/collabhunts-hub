import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Instagram, Youtube, Twitter, Upload, X, User, Camera } from "lucide-react";
import AiBioSuggestions from "@/components/AiBioSuggestions";

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface CreatorOnboardingPreviewProps {
  onClose: () => void;
}

const CreatorOnboardingPreview = ({ onClose }: CreatorOnboardingPreviewProps) => {
  const [step, setStep] = useState<Step>(1);
  
  // Step 1: Basic info
  const [email, setEmail] = useState("preview@example.com");
  const [fullName, setFullName] = useState("Preview User");

  // Step 2: Profile details
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [locationCountry, setLocationCountry] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Step 3: Photos (preview only)
  const [hasProfileImage, setHasProfileImage] = useState(false);
  const [hasCoverImage, setHasCoverImage] = useState(false);

  // Step 4: Social accounts
  const [socialAccounts, setSocialAccounts] = useState<Array<{ platform: string; username: string }>>([]);

  // Step 5: Services
  const [services, setServices] = useState<Array<{ type: string; price: number }>>([]);

  const categories = [
    "Lifestyle", "Fashion", "Beauty", "Travel", "Health & Fitness",
    "Food & Drink", "Tech & Gaming", "Music & Dance"
  ];

  const serviceTypes = [
    { value: "instagram_post", label: "Instagram Post" },
    { value: "instagram_reel", label: "Instagram Reel" },
    { value: "tiktok_video", label: "TikTok Video" },
    { value: "youtube_video", label: "YouTube Video" },
    { value: "ugc_content", label: "UGC Content" }
  ];

  const progress = (step / 7) * 100;

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2">Step {step} of 7</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {step === 1 && (
            <div className="space-y-4">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Account details (pre-filled for preview)</CardDescription>
              </CardHeader>

              <div>
                <Label>Full Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>

              <div>
                <Label>Email</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div>
                <Label>Password</Label>
                <Input type="password" value="********" disabled />
                <p className="text-xs text-muted-foreground mt-1">Password input disabled in preview</p>
              </div>

              <Button onClick={() => setStep(2)} className="w-full">Continue</Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Profile Details</CardTitle>
                <CardDescription>Tell brands about yourself</CardDescription>
              </CardHeader>

              <div>
                <Label>Display Name</Label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How you want to be known"
                />
              </div>

              <div>
                <Label>Bio</Label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell brands what makes you unique..."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {bio.length}/1000 {bio.length < 50 && <span className="text-destructive">(minimum 50 characters - {50 - bio.length} more needed)</span>}
                </p>
                <AiBioSuggestions
                  text={bio}
                  onSelect={(text) => setBio(text)}
                  minLength={20}
                  type="bio"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>City</Label>
                  <Input value={locationCity} onChange={(e) => setLocationCity(e.target.value)} />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input value={locationCountry} onChange={(e) => setLocationCountry(e.target.value)} />
                </div>
              </div>

              <div>
                <Label>Categories</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {categories.map((category) => (
                    <Badge
                      key={category}
                      variant={selectedCategories.includes(category) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => {
                        if (selectedCategories.includes(category)) {
                          setSelectedCategories(selectedCategories.filter(c => c !== category));
                        } else {
                          setSelectedCategories([...selectedCategories, category]);
                        }
                      }}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
                <Button 
                  onClick={() => setStep(3)} 
                  className="flex-1"
                  disabled={bio.length < 50 || displayName.length < 2 || selectedCategories.length === 0}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Your Profile Photos</CardTitle>
                <CardDescription>Make a great first impression</CardDescription>
              </CardHeader>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <Label className="font-semibold">Profile Photo</Label>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`w-20 h-20 rounded-full border-2 ${hasProfileImage ? 'border-primary bg-primary/10' : 'border-dashed border-muted-foreground/30 bg-muted'} flex items-center justify-center`}>
                    {hasProfileImage ? <CheckCircle className="h-8 w-8 text-primary" /> : <User className="h-8 w-8 text-muted-foreground" />}
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => setHasProfileImage(!hasProfileImage)}
                  >
                    {hasProfileImage ? "Remove" : "Simulate Upload"}
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  <Label className="font-semibold">Cover Image</Label>
                </div>
                <div 
                  className={`h-32 rounded-lg border-2 ${hasCoverImage ? 'border-primary bg-primary/10' : 'border-dashed border-muted-foreground/30 bg-muted'} flex items-center justify-center cursor-pointer`}
                  onClick={() => setHasCoverImage(!hasCoverImage)}
                >
                  {hasCoverImage ? (
                    <CheckCircle className="h-10 w-10 text-primary" />
                  ) : (
                    <span className="text-muted-foreground">Click to simulate upload</span>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
                <Button onClick={() => setStep(4)} className="flex-1">Continue</Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Social Media Accounts</CardTitle>
                <CardDescription>Connect your platforms</CardDescription>
              </CardHeader>

              <div className="flex flex-wrap gap-2">
                {["instagram", "tiktok", "youtube", "twitter"].map((platform) => (
                  <Button
                    key={platform}
                    variant={socialAccounts.some(a => a.platform === platform) ? "default" : "outline"}
                    onClick={() => {
                      if (socialAccounts.some(a => a.platform === platform)) {
                        setSocialAccounts(socialAccounts.filter(a => a.platform !== platform));
                      } else {
                        setSocialAccounts([...socialAccounts, { platform, username: `demo_${platform}` }]);
                      }
                    }}
                    className="capitalize"
                  >
                    {platform}
                    {socialAccounts.some(a => a.platform === platform) && (
                      <CheckCircle className="h-4 w-4 ml-2" />
                    )}
                  </Button>
                ))}
              </div>

              {socialAccounts.length > 0 && (
                <div className="space-y-2">
                  {socialAccounts.map((account, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="capitalize">{account.platform}: @{account.username}</span>
                      <Badge>10K followers</Badge>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1">Back</Button>
                <Button onClick={() => setStep(5)} className="flex-1">Continue</Button>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Services & Pricing</CardTitle>
                <CardDescription>What do you offer?</CardDescription>
              </CardHeader>

              <div className="flex flex-wrap gap-2">
                {serviceTypes.map((service) => (
                  <Button
                    key={service.value}
                    variant={services.some(s => s.type === service.value) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      if (services.some(s => s.type === service.value)) {
                        setServices(services.filter(s => s.type !== service.value));
                      } else {
                        setServices([...services, { type: service.value, price: 100 }]);
                      }
                    }}
                  >
                    {service.label}
                    {services.some(s => s.type === service.value) && (
                      <CheckCircle className="h-3 w-3 ml-1" />
                    )}
                  </Button>
                ))}
              </div>

              {services.length > 0 && (
                <div className="space-y-2">
                  {services.map((service, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="capitalize">{service.type.replace(/_/g, ' ')}</span>
                      <Badge variant="secondary">${service.price}</Badge>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(4)} className="flex-1">Back</Button>
                <Button onClick={() => setStep(6)} className="flex-1">Continue</Button>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Portfolio (Optional)</CardTitle>
                <CardDescription>Show off your best work</CardDescription>
              </CardHeader>

              <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center">
                <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Upload disabled in preview mode</p>
                <p className="text-xs text-muted-foreground mt-1">Max 3 videos, unlimited images</p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(5)} className="flex-1">Back</Button>
                <Button onClick={() => setStep(7)} className="flex-1">Continue</Button>
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4">
              <CardHeader className="px-0 pt-0">
                <CardTitle>Review & Submit</CardTitle>
                <CardDescription>Review your information</CardDescription>
              </CardHeader>

              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Display Name</p>
                  <p className="text-muted-foreground">{displayName || "Not set"}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Bio</p>
                  <p className="text-muted-foreground">{bio || "Not set"}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Categories</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedCategories.map(c => <Badge key={c} variant="secondary">{c}</Badge>)}
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Social Accounts</p>
                  <p className="text-muted-foreground">{socialAccounts.length} connected</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Services</p>
                  <p className="text-muted-foreground">{services.length} services</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Preview Mode:</strong> Clicking submit will not create an account or save any data.
                </p>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(6)} className="flex-1">Back</Button>
                <Button onClick={onClose} className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Close Preview
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatorOnboardingPreview;
