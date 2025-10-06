import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, FileText, MessageSquare, Scale, Handshake } from 'lucide-react';

interface Template {
  key: string;
  title: string;
  body: string;
  category: string;
  icon: typeof CheckCircle2;
}

const TEMPLATES: Template[] = [
  {
    key: 'accept_fault',
    title: 'Accept responsibility',
    body: 'I accept responsibility for the issue described. I propose the following remedy: [specify details]. I am committed to resolving this fairly and promptly.',
    category: 'resolution',
    icon: CheckCircle2,
  },
  {
    key: 'counter_evidence',
    title: 'Dispute with counter-evidence',
    body: 'Thank you for your message. Based on the attached evidence, I respectfully disagree with the claim because: [explain reasoning]. I have uploaded supporting documentation.',
    category: 'dispute',
    icon: FileText,
  },
  {
    key: 'request_info',
    title: 'Request more information',
    body: 'To help resolve this matter efficiently, could you please provide: (1) [detail 1], (2) [detail 2], (3) [detail 3]. This will help us reach a fair resolution.',
    category: 'inquiry',
    icon: MessageSquare,
  },
  {
    key: 'partial_resolution',
    title: 'Propose partial resolution',
    body: 'To resolve this swiftly, I propose: [specify offer - e.g., partial refund of $X, completion of remaining work by [date], etc.]. Please let me know if this is acceptable.',
    category: 'resolution',
    icon: Handshake,
  },
  {
    key: 'agree_mediation',
    title: 'Agree to mediation',
    body: 'I agree to proceed with mediation to resolve this dispute. I will follow the proposed process and timelines, and commit to working toward a fair outcome.',
    category: 'mediation',
    icon: Scale,
  },
];

interface ResponseTemplateLibraryProps {
  onPick: (template: Template) => void;
}

export function ResponseTemplateLibrary({ onPick }: ResponseTemplateLibraryProps) {
  const [open, setOpen] = useState(false);

  const handlePick = (template: Template) => {
    onPick(template);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="secondary" size="sm">
          <FileText className="w-4 h-4 mr-2" />
          Response Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Response Templates</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Pre-approved templates for professional dispute communication
          </p>
        </DialogHeader>
        <div className="grid gap-3 mt-4">
          {TEMPLATES.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.key}
                onClick={() => handlePick(template)}
                className="flex items-start gap-3 p-4 text-left rounded-lg border bg-card hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{template.title}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {template.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {template.body}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
