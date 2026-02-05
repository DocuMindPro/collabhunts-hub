import { useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedSection from "@/components/AnimatedSection";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: number;
  quote: string;
  author: string;
  role: string;
  avatar?: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote: "CollabHunts made it incredibly easy to find the perfect creator for our cafe opening. The response was amazing!",
    author: "Sarah M.",
    role: "Cafe Owner",
    rating: 5
  },
  {
    id: 2,
    quote: "Finally, a platform where I can connect directly with brands. No middlemen, no hidden fees — just real opportunities.",
    author: "Ahmad K.",
    role: "Lifestyle Creator",
    rating: 5
  },
  {
    id: 3,
    quote: "We've booked 5 creators through CollabHunts this month alone. Our in-store events have never been better!",
    author: "Maya R.",
    role: "Marketing Manager",
    rating: 5
  },
  {
    id: 4,
    quote: "The AI-drafted agreements save so much time. Professional and hassle-free from start to finish.",
    author: "Nour H.",
    role: "Brand Owner",
    rating: 5
  }
];

const TestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <AnimatedSection animation="fade-up" className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-3">
            What Our Users Say
          </h2>
        </AnimatedSection>

        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Testimonial Card */}
            <div className="bg-card rounded-2xl p-8 md:p-12 border border-border/50 shadow-card text-center min-h-[280px] flex flex-col items-center justify-center">
              {/* Stars */}
              <div className="flex items-center justify-center gap-1 mb-6">
                {[...Array(currentTestimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-xl md:text-2xl font-medium text-foreground mb-6 leading-relaxed">
                "{currentTestimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center justify-center gap-3">
                {currentTestimonial.avatar ? (
                  <img
                    src={currentTestimonial.avatar}
                    alt={currentTestimonial.author}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {currentTestimonial.author.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="text-left">
                  <p className="font-semibold text-foreground">{currentTestimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{currentTestimonial.role}</p>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-card shadow-md hover:bg-card"
              onClick={goToPrevious}
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-card shadow-md hover:bg-card"
              onClick={goToNext}
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  currentIndex === index 
                    ? "bg-primary w-6" 
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;
