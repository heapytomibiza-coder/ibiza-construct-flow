/**
 * QuestionEditor - Edit a single question
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, GripVertical, Plus } from 'lucide-react';
import type { QuestionType, QuestionOption } from '@/types/packs';

export interface EditableQuestion {
  tempId: string;
  key: string;
  type: QuestionType;
  i18nKey: string;
  required?: boolean;
  options?: QuestionOption[];
  text?: string; // For display
}

interface QuestionEditorProps {
  question: EditableQuestion;
  index: number;
  onUpdate: (tempId: string, updates: Partial<EditableQuestion>) => void;
  onRemove: (tempId: string) => void;
  onMoveUp?: (tempId: string) => void;
  onMoveDown?: (tempId: string) => void;
  isDragging?: boolean;
}

export function QuestionEditor({
  question,
  index,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
  isDragging,
}: QuestionEditorProps) {
  const addOption = () => {
    const newOption: QuestionOption = {
      i18nKey: `${question.i18nKey}.option_${(question.options?.length || 0) + 1}`,
      value: `option_${(question.options?.length || 0) + 1}`,
      order: question.options?.length || 0,
    };
    onUpdate(question.tempId, {
      options: [...(question.options || []), newOption],
    });
  };
  
  const updateOption = (idx: number, updates: Partial<QuestionOption>) => {
    const newOptions = [...(question.options || [])];
    newOptions[idx] = { ...newOptions[idx], ...updates };
    onUpdate(question.tempId, { options: newOptions });
  };
  
  const removeOption = (idx: number) => {
    const newOptions = question.options?.filter((_, i) => i !== idx) || [];
    onUpdate(question.tempId, { options: newOptions });
  };
  
  return (
    <Card className={`p-4 ${isDragging ? 'opacity-50' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="mt-2 cursor-grab active:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Question {index + 1}</Label>
            <div className="flex items-center gap-2">
              {onMoveUp && (
                <Button size="sm" variant="ghost" onClick={() => onMoveUp(question.tempId)}>↑</Button>
              )}
              {onMoveDown && (
                <Button size="sm" variant="ghost" onClick={() => onMoveDown(question.tempId)}>↓</Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onRemove(question.tempId)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <Label>Question Text</Label>
            <Input
              value={question.text || ''}
              onChange={(e) => onUpdate(question.tempId, { text: e.target.value })}
              placeholder="What is your question?"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <RadioGroup
                value={question.type}
                onValueChange={(value) => onUpdate(question.tempId, { type: value as QuestionType })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id={`${question.tempId}-radio`} />
                  <Label htmlFor={`${question.tempId}-radio`}>Radio</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="multi" id={`${question.tempId}-checkbox`} />
                  <Label htmlFor={`${question.tempId}-checkbox`}>Checkbox</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="text" id={`${question.tempId}-text`} />
                  <Label htmlFor={`${question.tempId}-text`}>Text</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${question.tempId}-required`}
                checked={question.required}
                onCheckedChange={(checked) => 
                  onUpdate(question.tempId, { required: checked === true })
                }
              />
              <Label htmlFor={`${question.tempId}-required`}>Required</Label>
            </div>
          </div>
          
          {(question.type === 'single' || question.type === 'multi') && (
            <div className="space-y-2">
              <Label>Options</Label>
              {question.options?.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={opt.value}
                    onChange={(e) => updateOption(idx, { value: e.target.value })}
                    placeholder="Option value"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeOption(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button size="sm" variant="outline" onClick={addOption}>
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
