import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Instagram, Youtube, Twitter, Upload, X, User, Camera, Image as ImageIcon, Phone } from "lucide-react";
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
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);

  // Step 2: Profile details
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [locationState, setLocationState] = useState("");
  const [locationCountry, setLocationCountry] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Step 2: Demographics
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [ethnicity, setEthnicity] = useState("");
  const [primaryLanguage, setPrimaryLanguage] = useState("English");
  const [secondaryLanguages, setSecondaryLanguages] = useState<string[]>([]);

  // Step 3: Photos (preview only - 3 cover images)
  const [hasProfileImage, setHasProfileImage] = useState(false);
  const [hasCoverImages, setHasCoverImages] = useState<boolean[]>([false, false, false]);

  // Step 4: Social accounts
  const [socialAccounts, setSocialAccounts] = useState<Array<{ platform: string; username: string }>>([]);

  // Step 5: Services
  const [services, setServices] = useState<Array<{ type: string; price: number }>>([]);

  const categories = [
    "Lifestyle", "Fashion", "Beauty", "Travel", "Health & Fitness",
    "Food & Drink", "Tech & Gaming", "Music & Dance"
  ];

  const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];
  const ETHNICITIES = ["African American", "Asian", "Caucasian", "Hispanic/Latino", "Middle Eastern", "Mixed/Other", "Prefer not to say"];
  const LANGUAGES = ["English", "Spanish", "French", "German", "Portuguese", "Arabic", "Hindi", "Chinese", "Japanese", "Korean", "Other"];

  // Calculate max date for birth date (must be at least 13 years old)
  const maxBirthDate = new Date();
  maxBirthDate.setFullYear(maxBirthDate.getFullYear() - 13);
  const maxBirthDateStr = maxBirthDate.toISOString().split('T')[0];

  const serviceTypes = [
    { value: "instagram_post", label: "Instagram Post" },
    { value: "instagram_reel", label: "Instagram Reel" },
    { value: "tiktok_video", label: "TikTok Video" },
    { value: "youtube_video", label: "YouTube Video" },
    { value: "ugc_content", label: "UGC Content" }
  ];

  const progress = (step / 7) * 100;

  const toggleCoverImage = (index: number) => {
    const newState = [...hasCoverImages];
    newState[index] = !newState[index];
    setHasCoverImages(newState);
  };

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

              {/* Phone Verification Preview */}
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="h-4 w-4 text-primary" />
                  <Label className="font-semibold">Phone Verification</Label>
                  <span className="text-destructive text-xs">*Required</span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label>Phone Number</Label>
                    <div className="flex gap-2">
                      <Input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                          setPhoneVerified(false);
                        }}
                        placeholder="+1234567890"
                        disabled={phoneVerified}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant={phoneVerified ? "default" : "outline"}
                        onClick={() => {
                          if (phoneNumber.length >= 10) {
                            setPhoneVerified(true);
                          }
                        }}
                        disabled={phoneVerified || phoneNumber.length < 10}
                      >
                        {phoneVerified ? <CheckCircle className="h-4 w-4" /> : "Simulate Verify"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Include country code (e.g., +1 for US)
                    </p>
                  </div>

                  {phoneVerified && (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-md">
                      <CheckCircle className="h-4 w-4" />
                      <span>Phone number verified (simulated)</span>
                    </div>
                  )}

                  {!phoneVerified && phoneNumber.length >= 10 && (
                    <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-md">
                      Click "Simulate Verify" to test the verification flow
                    </p>
                  )}
                </div>
              </div>

              <Button 
                onClick={() => setStep(2)} 
                className="w-full"
                disabled={!phoneVerified}
              >
                Continue
              </Button>
              {!phoneVerified && (
                <p className="text-xs text-center text-muted-foreground">
                  Phone verification required to continue
                </p>
              )}
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

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label>City</Label>
                  <Input value={locationCity} onChange={(e) => setLocationCity(e.target.value)} placeholder="New York" />
                </div>
                <div>
                  <Label>State</Label>
                  <Input value={locationState} onChange={(e) => setLocationState(e.target.value)} placeholder="NY" />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input value={locationCountry} onChange={(e) => setLocationCountry(e.target.value)} placeholder="USA" />
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

              {/* Demographics Section */}
              <div className="border-t pt-4 mt-4">
                <Label className="text-base font-semibold">Demographics <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                <p className="text-xs text-muted-foreground mb-3">This helps brands find creators that match their target audience</p>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Date of Birth</Label>
                    <Input 
                      type="date" 
                      value={birthDate} 
                      onChange={(e) => setBirthDate(e.target.value)}
                      max={maxBirthDateStr}
                    />
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Select gender</option>
                      {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <Label>Ethnicity</Label>
                    <select
                      value={ethnicity}
                      onChange={(e) => setEthnicity(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Select ethnicity</option>
                      {ETHNICITIES.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Primary Language</Label>
                    <select
                      value={primaryLanguage}
                      onChange={(e) => setPrimaryLanguage(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <Label>Secondary Languages</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {LANGUAGES.filter(l => l !== primaryLanguage).map((lang) => (
                      <Badge
                        key={lang}
                        variant={secondaryLanguages.includes(lang) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          if (secondaryLanguages.includes(lang)) {
                            setSecondaryLanguages(secondaryLanguages.filter(l => l !== lang));
                          } else {
                            setSecondaryLanguages([...secondaryLanguages, lang]);
                          }
                        }}
                      >
                        {lang}
                      </Badge>
                    ))}
                  </div>
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

              {/* Profile Photo */}
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

              {/* Cover Photos - 3 uniformly sized slots */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  <Label className="font-semibold">Cover Photos (First Required)</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Use portrait photos (4:5 ratio) for best display
                </p>
                
                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2].map((index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => toggleCoverImage(index)}
                      className={`aspect-[4/5] rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-colors ${
                        hasCoverImages[index] 
                          ? 'border-primary bg-primary/10' 
                          : index === 0 
                            ? 'border-dashed border-primary/50 bg-primary/5 hover:bg-primary/10'
                            : 'border-dashed border-muted-foreground/30 bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {hasCoverImages[index] ? (
                        <>
                          <CheckCircle className="h-8 w-8 text-primary" />
                          <span className="text-xs text-primary font-medium">
                            {index === 0 ? "Main" : `Photo ${index + 1}`}
                          </span>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {index === 0 ? "Required" : "Optional"}
                          </span>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
                <Button 
                  onClick={() => setStep(4)} 
                  className="flex-1"
                  disabled={!hasProfileImage || !hasCoverImages[0]}
                >
                  Continue
                </Button>
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
                  <p className="text-sm font-medium">Phone Number</p>
                  <div className="flex items-center gap-2">
                    <p className="text-muted-foreground">{phoneNumber || "Not set"}</p>
                    {phoneVerified && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Bio</p>
                  <p className="text-muted-foreground line-clamp-2">{bio || "Not set"}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-muted-foreground">
                    {[locationCity, locationState, locationCountry].filter(Boolean).join(", ") || "Not set"}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Categories</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedCategories.length > 0 
                      ? selectedCategories.map(c => <Badge key={c} variant="secondary">{c}</Badge>)
                      : <span className="text-muted-foreground">None selected</span>
                    }
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Demographics</p>
                  <div className="text-muted-foreground text-sm space-y-1 mt-1">
                    {birthDate && <p>Birth Date: {birthDate}</p>}
                    {gender && <p>Gender: {gender}</p>}
                    {ethnicity && <p>Ethnicity: {ethnicity}</p>}
                    <p>Primary Language: {primaryLanguage}</p>
                    {secondaryLanguages.length > 0 && (
                      <p>Other Languages: {secondaryLanguages.join(", ")}</p>
                    )}
                    {!birthDate && !gender && !ethnicity && secondaryLanguages.length === 0 && (
                      <p className="text-muted-foreground/60">Only primary language set</p>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium">Cover Photos</p>
                  <p className="text-muted-foreground">{hasCoverImages.filter(Boolean).length} of 3 uploaded</p>
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