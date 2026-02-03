import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Link as LinkIcon } from "lucide-react";

interface SubmitDeliveryDialogProps {
  applicationId: string;
  opportunityTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const SubmitDeliveryDialog = ({
  applicationId,
  opportunityTitle,
  open,
  onOpenChange,
  onSuccess,
}: SubmitDeliveryDialogProps) => {
  const [links, setLinks] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);

  const addLink = () => {
    setLinks([...links, ""]);
  };

  const removeLink = (index: number) => {
    if (links.length > 1) {
      setLinks(links.filter((_, i) => i !== index));
    }
  };

  const updateLink = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const handleSubmit = async () => {
    const validLinks = links.filter(link => link.trim() !== "");
    
    if (validLinks.length === 0) {
      toast({
        title: "No Links Provided",
        description: "Please add at least one link to your posted content.",
        variant: "destructive",
      });
      return;
    }

    // Validate URLs
    const urlPattern = /^https?:\/\/.+/i;
    const invalidLinks = validLinks.filter(link => !urlPattern.test(link));
    if (invalidLinks.length > 0) {
      toast({
        title: "Invalid Links",
        description: "Please ensure all links start with http:// or https://",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from("opportunity_applications")
      .update({
        delivery_links: validLinks,
        delivered_at: new Date().toISOString(),
      })
      .eq("id", applicationId);

    if (error) {
      console.error("Error submitting delivery:", error);
      toast({
        title: "Error",
        description: "Failed to submit delivery. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Delivery Submitted!",
        description: "The brand will review your content and confirm delivery.",
      });
      setLinks([""]);
      onSuccess();
    }

    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit Delivery</DialogTitle>
          <DialogDescription>
            Add links to your posted content for "{opportunityTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Content Links
            </Label>
            <p className="text-sm text-muted-foreground">
              Add links to your Instagram posts, TikTok videos, Stories, or other content you created for this collaboration.
            </p>
          </div>

          {links.map((link, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="https://instagram.com/p/..."
                value={link}
                onChange={(e) => updateLink(index, e.target.value)}
              />
              {links.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLink(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={addLink}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Another Link
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Delivery"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubmitDeliveryDialog;
