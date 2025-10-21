import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, Download, Upload, Copy, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface QuestionOption {
  value: string;
  label: string;
}

interface Question {
  id: string;
  text: string;
  type: 'text' | 'number' | 'single' | 'multi';
  required: boolean;
  options: QuestionOption[];
  min?: number;
  max?: number;
  unit?: string;
}

interface MicroserviceForm {
  mainCategory: string;
  subCategory: string;
  microCategory: string;
  questions: Question[];
}

// Category data structure
const categoryData = {
  'Construction': {
    'Plumbing': ['Pipe Installation', 'Leak Repair', 'Drain Cleaning', 'Water Heater'],
    'Electrical': ['Wiring', 'Panel Upgrade', 'Lighting Installation', 'Outlet Repair'],
    'HVAC': ['AC Installation', 'Heating Repair', 'Ventilation', 'Duct Cleaning'],
    'Carpentry': ['Cabinet Making', 'Door Installation', 'Custom Furniture', 'Trim Work'],
    'Painting': ['Interior Painting', 'Exterior Painting', 'Cabinet Painting', 'Wall Prep']
  },
  'Home Services': {
    'Cleaning': ['Deep Cleaning', 'Regular Cleaning', 'Move Out Cleaning', 'Window Cleaning'],
    'Landscaping': ['Lawn Mowing', 'Tree Trimming', 'Garden Design', 'Irrigation'],
    'Pest Control': ['Termite Treatment', 'Rodent Control', 'Insect Removal', 'Prevention']
  },
  'Renovation': {
    'Kitchen': ['Full Remodel', 'Cabinet Refacing', 'Countertop Install', 'Backsplash'],
    'Bathroom': ['Full Remodel', 'Shower Install', 'Vanity Replace', 'Tile Work'],
    'Flooring': ['Hardwood Install', 'Tile Install', 'Carpet Install', 'Refinishing']
  }
};

function toSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function toKey(text: string, index: number): string {
  const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 30);
  return `q${index + 1}_${slug}`;
}

