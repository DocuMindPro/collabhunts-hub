import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Send, DollarSign, Clock, Loader2, Sparkles, Plus, X, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AGREEMENT_TEMPLATES, type AgreementTemplateType, type DeliverableItem } from "@/config/agreement-templates";

interface SendAgreementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  creatorProfileId: string;
  brandProfileId: string;
  onAgreementSent: () => void;
}

const SendAgreementDialog = ({
  open,
  onOpenChange,
  conversationId,
  creatorProfileId,
  brandProfileId,
  onAgreementSent,
}: SendAgreementDialogProps) => {
  const [step, setStep] = useState<'template' | 'details'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<AgreementTemplateType | null>(null);
  const [content, setContent] = useState("");
  const [deliverables, setDeliverables] = useState<DeliverableItem[]>([]);
  const [priceCents, setPriceCents] = useState<number>(0);
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined);
  const [eventTime, setEventTime] = useState<string>("19:00");
  const [durationHours, setDurationHours] = useState<number>(2);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [newDeliverable, setNewDeliverable] = useState("");

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  const handleTemplateSelect = (templateId: AgreementTemplateType) => {
    const template = AGREEMENT_TEMPLATES[templateId];
    setSelectedTemplate(templateId);
    setContent(template.suggestedContent);
    setDeliverables([...template.defaultDeliverables]);
    setStep('details');
  };

  const handleAiImprove = async () => {
    if (!content.trim()) {
      toast.error("Please add some content first");
      return;
    }

    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('draft-agreement', {
        body: {
          templateType: selectedTemplate,
          currentContent: content,
          deliverables,
          priceCents,
          eventDate: eventDate ? format(eventDate, "yyyy-MM-dd") : null,
        },
      });

      if (error) throw error;
      
      if (data?.improvedContent) {
        setContent(data.improvedContent);
        toast.success("Agreement improved with AI suggestions!");
      }
    } catch (error: any) {
      console.error("AI improvement error:", error);
      toast.error("Failed to improve with AI. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const addDeliverable = () => {
    if (newDeliverable.trim()) {
      setDeliverables([...deliverables, { description: newDeliverable.trim(), quantity: 1 }]);
      setNewDeliverable("");
    }
  };

  const removeDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const updateDeliverableQuantity = (index: number, quantity: number) => {
    const updated = [...deliverables];
    updated[index].quantity = quantity;
    setDeliverables(updated);
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Please add agreement content");
      return;
    }

    if (priceCents <= 0) {
      toast.error("Please set a price");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create the agreement
      const { data: agreement, error: agreementError } = await supabase
        .from("creator_agreements")
        .insert({
          conversation_id: conversationId,
          creator_profile_id: creatorProfileId,
          brand_profile_id: brandProfileId,
          template_type: selectedTemplate || 'custom',
          content: content,
          deliverables: JSON.parse(JSON.stringify(deliverables)),
          proposed_price_cents: priceCents,
          event_date: eventDate ? format(eventDate, "yyyy-MM-dd") : null,
          event_time: eventTime || null,
          duration_hours: durationHours || null,
          status: 'pending',
        } as any)
        .select()
        .single();

      if (agreementError) throw agreementError;

      // Create a message linking to the agreement
      const templateName = selectedTemplate ? AGREEMENT_TEMPLATES[selectedTemplate].name : 'Custom Agreement';
      
      const messageContent = JSON.stringify({
        type: "agreement",
        agreement_id: agreement.id,
        template_type: selectedTemplate || 'custom',
        template_name: templateName,
        price_cents: priceCents,
        event_date: eventDate ? format(eventDate, "yyyy-MM-dd") : null,
        deliverables_count: deliverables.length,
      });

      const { data: message, error: messageError } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content: messageContent,
          message_type: "agreement",
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Update agreement with message_id
      await supabase
        .from("creator_agreements")
        .update({ message_id: message.id })
        .eq("id", agreement.id);

      toast.success("Agreement sent successfully!");
      onAgreementSent();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error sending agreement:", error);
      toast.error(error.message || "Failed to send agreement");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('template');
    setSelectedTemplate(null);
    setContent("");
    setDeliverables([]);
    setPriceCents(0);
    setEventDate(undefined);
    setEventTime("19:00");
    setDurationHours(2);
    setNewDeliverable("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {step === 'template' ? 'Choose Agreement Template' : 'Draft Agreement'}
          </DialogTitle>
        </DialogHeader>

        {step === 'template' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-4">
            {Object.values(AGREEMENT_TEMPLATES).map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className="flex flex-col items-start p-4 rounded-lg border hover:border-primary hover:bg-primary/5 transition-colors text-left"
              >
                <span className="text-2xl mb-2">{template.icon}</span>
                <span className="font-medium">{template.name}</span>
                <span className="text-sm text-muted-foreground">{template.description}</span>
              </button>
            ))}
          </div>
        ) : (
          <ScrollArea className="max-h-[70vh] pr-4">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4 mt-4">
                <div className="flex justify-between items-center">
                  <Label>Agreement Content</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAiImprove}
                    disabled={aiLoading}
                  >
                    {aiLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Improve with AI
                  </Button>
                </div>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe the agreement terms..."
                  rows={12}
                  className="font-mono text-sm"
                />
              </TabsContent>

              <TabsContent value="deliverables" className="space-y-4 mt-4">
                <Label>Deliverables</Label>
                <div className="space-y-2">
                  {deliverables.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg">
                      <span className="flex-1 text-sm">{item.description}</span>
                      <Input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateDeliverableQuantity(index, parseInt(e.target.value) || 1)}
                        className="w-16 h-8"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeDeliverable(index)}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newDeliverable}
                    onChange={(e) => setNewDeliverable(e.target.value)}
                    placeholder="Add a deliverable..."
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDeliverable())}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addDeliverable}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4 mt-4">
                {/* Price */}
                <div className="space-y-2">
                  <Label>Price (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min={0}
                      value={priceCents / 100}
                      onChange={(e) => setPriceCents(Math.round(parseFloat(e.target.value || "0") * 100))}
                      className="pl-9"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Event Date */}
                <div className="space-y-2">
                  <Label>Event Date (optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !eventDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {eventDate ? format(eventDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={eventDate}
                        onSelect={setEventDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration (hours)</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        min={1}
                        max={12}
                        value={durationHours}
                        onChange={(e) => setDurationHours(parseInt(e.target.value) || 2)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Summary */}
            {priceCents > 0 && (
              <div className="bg-muted/50 rounded-lg p-4 mt-4 space-y-2">
                <p className="text-sm font-medium">Agreement Summary</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Template:</span>
                    <span className="font-medium text-foreground">
                      {selectedTemplate ? AGREEMENT_TEMPLATES[selectedTemplate].name : 'Custom'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Proposed Price:</span>
                    <span className="font-medium text-foreground">${(priceCents / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deliverables:</span>
                    <span className="font-medium text-foreground">{deliverables.length} items</span>
                  </div>
                  {eventDate && (
                    <div className="flex justify-between">
                      <span>Event Date:</span>
                      <span className="font-medium text-foreground">{format(eventDate, "PPP")}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground pt-2 border-t">
                  💡 Payment will be arranged directly between you and the brand
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={() => setStep('template')} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !content.trim() || priceCents <= 0}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Agreement
                  </>
                )}
              </Button>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SendAgreementDialog;
