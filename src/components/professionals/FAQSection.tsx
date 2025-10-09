import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs?: FAQ[];
  professionalName?: string;
}

const defaultFAQs: FAQ[] = [
  {
    question: 'What areas do you serve?',
    answer: 'I provide services across the island of Ibiza, including San Antonio, Santa Eulalia, Ibiza Town, and surrounding areas. For projects in more remote locations, please contact me to discuss availability.'
  },
  {
    question: 'Do you provide free quotes?',
    answer: 'Yes! I offer free, no-obligation quotes for all projects. I can often provide an initial estimate after viewing photos, with detailed quotes given after an on-site visit.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'I accept bank transfers, cash, and card payments. For larger projects, I offer flexible payment plans with deposits and milestone payments.'
  },
  {
    question: 'Are you licensed and insured?',
    answer: 'Yes, I am fully licensed and carry comprehensive liability insurance. All work is guaranteed and meets local building regulations.'
  },
  {
    question: 'What is your typical response time?',
    answer: 'I typically respond to inquiries within 24 hours, often much sooner. For urgent matters, please mark your message as urgent and I will prioritize it.'
  },
  {
    question: 'Do you offer warranties on your work?',
    answer: 'Yes, all my work comes with a warranty. The length depends on the type of work performed, typically ranging from 1-5 years for various services.'
  }
];

export const FAQSection = ({
  faqs = defaultFAQs,
  professionalName = 'this professional'
}: FAQSectionProps) => {
  return (
    <Card className="card-luxury">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          Frequently Asked Questions
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Common questions about working with {professionalName}
        </p>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left hover:text-primary transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};
