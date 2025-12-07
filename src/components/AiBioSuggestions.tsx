import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Loader2, Check, X } from "lucide-react";

interface AiBioSuggestionsProps {
  text: string;
  onSelect: (text: string) => void;
  minLength?: number;
  type?: 'bio' | 'description';
}

const AiBioSuggestions = ({ 
  text, 
  onSelect, 
  minLength = 20,
  type = 'bio' 
}: AiBioSuggestionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();

  const handleImprove = async () => {
    if (text.length < minLength) {
      toast({
        title: "Need more text",
        description: `Please write at least ${minLength} characters so AI can understand your ${type}`,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setSuggestions([]);
    setShowSuggestions(true);

    try {
      const { data, error } = await supabase.functions.invoke('improve-bio', {
        body: { text, type }
      });

      if (error) throw error;

      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive"
        });
        setShowSuggestions(false);
        return;
      }

      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      } else {
        toast({
          title: "No suggestions",
          description: "Could not generate suggestions. Try adding more detail.",
          variant: "destructive"
        });
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      toast({
        title: "Error",
        description: "Failed to get AI suggestions. Please try again.",
        variant: "destructive"
      });
      setShowSuggestions(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion: string) => {
    onSelect(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
    toast({
      title: "Applied!",
      description: "AI suggestion has been applied to your bio"
    });
  };

  const handleClose = () => {
    setShowSuggestions(false);
    setSuggestions([]);
  };

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleImprove}
        disabled={isLoading || text.length < minLength}
        className="gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Improving...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Improve with AI
          </>
        )}
      </Button>

      {text.length > 0 && text.length < minLength && (
        <p className="text-xs text-muted-foreground">
          Write {minLength - text.length} more characters to enable AI suggestions
        </p>
      )}

      {showSuggestions && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Suggestions
              </CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <div 
                  key={index}
                  className="p-3 rounded-lg bg-background border hover:border-primary/50 cursor-pointer transition-colors group"
                  onClick={() => handleSelectSuggestion(suggestion)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm flex-1">{suggestion}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-2">
                No suggestions available
              </p>
            )}

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClose}
              >
                Keep Original
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AiBioSuggestions;
