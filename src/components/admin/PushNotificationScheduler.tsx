import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Bell, Send, Loader2, CheckCircle, XCircle, CalendarIcon, Clock, Plus, X, Repeat } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format, addDays, addWeeks, addMonths } from "date-fns";
import { cn } from "@/lib/utils";

type SendMode = "now" | "schedule" | "multi";
type RepeatType = "none" | "daily" | "weekly" | "monthly";

interface PushNotificationSchedulerProps {
  onScheduled: () => void;
}

function generateOccurrences(startDate: Date, endDate: Date, repeatType: RepeatType): Date[] {
  const dates: Date[] = [new Date(startDate)];
  let current = new Date(startDate);
  const addFn = repeatType === "daily" ? addDays : repeatType === "weekly" ? addWeeks : addMonths;

  while (true) {
    current = addFn(current, 1);
    if (current > endDate) break;
    dates.push(new Date(current));
  }
  return dates;
}

const PushNotificationScheduler = ({ onScheduled }: PushNotificationSchedulerProps) => {
  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");
  const [sendMode, setSendMode] = useState<SendMode>("now");
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [scheduleTime, setScheduleTime] = useState("12:00");
  const [isSendingPush, setIsSendingPush] = useState(false);
  const [pushResult, setPushResult] = useState<{ success: boolean; message: string } | null>(null);

  // Multi-date state
  const [multiDates, setMultiDates] = useState<Date[]>([]);
  const [multiPickerDate, setMultiPickerDate] = useState<Date | undefined>(undefined);

  // Repeat state
  const [repeatType, setRepeatType] = useState<RepeatType>("none");
  const [repeatEndDate, setRepeatEndDate] = useState<Date | undefined>(undefined);

  const addMultiDate = () => {
    if (multiPickerDate && !multiDates.some(d => d.toDateString() === multiPickerDate.toDateString())) {
      setMultiDates(prev => [...prev, multiPickerDate].sort((a, b) => a.getTime() - b.getTime()));
      setMultiPickerDate(undefined);
    }
  };

  const removeMultiDate = (index: number) => {
    setMultiDates(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setPushTitle("");
    setPushBody("");
    setScheduleDate(undefined);
    setMultiDates([]);
    setMultiPickerDate(undefined);
    setRepeatType("none");
    setRepeatEndDate(undefined);
  };

  const sendNow = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-push-to-creators`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: pushTitle, body: pushBody }),
      }
    );

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to send push notifications");

    setPushResult({
      success: true,
      message: `Sent to ${result.sent} device(s) across ${result.total_creators} creator(s). ${result.failed > 0 ? `${result.failed} failed.` : ""}`,
    });
    toast.success(`Push notification sent to ${result.sent} device(s)`);
  };

  const scheduleSingle = async () => {
    if (!scheduleDate) { toast.error("Please select a date"); return; }

    const [hours, minutes] = scheduleTime.split(":").map(Number);
    const scheduledAt = new Date(scheduleDate);
    scheduledAt.setHours(hours, minutes, 0, 0);

    if (scheduledAt <= new Date()) { toast.error("Scheduled time must be in the future"); return; }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // If repeat is set, generate occurrences
    if (repeatType !== "none") {
      if (!repeatEndDate) { toast.error("Please select a repeat end date"); return; }
      const occurrences = generateOccurrences(scheduledAt, repeatEndDate, repeatType);

      // Insert parent
      const { data: parent, error: parentErr } = await supabase
        .from("scheduled_push_notifications")
        .insert({
          title: pushTitle,
          body: pushBody,
          scheduled_at: occurrences[0].toISOString(),
          created_by: user.id,
          repeat_type: repeatType,
          repeat_end_date: repeatEndDate.toISOString(),
        } as any)
        .select()
        .single();

      if (parentErr) throw parentErr;

      // Insert children
      if (occurrences.length > 1) {
        const children = occurrences.slice(1).map(date => ({
          title: pushTitle,
          body: pushBody,
          scheduled_at: date.toISOString(),
          created_by: user.id,
          parent_id: (parent as any).id,
        }));
        const { error: childErr } = await supabase
          .from("scheduled_push_notifications")
          .insert(children as any);
        if (childErr) throw childErr;
      }

      setPushResult({
        success: true,
        message: `Scheduled ${occurrences.length} ${repeatType} notification(s) from ${format(occurrences[0], "MMM d")} to ${format(repeatEndDate, "MMM d, yyyy")}`,
      });
      toast.success(`${occurrences.length} notifications scheduled!`);
    } else {
      // Single schedule
      const { error } = await supabase
        .from("scheduled_push_notifications")
        .insert({
          title: pushTitle,
          body: pushBody,
          scheduled_at: scheduledAt.toISOString(),
          created_by: user.id,
        });
      if (error) throw error;

      setPushResult({
        success: true,
        message: `Notification scheduled for ${format(scheduledAt, "MMM d, yyyy 'at' h:mm a")}`,
      });
      toast.success("Notification scheduled!");
    }
  };

  const scheduleMultiple = async () => {
    if (multiDates.length === 0) { toast.error("Please add at least one date"); return; }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const [hours, minutes] = scheduleTime.split(":").map(Number);
    const rows = multiDates.map(date => {
      const scheduledAt = new Date(date);
      scheduledAt.setHours(hours, minutes, 0, 0);
      return {
        title: pushTitle,
        body: pushBody,
        scheduled_at: scheduledAt.toISOString(),
        created_by: user.id,
      };
    });

    const { error } = await supabase.from("scheduled_push_notifications").insert(rows);
    if (error) throw error;

    setPushResult({
      success: true,
      message: `Scheduled ${multiDates.length} notification(s) on ${multiDates.map(d => format(d, "MMM d")).join(", ")}`,
    });
    toast.success(`${multiDates.length} notifications scheduled!`);
  };

  const handleSubmit = async () => {
    if (!pushTitle || !pushBody) { toast.error("Please fill in title and message"); return; }

    setIsSendingPush(true);
    setPushResult(null);

    try {
      if (sendMode === "now") await sendNow();
      else if (sendMode === "schedule") await scheduleSingle();
      else await scheduleMultiple();
      resetForm();
      onScheduled();
    } catch (error: any) {
      console.error("Error:", error);
      setPushResult({ success: false, message: error.message || "Failed" });
      toast.error(error.message || "Failed");
    } finally {
      setIsSendingPush(false);
    }
  };

  const isSubmitDisabled =
    isSendingPush || !pushTitle || !pushBody ||
    (sendMode === "schedule" && !scheduleDate) ||
    (sendMode === "schedule" && repeatType !== "none" && !repeatEndDate) ||
    (sendMode === "multi" && multiDates.length === 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notification to Creators
        </CardTitle>
        <CardDescription>
          Send push notifications to all creators. Send now, schedule once, schedule multiple dates, or set a recurring schedule.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="push-title">Notification Title</Label>
          <Input
            id="push-title"
            placeholder="e.g., New Opportunity Available!"
            value={pushTitle}
            onChange={(e) => setPushTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="push-body">Notification Message</Label>
          <Textarea
            id="push-body"
            placeholder="e.g., A brand is looking for creators in your area. Check it out!"
            value={pushBody}
            onChange={(e) => setPushBody(e.target.value)}
            rows={3}
          />
        </div>

        {/* Send Mode */}
        <div className="space-y-3">
          <Label>Delivery</Label>
          <RadioGroup
            value={sendMode}
            onValueChange={(v) => setSendMode(v as SendMode)}
            className="flex flex-wrap gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="now" id="mode-now" />
              <Label htmlFor="mode-now" className="font-normal cursor-pointer">Send Now</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="schedule" id="mode-schedule" />
              <Label htmlFor="mode-schedule" className="font-normal cursor-pointer">Schedule</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="multi" id="mode-multi" />
              <Label htmlFor="mode-multi" className="font-normal cursor-pointer">Multiple Dates</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Single Schedule */}
        {sendMode === "schedule" && (
          <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !scheduleDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduleDate ? format(scheduleDate, "MMM d, yyyy") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={scheduleDate} onSelect={setScheduleDate} disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label htmlFor="schedule-time">Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="schedule-time" type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="pl-10" />
                </div>
              </div>
            </div>

            {/* Repeat Options */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5"><Repeat className="h-3.5 w-3.5" />Repeat</Label>
                <Select value={repeatType} onValueChange={(v) => setRepeatType(v as RepeatType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Repeat</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {repeatType !== "none" && (
                <div className="space-y-2">
                  <Label>Repeat Until</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !repeatEndDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {repeatEndDate ? format(repeatEndDate, "MMM d, yyyy") : "End date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={repeatEndDate} onSelect={setRepeatEndDate} disabled={(date) => date < (scheduleDate || new Date())} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>

            {repeatType !== "none" && scheduleDate && repeatEndDate && (
              <p className="text-xs text-muted-foreground">
                Will create {generateOccurrences(scheduleDate, repeatEndDate, repeatType).length} notification(s) — {repeatType} from {format(scheduleDate, "MMM d")} to {format(repeatEndDate, "MMM d, yyyy")}
              </p>
            )}
          </div>
        )}

        {/* Multiple Dates */}
        {sendMode === "multi" && (
          <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
            <div className="space-y-2">
              <Label htmlFor="multi-time">Time (same for all dates)</Label>
              <div className="relative max-w-[200px]">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="multi-time" type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="pl-10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Add Dates</Label>
              <div className="flex items-end gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("justify-start text-left font-normal", !multiPickerDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {multiPickerDate ? format(multiPickerDate, "MMM d, yyyy") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={multiPickerDate} onSelect={setMultiPickerDate} disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus />
                  </PopoverContent>
                </Popover>
                <Button type="button" variant="secondary" size="sm" onClick={addMultiDate} disabled={!multiPickerDate}>
                  <Plus className="h-4 w-4 mr-1" />Add
                </Button>
              </div>
            </div>

            {multiDates.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {multiDates.map((date, i) => (
                  <Badge key={i} variant="secondary" className="gap-1 py-1 px-2.5">
                    {format(date, "MMM d, yyyy")}
                    <button type="button" onClick={() => removeMultiDate(i)} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <p className="text-xs text-muted-foreground">
              {multiDates.length === 0 ? "No dates selected yet." : `${multiDates.length} date(s) selected. All will be sent at ${scheduleTime}.`}
            </p>
          </div>
        )}

        <Button onClick={handleSubmit} disabled={isSubmitDisabled} className="gap-2">
          {isSendingPush ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : sendMode === "now" ? (
            <Send className="h-4 w-4" />
          ) : (
            <Clock className="h-4 w-4" />
          )}
          {sendMode === "now" ? "Send to All Creators" : sendMode === "multi" ? `Schedule ${multiDates.length} Notification(s)` : repeatType !== "none" ? "Schedule Recurring" : "Schedule Notification"}
        </Button>

        {pushResult && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${pushResult.success ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" : "bg-destructive/10 text-destructive"}`}>
            {pushResult.success ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
            <span>{pushResult.message}</span>
          </div>
        )}

        <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
          <strong>Note:</strong> Push notifications are sent via Firebase Cloud Messaging. Only creators with the mobile app installed and push enabled will receive them. Firebase credentials must be configured.
        </div>
      </CardContent>
    </Card>
  );
};

export default PushNotificationScheduler;
