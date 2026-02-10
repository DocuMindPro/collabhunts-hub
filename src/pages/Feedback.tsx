import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquareHeart, ThumbsDown, ThumbsUp, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const feedbackSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(50),
  last_name: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Please enter a valid email"),
  details: z.string().min(10, "Please provide at least 10 characters of feedback").max(2000),
  rating: z.number().min(1).max(3),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

const ratingOptions = [
  { value: 1, label: "Needs Improvement", icon: ThumbsDown, color: "text-red-500 border-red-500 bg-red-50" },
  { value: 2, label: "Good", icon: ThumbsUp, color: "text-amber-500 border-amber-500 bg-amber-50" },
  { value: 3, label: "Excellent", icon: Trophy, color: "text-green-500 border-green-500 bg-green-50" },
];

const Feedback = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      details: "",
      rating: 0 as any,
    },
  });

  const selectedRating = form.watch("rating");

  const onSubmit = async (data: FeedbackFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("feedbacks").insert({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        details: data.details,
        rating: data.rating,
      });

      if (error) throw error;

      // Send email notification
      try {
        await supabase.functions.invoke("send-notification-email", {
          body: {
            type: "feedback_submitted",
            to_email: "care@collabhunts.com",
            to_name: "CollabHunts Team",
            data: {
              first_name: data.first_name,
              last_name: data.last_name,
              email: data.email,
              details: data.details,
              rating: data.rating,
              rating_label: ratingOptions.find(r => r.value === data.rating)?.label || "",
            },
          },
        });
      } catch (emailError) {
        console.error("Failed to send notification email:", emailError);
      }

      setSubmitted(true);
      toast({
        title: "Thank you for your feedback!",
        description: "We appreciate you taking the time to share your thoughts.",
      });
    } catch (error: any) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-2xl">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <MessageSquareHeart className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-3">Share Your Feedback</h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Help us improve CollabHunts. Your feedback matters and is reviewed by our team.
          </p>
        </div>

        {submitted ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <Trophy className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-heading font-semibold mb-2">Thank You!</h2>
              <p className="text-muted-foreground mb-6">
                Your feedback has been submitted successfully. We'll review it shortly.
              </p>
              <Button onClick={() => { setSubmitted(false); form.reset(); }}>
                Submit Another
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="details"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Feedback Details</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your experience, suggestions, or any issues you've encountered..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>How would you rate your experience?</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-3 gap-3">
                            {ratingOptions.map((option) => {
                              const Icon = option.icon;
                              const isSelected = field.value === option.value;
                              return (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => field.onChange(option.value)}
                                  className={cn(
                                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all cursor-pointer",
                                    isSelected
                                      ? option.color
                                      : "border-border hover:border-muted-foreground/30"
                                  )}
                                >
                                  <Icon className={cn("h-6 w-6", isSelected ? "" : "text-muted-foreground")} />
                                  <span className={cn("text-xs font-medium text-center", isSelected ? "" : "text-muted-foreground")}>
                                    {option.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || !selectedRating}
                    size="lg"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Feedback;
