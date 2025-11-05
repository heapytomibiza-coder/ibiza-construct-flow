/**
 * QuestionPreview - Show how questions will appear to users
 */

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import type { QuestionDef } from '@/types/packs';

interface QuestionPreviewProps {
  questions: QuestionDef[];
  title?: string;
}

export function QuestionPreview({ questions, title }: QuestionPreviewProps) {
  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-lg font-semibold">{title}</h3>
      )}
      
      {questions.map((question, idx) => (
        <Card key={question.key} className="p-4">
          <div className="space-y-3">
            <Label className="text-base">
              {idx + 1}. {question.i18nKey}
              {question.required && <span className="text-destructive ml-1">*</span>}
            </Label>
            
            {question.type === 'text' && (
              <Input placeholder="Enter your answer..." disabled />
            )}
            
            {question.type === 'number' && (
              <Input type="number" placeholder="0" disabled />
            )}
            
            {question.type === 'single' && question.options && (
              <RadioGroup disabled>
                {question.options.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={opt.value} id={`preview-${question.key}-${opt.value}`} />
                    <Label htmlFor={`preview-${question.key}-${opt.value}`}>{opt.value}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
            
            {question.type === 'multi' && question.options && (
              <div className="space-y-2">
                {question.options.map((opt) => (
                  <div key={opt.value} className="flex items-center space-x-2">
                    <Checkbox id={`preview-${question.key}-${opt.value}`} disabled />
                    <Label htmlFor={`preview-${question.key}-${opt.value}`}>{opt.value}</Label>
                  </div>
                ))}
              </div>
            )}
            
            {question.aiHint && (
              <p className="text-sm text-muted-foreground">{question.aiHint}</p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