export default function QuestionBuilder() {
  const { toast } = useToast();
  const [form, setForm] = useState<MicroserviceForm>({
    mainCategory: '',
    subCategory: '',
    microCategory: '',
    questions: []
  });
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    text: '',
    type: 'text',
    required: false,
    options: []
  });
  const [newOption, setNewOption] = useState('');
  const [importing, setImporting] = useState(false);

  // Get available sub categories based on main category
  const availableSubCategories = form.mainCategory 
    ? Object.keys(categoryData[form.mainCategory as keyof typeof categoryData] || {})
    : [];

  // Get available micro categories based on sub category
  const availableMicroCategories = form.mainCategory && form.subCategory
    ? categoryData[form.mainCategory as keyof typeof categoryData]?.[form.subCategory] || []
    : [];

  // Reset child selections when parent changes
  const handleMainCategoryChange = (value: string) => {
    setForm(prev => ({
      ...prev,
      mainCategory: value,
      subCategory: '',
      microCategory: ''
    }));
  };

  const handleSubCategoryChange = (value: string) => {
    setForm(prev => ({
      ...prev,
      subCategory: value,
      microCategory: ''
    }));
  };

  const addOption = () => {
    if (!newOption.trim()) return;
    
    setCurrentQuestion(prev => ({
      ...prev,
      options: [
        ...(prev.options || []),
        { value: toSlug(newOption), label: newOption }
      ]
    }));
    setNewOption('');
  };

  const removeOption = (index: number) => {
    setCurrentQuestion(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index) || []
    }));
  };

  const addQuestion = () => {
    if (!currentQuestion.text?.trim()) {
      toast({
        title: 'Question Required',
        description: 'Please enter a question text',
        variant: 'destructive'
      });
      return;
    }

    const newQuestion: Question = {
      id: crypto.randomUUID(),
      text: currentQuestion.text,
      type: currentQuestion.type || 'text',
      required: currentQuestion.required || false,
      options: currentQuestion.options || [],
      ...(currentQuestion.min !== undefined && { min: currentQuestion.min }),
      ...(currentQuestion.max !== undefined && { max: currentQuestion.max }),
      ...(currentQuestion.unit && { unit: currentQuestion.unit })
    };

    setForm(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));

    setCurrentQuestion({
      text: '',
      type: 'text',
      required: false,
      options: []
    });

    toast({
      title: 'Question Added',
      description: `"${newQuestion.text}" added successfully`
    });
  };

  const removeQuestion = (id: string) => {
    setForm(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== id)
    }));
  };

  const generateJSON = () => {
    if (!form.microCategory.trim()) {
      toast({
        title: 'Micro Category Required',
        description: 'Please enter a micro category (service name)',
        variant: 'destructive'
      });
      return null;
    }

    const microSlug = toSlug(form.microCategory);
    
    const questions = form.questions.map((q, index) => ({
      key: toKey(q.text, index),
      type: q.type,
      i18nKey: q.text,
      required: q.required,
      ...(q.options.length > 0 && {
        options: q.options.map((opt, optIndex) => ({
          value: opt.value,
          i18nKey: opt.label,
          order: optIndex
        }))
      }),
      ...(q.min !== undefined && { min: q.min }),
      ...(q.max !== undefined && { max: q.max }),
      ...(q.unit && { unit: q.unit })
    }));

    return {
      micro_slug: microSlug,
      version: 1,
      status: 'approved' as const,
      source: 'manual' as const,
      is_active: true,
      content: {
        id: crypto.randomUUID(),
        category: form.mainCategory,
        subcategory: form.subCategory,
        name: form.microCategory,
        slug: microSlug,
        i18nPrefix: microSlug.replace(/-/g, '.'),
        questions
      }
    };
  };

  const exportJSON = () => {
    const json = generateJSON();
    if (!json) return;

    const blob = new Blob([JSON.stringify([json], null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${json.micro_slug}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: 'JSON Exported',
      description: 'File downloaded successfully'
    });
  };

  const copyJSON = () => {
    const json = generateJSON();
    if (!json) return;

    navigator.clipboard.writeText(JSON.stringify([json], null, 2));
    toast({
      title: 'JSON Copied',
      description: 'Copied to clipboard'
    });
  };

  const importToDatabase = async () => {
    const json = generateJSON();
    if (!json) return;

    setImporting(true);
    try {
      const { error } = await supabase
        .from('question_packs')
        .insert([json]);

      if (error) throw error;

      toast({
        title: 'Import Successful',
        description: `${form.microCategory} imported to database`
      });

      // Reset form
      setForm({
        mainCategory: '',
        subCategory: '',
        microCategory: '',
        questions: []
      });

    } catch (error: any) {
      toast({
        title: 'Import Failed',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setImporting(false);
    }
  };

  const pasteQuestions = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) {
        toast({
          title: 'Clipboard Empty',
          description: 'No text found in clipboard',
          variant: 'destructive',
        });
        return;
      }

      // Show loading state
      toast({
        title: 'Parsing Questions...',
        description: 'AI is analyzing your input',
      });

      let parsedQuestions;
      try {
        // Try AI parsing first
        const { parseQuestionsWithAI } = await import('@/lib/ai/questionParser');
        const aiParsed = await parseQuestionsWithAI(text);
        
        parsedQuestions = aiParsed.map((q) => ({
          id: crypto.randomUUID(),
          ...q,
        }));

        toast({
          title: 'Questions Parsed Successfully',
          description: `${parsedQuestions.length} questions added with smart formatting`,
        });
      } catch (aiError) {
        console.warn('AI parsing failed, using simple parser:', aiError);
        
        // Fallback to simple parsing
        const { parseQuestionsSimple } = await import('@/lib/ai/questionParser');
        const simpleParsed = parseQuestionsSimple(text);
        
        parsedQuestions = simpleParsed.map((q) => ({
          id: crypto.randomUUID(),
          ...q,
        }));

        toast({
          title: 'Questions Added',
          description: `${parsedQuestions.length} questions added (basic parsing)`,
        });
      }

      setForm((prev) => ({
        ...prev,
        questions: [...prev.questions, ...parsedQuestions],
      }));
    } catch (err) {
      toast({
        title: 'Paste Failed',
        description: err instanceof Error ? err.message : 'Could not read from clipboard',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertDescription>
          <strong>Form Builder:</strong> Create microservices manually by adding questions one-by-one.
          Paste multiple questions at once or build them individually.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Form Builder */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">Service Information</h3>
            
            <div className="space-y-2">
              <Label>Main Category *</Label>
              <Select
                value={form.mainCategory}
                onValueChange={handleMainCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select main category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(categoryData).map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sub Category *</Label>
              <Select
                value={form.subCategory}
                onValueChange={handleSubCategoryChange}
                disabled={!form.mainCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder={form.mainCategory ? "Select sub category" : "Select main category first"} />
                </SelectTrigger>
                <SelectContent>
                  {availableSubCategories.map(subCat => (
                    <SelectItem key={subCat} value={subCat}>
                      {subCat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Micro Category (Service Name) *</Label>
              <Select
                value={form.microCategory}
                onValueChange={(value) => setForm(prev => ({ ...prev, microCategory: value }))}
                disabled={!form.subCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder={form.subCategory ? "Select service" : "Select sub category first"} />
                </SelectTrigger>
                <SelectContent>
                  {availableMicroCategories.map(microCat => (
                    <SelectItem key={microCat} value={microCat}>
                      {microCat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-2">
              <Badge variant="outline">{form.questions.length} questions</Badge>
              {form.microCategory && (
                <Badge variant="secondary">Slug: {toSlug(form.microCategory)}</Badge>
              )}
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Add Question</h3>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={pasteQuestions}
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                Paste Questions from Clipboard (AI-Powered)
              </Button>
              <p className="text-xs text-muted-foreground">
                Paste questions in any format - AI will detect types, options, and structure automatically
              </p>
            </div>

            <div className="space-y-2">
              <Label>Question Text *</Label>
              <Textarea
                placeholder="What is the project location?"
                value={currentQuestion.text || ''}
                onChange={(e) => setCurrentQuestion(prev => ({ ...prev, text: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select
                  value={currentQuestion.type}
                  onValueChange={(value: any) => setCurrentQuestion(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Short Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="single">Single Choice</SelectItem>
                    <SelectItem value="multi">Multiple Choice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentQuestion.required}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, required: e.target.checked }))}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Required</span>
                </label>
              </div>
            </div>

            {(currentQuestion.type === 'single' || currentQuestion.type === 'multi') && (
              <div className="space-y-2">
                <Label>Options</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add option"
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addOption()}
                  />
                  <Button onClick={addOption} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentQuestion.options?.map((opt, index) => (
                    <Badge key={index} variant="secondary" className="gap-2">
                      {opt.label}
                      <button onClick={() => removeOption(index)}>
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {currentQuestion.type === 'number' && (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Min</Label>
                  <Input
                    type="number"
                    value={currentQuestion.min || ''}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max</Label>
                  <Input
                    type="number"
                    value={currentQuestion.max || ''}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Input
                    placeholder="sqft, hours"
                    value={currentQuestion.unit || ''}
                    onChange={(e) => setCurrentQuestion(prev => ({ ...prev, unit: e.target.value }))}
                  />
                </div>
              </div>
            )}

            <Button onClick={addQuestion} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Question
            </Button>
          </Card>
        </div>

        {/* Right: Preview & Actions */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">Questions ({form.questions.length})</h3>
            
            {form.questions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No questions added yet. Add questions using the form or paste multiple questions.
              </p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {form.questions.map((q, index) => (
                  <div key={q.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono text-muted-foreground">Q{index + 1}</span>
                          <Badge variant="outline" className="text-xs">{q.type}</Badge>
                          {q.required && <Badge variant="secondary" className="text-xs">Required</Badge>}
                        </div>
                        <p className="text-sm">{q.text}</p>
                        {q.options.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {q.options.map((opt, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {opt.label}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQuestion(q.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">Actions</h3>
            
            <div className="grid gap-2">
              <Button
                variant="outline"
                onClick={copyJSON}
                disabled={!form.microCategory || form.questions.length === 0}
                className="w-full"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy JSON to Clipboard
              </Button>

              <Button
                variant="outline"
                onClick={exportJSON}
                disabled={!form.microCategory || form.questions.length === 0}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Export as JSON File
              </Button>

              <Button
                onClick={importToDatabase}
                disabled={!form.microCategory || form.questions.length === 0 || importing}
                className="w-full"
              >
                {importing ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-pulse" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Import to Database
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
