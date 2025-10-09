/**
 * Questions Editor - Visual and JSON editor for microservice questions
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, GripVertical, Eye, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface Question {
  id: string;
  label: string;
  type: 'radio' | 'checkbox' | 'text' | 'number' | 'yesno' | 'scale' | 'file';
  required: boolean;
  options?: Array<{ value: string; label: string }>;
}

interface QuestionsEditorProps {
  questions: Question[];
  onSave: (questions: Question[]) => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function QuestionsEditor({ questions, onSave, onCancel, isSaving = false }: QuestionsEditorProps) {
  const { toast } = useToast();
  const [editMode, setEditMode] = useState<'visual' | 'json'>('visual');
  const [localQuestions, setLocalQuestions] = useState<Question[]>(questions);
  const [jsonValue, setJsonValue] = useState(JSON.stringify(questions, null, 2));

  const questionTypes = [
    { value: 'radio', label: 'Single Choice (Radio)' },
    { value: 'checkbox', label: 'Multiple Choice (Checkbox)' },
    { value: 'text', label: 'Text Input' },
    { value: 'number', label: 'Number Input' },
    { value: 'yesno', label: 'Yes/No' },
    { value: 'scale', label: 'Scale (1-5)' },
    { value: 'file', label: 'File Upload' },
  ];

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      label: 'New Question',
      type: 'text',
      required: false,
    };
    setLocalQuestions([...localQuestions, newQuestion]);
  };

  const handleDeleteQuestion = (index: number) => {
    setLocalQuestions(localQuestions.filter((_, i) => i !== index));
  };

  const handleUpdateQuestion = (index: number, updates: Partial<Question>) => {
    const updated = [...localQuestions];
    updated[index] = { ...updated[index], ...updates };
    setLocalQuestions(updated);
  };

  const handleAddOption = (questionIndex: number) => {
    const updated = [...localQuestions];
    const question = updated[questionIndex];
    if (!question.options) question.options = [];
    question.options.push({ value: `option${question.options.length + 1}`, label: '' });
    setLocalQuestions(updated);
  };

  const handleUpdateOption = (questionIndex: number, optionIndex: number, updates: { value?: string; label?: string }) => {
    const updated = [...localQuestions];
    const option = updated[questionIndex].options![optionIndex];
    Object.assign(option, updates);
    setLocalQuestions(updated);
  };

  const handleDeleteOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...localQuestions];
    updated[questionIndex].options = updated[questionIndex].options!.filter((_, i) => i !== optionIndex);
    setLocalQuestions(updated);
  };

  const handleSaveVisual = () => {
    onSave(localQuestions);
  };

  const handleSaveJson = () => {
    try {
      const parsed = JSON.parse(jsonValue);
      if (!Array.isArray(parsed)) {
        throw new Error('Questions must be an array');
      }
      onSave(parsed);
    } catch (error: any) {
      toast({
        title: "Invalid JSON",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleModeChange = (mode: string) => {
    if (mode === 'json') {
      setJsonValue(JSON.stringify(localQuestions, null, 2));
    } else {
      try {
        const parsed = JSON.parse(jsonValue);
        setLocalQuestions(parsed);
      } catch {
        // Keep current if invalid
      }
    }
    setEditMode(mode as 'visual' | 'json');
  };

  return (
    <div className="space-y-4">
      <Tabs value={editMode} onValueChange={handleModeChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="visual">
            <Eye className="h-4 w-4 mr-2" />
            Visual Editor
          </TabsTrigger>
          <TabsTrigger value="json">
            <Code className="h-4 w-4 mr-2" />
            JSON Editor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visual" className="space-y-4 mt-4">
          {localQuestions.map((question, qIndex) => (
            <Card key={qIndex} className="p-4 space-y-4">
              <div className="flex items-start gap-2">
                <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Question ID</Label>
                      <Input
                        value={question.id}
                        onChange={(e) => handleUpdateQuestion(qIndex, { id: e.target.value })}
                        placeholder="e.g., q1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Question Type</Label>
                      <Select
                        value={question.type}
                        onValueChange={(value) => handleUpdateQuestion(qIndex, { type: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {questionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Question Label</Label>
                    <Input
                      value={question.label}
                      onChange={(e) => handleUpdateQuestion(qIndex, { label: e.target.value })}
                      placeholder="What do you want to ask?"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={question.required}
                      onCheckedChange={(checked) => handleUpdateQuestion(qIndex, { required: checked })}
                    />
                    <Label>Required</Label>
                  </div>

                  {(question.type === 'radio' || question.type === 'checkbox') && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Options</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddOption(qIndex)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Option
                        </Button>
                      </div>
                      {question.options?.map((option, oIndex) => (
                        <div key={oIndex} className="flex gap-2">
                          <Input
                            placeholder="Value"
                            value={option.value}
                            onChange={(e) => handleUpdateOption(qIndex, oIndex, { value: e.target.value })}
                            className="w-1/3"
                          />
                          <Input
                            placeholder="Label"
                            value={option.label}
                            onChange={(e) => handleUpdateOption(qIndex, oIndex, { label: e.target.value })}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteOption(qIndex, oIndex)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteQuestion(qIndex)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}

          <Button onClick={handleAddQuestion} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </TabsContent>

        <TabsContent value="json" className="mt-4">
          <Textarea
            value={jsonValue}
            onChange={(e) => setJsonValue(e.target.value)}
            className="font-mono text-sm min-h-[400px]"
            placeholder="Paste your questions JSON here..."
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={editMode === 'visual' ? handleSaveVisual : handleSaveJson} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Questions'}
        </Button>
      </div>
    </div>
  );
}
