import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, User, MessageSquare, Send, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, InputFormField, TextareaFormField } from '@/components/forms';
import { emailSchema, nameSchema, messageSchema } from '@/lib/validation';
import { useToast } from '@/hooks/use-toast';

// Contact form validation schema
const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  message: messageSchema,
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

const Contact = () => {
  const { t } = useTranslation('pages');
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<'idle' | 'success' | 'error'>('idle');

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // TODO: Implement backend contact form submission
      // For now, just simulate submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Contact form submitted:', data);
      setSubmitStatus('success');
      form.reset();
      
      toast({
        title: 'Message sent successfully!',
        description: "We'll get back to you as soon as possible.",
        variant: 'default',
      });
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
      
      toast({
        title: 'Failed to send message',
        description: 'Please try again later or contact us directly.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Contact Us - Get in Touch | CS Ibiza</title>
        <meta 
          name="description" 
          content="Contact CS Ibiza for professional construction and renovation services. Send us a message and we'll get back to you promptly." 
        />
        <link rel="canonical" href="https://csibiza.com/contact" />
      </Helmet>
      <Header />
      <main className="pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-charcoal mb-4">
              {t('contact.hero.title')}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t('contact.hero.subtitle')}
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-primary" />
                  {t('contact.form.title')}
                </CardTitle>
                <CardDescription>{t('contact.form.description', 'Fill out the form below and we\'ll get back to you soon')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <InputFormField
                      control={form.control}
                      name="name"
                      label={t('contact.form.name')}
                      placeholder={t('contact.form.namePlaceholder')}
                      icon={<User className="h-4 w-4" />}
                    />

                    <InputFormField
                      control={form.control}
                      name="email"
                      label={t('contact.form.email')}
                      type="email"
                      placeholder={t('contact.form.emailPlaceholder')}
                      icon={<Mail className="h-4 w-4" />}
                    />

                    <TextareaFormField
                      control={form.control}
                      name="message"
                      label={t('contact.form.message')}
                      placeholder={t('contact.form.messagePlaceholder')}
                      rows={6}
                    />

                    {submitStatus === 'success' && (
                      <div className="flex items-center gap-2 p-4 bg-green-50 border-2 border-green-200 rounded-lg text-green-800 font-medium">
                        <CheckCircle className="h-5 w-5" />
                        <span>Thank you! Your message has been sent successfully.</span>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full gap-2"
                      size="lg"
                    >
                      {isSubmitting ? (
                        <>Sending...</>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          {t('contact.form.submit')}
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card className="border-2 bg-muted/30">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Contact Information</CardTitle>
                <CardDescription>Get in touch with us directly</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      Email
                    </h3>
                    <p className="text-muted-foreground">info@csibiza.com</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Phone</h3>
                    <p className="text-muted-foreground">+34 971 XXX XXX</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Location</h3>
                    <p className="text-muted-foreground">Ibiza, Balearic Islands<br />Spain</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Business Hours</h3>
                    <p className="text-muted-foreground">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 9:00 AM - 2:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;