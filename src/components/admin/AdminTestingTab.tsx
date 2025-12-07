import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Play, Users, Building2 } from "lucide-react";
import CreatorOnboardingPreview from "./CreatorOnboardingPreview";
import BrandOnboardingPreview from "./BrandOnboardingPreview";

const AdminTestingTab = () => {
  const [showCreatorPreview, setShowCreatorPreview] = useState(false);
  const [showBrandPreview, setShowBrandPreview] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Testing</CardTitle>
          <CardDescription>
            Preview the onboarding flows without creating accounts. Changes are not saved to the database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Creator Onboarding Preview */}
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Creator Onboarding</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Test the 7-step creator signup flow including profile photos, social accounts, and services
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowCreatorPreview(true)}
                    className="gap-2 w-full"
                  >
                    <Play className="h-4 w-4" />
                    Test Creator Flow
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Brand Onboarding Preview */}
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Brand Onboarding</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Test the 4-step brand onboarding flow for intent, budget, categories, and platforms
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowBrandPreview(true)}
                    className="gap-2 w-full"
                    variant="secondary"
                  >
                    <Play className="h-4 w-4" />
                    Test Brand Flow
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <strong>Note:</strong> Preview mode allows you to navigate through all steps without:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Creating actual user accounts</li>
              <li>Saving data to the database</li>
              <li>Uploading files to storage</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Creator Preview Dialog */}
      <Dialog open={showCreatorPreview} onOpenChange={setShowCreatorPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge variant="outline" className="text-amber-600 border-amber-600">PREVIEW MODE</Badge>
              Creator Onboarding Preview
            </DialogTitle>
          </DialogHeader>
          <CreatorOnboardingPreview onClose={() => setShowCreatorPreview(false)} />
        </DialogContent>
      </Dialog>

      {/* Brand Preview Dialog */}
      <Dialog open={showBrandPreview} onOpenChange={setShowBrandPreview}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Badge variant="outline" className="text-amber-600 border-amber-600">PREVIEW MODE</Badge>
              Brand Onboarding Preview
            </DialogTitle>
          </DialogHeader>
          <BrandOnboardingPreview onClose={() => setShowBrandPreview(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTestingTab;
