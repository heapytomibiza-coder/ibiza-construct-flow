import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Send } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface QuickContactFormProps {
  professionalId: string;
  professionalName: string;
  onSubmit?: (data: ContactFormData) => void;
}

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export const QuickContactForm = ({
  professionalId,
  professionalName,
  onSubmit
}: QuickContactFormProps) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      
      toast.success('Message sent successfully!');
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Card className="card-luxury">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          Quick Contact
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Send a message directly to {professionalName}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium block mb-2">
              Your Name *
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
              className="mobile-optimized-input"
              aria-required="true"
            />
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium block mb-2">
              Email Address *
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
              className="mobile-optimized-input"
              aria-required="true"
            />
          </div>

          <div>
            <label htmlFor="phone" className="text-sm font-medium block mb-2">
              Phone Number
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+34 123 456 789"
              className="mobile-optimized-input"
            />
          </div>

          <div>
            <label htmlFor="message" className="text-sm font-medium block mb-2">
              Your Message *
            </label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us about your project..."
              rows={5}
              required
              className="mobile-optimized-input resize-none"
              aria-required="true"
            />
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              type="submit"
              size="lg"
              className="w-full touch-target"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </motion.div>

          <p className="text-xs text-muted-foreground text-center">
            By submitting this form, you agree to be contacted about your inquiry.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
