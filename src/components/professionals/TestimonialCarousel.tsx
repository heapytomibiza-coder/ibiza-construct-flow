import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface Testimonial {
  id: string;
  clientName: string;
  clientAvatar?: string;
  rating: number;
  comment: string;
  projectType?: string;
  date: string;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  autoplay?: boolean;
  interval?: number;
}

export const TestimonialCarousel = ({
  testimonials,
  autoplay = true,
  interval = 5000
}: TestimonialCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoplay || testimonials.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoplay, interval, testimonials.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  if (!testimonials || testimonials.length === 0) return null;

  const currentTestimonial = testimonials[currentIndex];

  return (
    <Card className="card-luxury overflow-hidden">
      <CardContent className="p-0">
        <div className="relative min-h-[300px] flex items-center">
          {/* Quote Icon */}
          <div className="absolute top-6 left-6 text-primary/10">
            <Quote className="w-16 h-16 sm:w-20 sm:h-20" />
          </div>

          {/* Content */}
          <div className="relative w-full p-6 sm:p-8 md:p-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Rating */}
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= currentTestimonial.rating
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-muted'
                      }`}
                    />
                  ))}
                </div>

                {/* Comment */}
                <blockquote className="text-lg sm:text-xl font-medium leading-relaxed">
                  "{currentTestimonial.comment}"
                </blockquote>

                {/* Client Info */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 border-2 border-primary/20">
                    <AvatarImage src={currentTestimonial.clientAvatar} />
                    <AvatarFallback>
                      {currentTestimonial.clientName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{currentTestimonial.clientName}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {currentTestimonial.projectType && (
                        <>
                          <span>{currentTestimonial.projectType}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>{currentTestimonial.date}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            {testimonials.length > 1 && (
              <div className="flex items-center justify-between mt-8">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handlePrevious}
                    className="touch-target"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleNext}
                    className="touch-target"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Dots */}
                <div className="flex gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all touch-target ${
                        index === currentIndex
                          ? 'bg-primary w-8'
                          : 'bg-muted hover:bg-primary/50'
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
