import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  CalendarIcon, Send, DollarSign, Clock, Loader2, Sparkles, Plus, X, FileText,
  ArrowLeft, ArrowRight, Eye, Edit3, CheckCircle2,
  Package, Smartphone, Users, Video, PenTool, ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  AGREEMENT_TEMPLATES,
  type AgreementTemplateType,
  type DeliverableItem,
  type QuestionField,
  fillTemplatePlaceholders,
} from "@/config/agreement-templates";
import { canBrandUseAiDraft, incrementAiDraftCounter } from "@/lib/subscription-utils";

interface SendAgreementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  creatorProfileId: string;
  brandProfileId: string;
  onAgreementSent: () => void;
  brandName?: string;
  creatorName?: string;
}

type WizardStep = 'template' | 'questions' | 'review';

const PLATFORM_OPTIONS = ['Instagram', 'TikTok', 'YouTube', 'Facebook', 'X (Twitter)', 'Snapchat'];

const USAGE_RIGHTS_OPTIONS = [
  { value: 'creator_only', label: 'Creator channels only' },
  { value: 'brand_repost', label: 'Brand can repost with credit' },
  { value: 'full_commercial', label: 'Full commercial rights' },
];

const SendAgreementDialog = ({
  open,
  onOpenChange,
  conversationId,
  creatorProfileId,
  brandProfileId,
  onAgreementSent,
  brandName = "Brand",
  creatorName = "Creator",
}: SendAgreementDialogProps) => {
  const [step, setStep] = useState<WizardStep>('template');
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

  // New question fields
  const [productDescription, setProductDescription] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [usageRights, setUsageRights] = useState("brand_repost");
  const [revisionRounds, setRevisionRounds] = useState("1");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (!open) resetForm();
  }, [open]);

  const currentTemplate = selectedTemplate ? AGREEMENT_TEMPLATES[selectedTemplate] : null;
  const templateQuestions = currentTemplate?.questions || [];

  const showField = (field: QuestionField) => templateQuestions.includes(field);

  const handleTemplateSelect = (templateId: AgreementTemplateType) => {
    const template = AGREEMENT_TEMPLATES[templateId];
    setSelectedTemplate(templateId);
    setDeliverables([...template.defaultDeliverables]);
    // Pre-fill content with placeholders replaced
    setContent(fillTemplatePlaceholders(template.suggestedContent, brandName, creatorName));
    setStep('questions');
  };

  const handleGenerateAgreement = async () => {
    // Check AI draft usage limit
    const { canUse, used, limit, reason } = await canBrandUseAiDraft(brandProfileId);
    if (!canUse) {
      toast.error(reason || "AI draft limit reached");
      // Still proceed to review with template content
      setStep('review');
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
          brandName,
          creatorName,
          productDescription,
          platforms,
          usageRights,
          revisionRounds: parseInt(revisionRounds),
          specialInstructions,
        },
      });

      if (error) throw error;

      if (data?.improvedContent) {
        setContent(data.improvedContent);
        await incrementAiDraftCounter(brandProfileId);
        toast.success(`Agreement generated with AI! (${used + 1}/${limit} used this month)`);
      }
    } catch (error: any) {
      console.error("AI generation error:", error);
      toast.error("Failed to generate with AI. You can still edit manually.");
    } finally {
      setAiLoading(false);
      setStep('review');
    }
  };

  const handleGoToReviewWithoutAI = () => {
    setStep('review');
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

  const togglePlatform = (platform: string) => {
    setPlatforms(prev =>
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
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
    setProductDescription("");
    setPlatforms([]);
    setUsageRights("brand_repost");
    setRevisionRounds("1");
    setSpecialInstructions("");
    setIsEditMode(false);
  };

  const stepTitle = () => {
    switch (step) {
      case 'template': return 'Choose Agreement Template';
      case 'questions': return 'Agreement Details';
      case 'review': return 'Review & Send';
    }
  };

  // Render simple markdown-like bold text
  const renderPreview = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold
      const rendered = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: rendered }} />;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {stepTitle()}
          </DialogTitle>
          {/* Progress indicator */}
          {step !== 'template' && (
            <div className="flex items-center gap-2 pt-2">
              {(['template', 'questions', 'review'] as WizardStep[]).map((s, i) => (
                <div key={s} className="flex items-center gap-1">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    step === s ? "bg-primary" : 
                    (['template', 'questions', 'review'].indexOf(step) > i) ? "bg-primary/50" : "bg-muted"
                  )} />
                  <span className="text-xs text-muted-foreground capitalize">{s === 'questions' ? 'Details' : s}</span>
                  {i < 2 && <div className="w-6 h-px bg-muted" />}
                </div>
              ))}
            </div>
          )}
        </DialogHeader>

        {/* STEP 1: Template Selection */}
        {step === 'template' && (() => {
          const TEMPLATE_ICONS: Record<string, React.ElementType> = {
            custom: PenTool,
            unbox_review: Package,
            social_boost: Smartphone,
            meet_greet: Users,
            content_creation: Video,
          };
          const TEMPLATE_COLORS: Record<string, string> = {
            custom: 'bg-primary/10 text-primary',
            unbox_review: 'bg-orange-500/10 text-orange-600',
            social_boost: 'bg-blue-500/10 text-blue-600',
            meet_greet: 'bg-emerald-500/10 text-emerald-600',
            content_creation: 'bg-violet-500/10 text-violet-600',
          };
          const allTemplates = Object.values(AGREEMENT_TEMPLATES);
          const customTemplate = allTemplates.find(t => t.id === 'custom');
          const otherTemplates = allTemplates.filter(t => t.id !== 'custom');

          return (
            <div className="space-y-3 py-4">
              {/* Featured: Custom Agreement */}
              {customTemplate && (() => {
                const Icon = TEMPLATE_ICONS[customTemplate.id] || FileText;
                return (
                  <button
                    onClick={() => handleTemplateSelect(customTemplate.id)}
                    className="group w-full flex items-center gap-4 p-4 rounded-xl border-l-4 border-l-primary border border-border bg-card hover:shadow-md hover:border-primary/50 transition-all duration-200 text-left"
                  >
                    <div className={cn("shrink-0 w-11 h-11 rounded-lg flex items-center justify-center", TEMPLATE_COLORS[customTemplate.id])}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{customTemplate.name}</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">Most Flexible</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{customTemplate.description}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                );
              })()}

              {/* Other templates in 2x2 grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {otherTemplates.map((template) => {
                  const Icon = TEMPLATE_ICONS[template.id] || FileText;
                  return (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.id)}
                      className="group flex flex-col items-start gap-3 p-4 rounded-xl border bg-card hover:shadow-md hover:border-primary/40 transition-all duration-200 text-left"
                    >
                      <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", TEMPLATE_COLORS[template.id])}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-medium text-sm block">{template.name}</span>
                        <span className="text-xs text-muted-foreground line-clamp-2">{template.description}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* STEP 2: Quick Questions */}
        {step === 'questions' && (
          <ScrollArea className="max-h-[65vh] pr-4">
            <div className="space-y-5 py-2">
              {/* Names - always shown, read-only */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Brand</Label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 border text-sm font-medium">
                    {brandName}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Creator</Label>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 border text-sm font-medium">
                    {creatorName}
                  </div>
                </div>
              </div>

              {/* Product / Service Description */}
              {showField('productDescription') && (
                <div className="space-y-1.5">
                  <Label>What product or service is this for?</Label>
                  <Input
                    value={productDescription}
                    onChange={(e) => setProductDescription(e.target.value)}
                    placeholder="e.g. New summer collection launch, Restaurant grand opening..."
                  />
                  <p className="text-xs text-muted-foreground">Briefly describe what the creator will be promoting</p>
                </div>
              )}

              {/* Budget */}
              <div className="space-y-1.5">
                <Label>Proposed Budget (USD)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min={0}
                    value={priceCents / 100 || ""}
                    onChange={(e) => setPriceCents(Math.round(parseFloat(e.target.value || "0") * 100))}
                    className="pl-9"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Event / Delivery Date */}
              {showField('eventDate') && (
                <div className="space-y-1.5">
                  <Label>{showField('eventTime') ? 'Event Date' : 'Delivery Deadline'}</Label>
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
              )}

              {/* Time & Duration (event templates) */}
              {showField('eventTime') && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Start Time</Label>
                    <Input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
                  </div>
                  {showField('durationHours') && (
                    <div className="space-y-1.5">
                      <Label>Duration (hours)</Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number" min={1} max={12} value={durationHours}
                          onChange={(e) => setDurationHours(parseInt(e.target.value) || 2)}
                          className="pl-9"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Content Platforms */}
              {showField('platforms') && (
                <div className="space-y-2">
                  <Label>Content Platforms</Label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORM_OPTIONS.map(platform => (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => togglePlatform(platform)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-sm border transition-colors",
                          platforms.includes(platform)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background hover:bg-muted border-input"
                        )}
                      >
                        {platform}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Usage Rights */}
              {showField('usageRights') && (
                <div className="space-y-1.5">
                  <Label>Usage Rights</Label>
                  <Select value={usageRights} onValueChange={setUsageRights}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {USAGE_RIGHTS_OPTIONS.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Revision Rounds */}
              {showField('revisionRounds') && (
                <div className="space-y-1.5">
                  <Label>Revision Rounds Included</Label>
                  <Select value={revisionRounds} onValueChange={setRevisionRounds}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Special Instructions */}
              {showField('specialInstructions') && (
                <div className="space-y-1.5">
                  <Label>Special Instructions (optional)</Label>
                  <Textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Any additional requirements, dress code, hashtags to use..."
                    rows={3}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-6 pb-2">
              <Button variant="outline" onClick={() => setStep('template')} className="gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <div className="flex-1" />
              <Button variant="outline" onClick={handleGoToReviewWithoutAI} className="gap-1.5">
                Skip AI <ArrowRight className="h-4 w-4" />
              </Button>
              <Button onClick={handleGenerateAgreement} disabled={aiLoading || priceCents <= 0} className="gap-1.5">
                {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate with AI
              </Button>
            </div>
          </ScrollArea>
        )}

        {/* STEP 3: Review & Edit */}
        {step === 'review' && (
          <ScrollArea className="max-h-[65vh] pr-4">
            <div className="space-y-4 py-2">
              {/* Edit mode toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {isEditMode ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {isEditMode ? "Editing" : "Preview"}
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="edit-toggle" className="text-xs text-muted-foreground">Edit mode</Label>
                  <Switch id="edit-toggle" checked={isEditMode} onCheckedChange={setIsEditMode} />
                </div>
              </div>

              {/* Agreement content */}
              {isEditMode ? (
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={14}
                  className="text-sm"
                />
              ) : (
                <div className="rounded-lg border bg-card p-5 space-y-1">
                  {renderPreview(content)}
                </div>
              )}

              {/* Deliverables */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Deliverables</Label>
                <div className="space-y-2">
                  {deliverables.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg">
                      <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="flex-1 text-sm">{item.description}</span>
                      <Input
                        type="number" min={1} value={item.quantity}
                        onChange={(e) => updateDeliverableQuantity(index, parseInt(e.target.value) || 1)}
                        className="w-16 h-8"
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeDeliverable(index)} className="h-8 w-8">
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
              </div>

              {/* Summary card */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium">Agreement Summary</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Between:</span>
                    <span className="font-medium text-foreground">{brandName} & {creatorName}</span>
                  </div>
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
                      <span>Date:</span>
                      <span className="font-medium text-foreground">{format(eventDate, "PPP")}</span>
                    </div>
                  )}
                  {platforms.length > 0 && (
                    <div className="flex justify-between">
                      <span>Platforms:</span>
                      <span className="font-medium text-foreground">{platforms.join(', ')}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground pt-2 border-t">
                  💡 Payment will be arranged directly between you and the creator
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4 pb-2">
              <Button variant="outline" onClick={() => setStep('questions')} className="gap-1.5">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              <div className="flex-1" />
              <Button
                onClick={handleSubmit}
                disabled={loading || !content.trim() || priceCents <= 0}
                className="gap-1.5"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
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
