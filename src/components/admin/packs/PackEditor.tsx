/**
 * Visual Question Pack Editor
 * Allows viewing and editing all questions in a pack
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Trash2, Plus, Save, ArrowLeft, GripVertical, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGetAdminPacks, usePostAdminPacksImport } from '../../../../packages/@contracts/clients/packs';
import type { MicroserviceDef, QuestionDef, QuestionOption as ApiQuestionOption } from '../../../../packages/@contracts/clients/types';

export function PackEditor() {
  const { packId } = useParams<{ packId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: packs = [] } = useGetAdminPacks({ slug: undefined });
  const importMutation = usePostAdminPacksImport();
  
  const [packData, setPackData] = useState<MicroserviceDef | null>(null);
  const [questions, setQuestions] = useState<QuestionDef[]>([]);
  const [metadata, setMetadata] = useState({ category: '', name: '', slug: '' });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (packId && packs.length > 0) {
      const pack = packs.find(p => p.pack_id === packId);
      if (pack) {
        setPackData(pack.content);
        setQuestions(pack.content.questions || []);
        setMetadata({
          category: pack.content.category || '',
          name: pack.content.name || '',
          slug: pack.micro_slug
        });
      }
    }
  }, [packId, packs]);

  const addQuestion = () => {
    const newQuestion: QuestionDef = {
      key: `q_${questions.length + 1}`,
      i18nKey: `question_${questions.length + 1}`,
      type: 'text',
      required: false,
      options: []
    };
    setQuestions([...questions, newQuestion]);
    setHasChanges(true);
  };

  const updateQuestion = (index: number, field: keyof QuestionDef, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
    setHasChanges(true);
  };

  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  const duplicateQuestion = (index: number) => {
    const duplicate = { ...questions[index], key: `${questions[index].key}_copy` };
    setQuestions([...questions.slice(0, index + 1), duplicate, ...questions.slice(index + 1)]);
    setHasChanges(true);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === questions.length - 1)
    ) return;

    const updated = [...questions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setQuestions(updated);
    setHasChanges(true);
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    const options = updated[questionIndex].options || [];
    options.push({ 
      i18nKey: `option_${options.length + 1}`, 
      value: `option_${options.length + 1}`, 
      order: options.length 
    });
    updated[questionIndex].options = options;
    setQuestions(updated);
    setHasChanges(true);
  };

  const updateOption = (questionIndex: number, optionIndex: number, field: keyof ApiQuestionOption, value: string | number) => {
    const updated = [...questions];
    const options = updated[questionIndex].options || [];
    options[optionIndex] = { ...options[optionIndex], [field]: value };
    updated[questionIndex].options = options;
    setQuestions(updated);
    setHasChanges(true);
  };

  const deleteOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    const options = (updated[questionIndex].options || []).filter((_, i) => i !== optionIndex);
    updated[questionIndex].options = options;
    setQuestions(updated);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!packData || !metadata.slug) {
      toast({ title: 'Error', description: 'Missing pack data', variant: 'destructive' });
      return;
    }

    const updatedContent: MicroserviceDef = {
      ...packData,
      category: metadata.category,
      name: metadata.name,
      questions
    };

    try {
      await importMutation.mutateAsync({
        slug: metadata.slug,
        content: updatedContent,
        source: 'manual'
      });
      
      toast({ title: 'Success', description: 'Pack saved successfully' });
      setHasChanges(false);
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error instanceof Error ? error.message : 'Failed to save pack',
        variant: 'destructive' 
      });
    }
  };

  if (!packData) {
    return (
      <div className="p-8">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Loading pack data...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/questions')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Question Pack</h1>
            <p className="text-sm text-muted-foreground">{metadata.slug}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Badge variant="secondary">Unsaved Changes</Badge>
          )}
          <Button onClick={handleSave} disabled={importMutation.isPending || !hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Metadata Section */}
      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">Pack Metadata</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Input
              value={metadata.category}
              onChange={(e) => {
                setMetadata({ ...metadata, category: e.target.value });
                setHasChanges(true);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              value={metadata.name}
              onChange={(e) => {
                setMetadata({ ...metadata, name: e.target.value });
                setHasChanges(true);
              }}
            />
          </div>
        </div>
      </Card>

      {/* Questions Section */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Questions ({questions.length})</h2>
          <Button onClick={addQuestion} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No questions yet. Click "Add Question" to get started.
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-2">
            {questions.map((question, index) => (
              <AccordionItem key={question.key} value={question.key} className="border rounded-lg">
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-3 flex-1">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Q{index + 1}</span>
                    <span className="text-sm text-muted-foreground flex-1 text-left">
                      {question.key}
                    </span>
                    <Badge variant="outline">{question.type}</Badge>
                    {question.required && <Badge variant="secondary">Required</Badge>}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 space-y-4">
                  {/* Question Controls */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveQuestion(index, 'up')}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => moveQuestion(index, 'down')}
                      disabled={index === questions.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => duplicateQuestion(index)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteQuestion(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Question Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Question Key</Label>
                      <Input
                        value={question.key}
                        onChange={(e) => updateQuestion(index, 'key', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>i18n Key</Label>
                      <Input
                        value={question.i18nKey}
                        onChange={(e) => updateQuestion(index, 'i18nKey', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={question.type}
                        onValueChange={(value) => updateQuestion(index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="number">Number</SelectItem>
                          <SelectItem value="single">Single Select</SelectItem>
                          <SelectItem value="multi">Multi Select</SelectItem>
                          <SelectItem value="yesno">Yes/No</SelectItem>
                          <SelectItem value="scale">Scale</SelectItem>
                          <SelectItem value="file">File</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={question.required || false}
                      onCheckedChange={(checked) => updateQuestion(index, 'required', checked)}
                    />
                    <Label>Required</Label>
                  </div>

                  {/* Options for select types */}
                  {(question.type === 'single' || question.type === 'multi') && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Options</Label>
                        <Button size="sm" variant="outline" onClick={() => addOption(index)}>
                          <Plus className="h-4 w-4 mr-1" />
                          Add Option
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {(question.options || []).map((option, optIndex) => (
                          <div key={optIndex} className="flex gap-2 items-center">
                            <Input
                              placeholder="i18n Key"
                              value={option.i18nKey}
                              onChange={(e) => updateOption(index, optIndex, 'i18nKey', e.target.value)}
                              className="flex-1"
                            />
                            <Input
                              placeholder="Value"
                              value={option.value}
                              onChange={(e) => updateOption(index, optIndex, 'value', e.target.value)}
                              className="flex-1"
                            />
                            <Input
                              type="number"
                              placeholder="Order"
                              value={option.order}
                              onChange={(e) => updateOption(index, optIndex, 'order', parseInt(e.target.value))}
                              className="w-20"
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteOption(index, optIndex)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </Card>
    </div>
  );
}
