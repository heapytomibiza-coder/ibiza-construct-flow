import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, Download, Upload, Copy, CheckCircle2, FileEdit, X, FolderOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePostAdminPacksImport, useGetAdminPacks } from '../../../../packages/@contracts/clients/packs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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

function toSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function toKey(text: string, index: number): string {
  const slug = text.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 30);
  return `q${index + 1}_${slug}`;
}

interface QuestionBuilderProps {
  packToEdit?: string | null;
  onClearEdit?: () => void;
}

export default function QuestionBuilder({ packToEdit, onClearEdit }: QuestionBuilderProps) {
  const { toast } = useToast();
  const importMutation = usePostAdminPacksImport();
  const { data: allPacks = [], isLoading: packsLoading } = useGetAdminPacks({});
  
  const [editingPackId, setEditingPackId] = useState<string | null>(null);
  const [loadPackOpen, setLoadPackOpen] = useState(false);
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
  const [pasteText, setPasteText] = useState('');
  const [jsonImport, setJsonImport] = useState('');
  
  // Dynamic category data from database
  const [mainCategories, setMainCategories] = useState<Array<{id: string, name: string}>>([]);
  const [subcategories, setSubcategories] = useState<Array<{id: string, name: string}>>([]);
  const [microCategories, setMicroCategories] = useState<Array<{id: string, name: string}>>([]);
  const [loading, setLoading] = useState(true);

  // Load main categories on mount
  useEffect(() => {
    loadMainCategories();
  }, []);

  // Load subcategories when main category changes
  useEffect(() => {
    if (form.mainCategory) {
      loadSubcategories(form.mainCategory);
    } else {
      setSubcategories([]);
      setForm(prev => ({ ...prev, subCategory: '', microCategory: '' }));
    }
  }, [form.mainCategory]);

  // Load micro-categories when subcategory changes
  useEffect(() => {
    if (form.subCategory) {
      loadMicroCategories(form.subCategory);
    } else {
      setMicroCategories([]);
      setForm(prev => ({ ...prev, microCategory: '' }));
    }
  }, [form.subCategory]);
  
  // Load pack when packToEdit changes
  useEffect(() => {
    if (packToEdit && allPacks.length > 0) {
      const pack = allPacks.find(p => p.pack_id === packToEdit);
      if (pack) {
        loadPackIntoForm(pack);
      }
    }
  }, [packToEdit, allPacks]);
  
  const loadPackIntoForm = (pack: any) => {
    const content = pack.content;
    
    setForm({
      mainCategory: content.category || '',
      subCategory: content.subcategory || '',
      microCategory: content.name || '',
      questions: content.questions.map((q: any, idx: number) => ({
        id: crypto.randomUUID(),
        text: q.i18nKey || q.key,
        type: q.type,
        required: q.required || false,
        options: q.options?.map((opt: any) => ({
          value: opt.value,
          label: opt.i18nKey || opt.value,
        })) || [],
        ...(q.min !== undefined && { min: q.min }),
        ...(q.max !== undefined && { max: q.max }),
        ...(q.unit && { unit: q.unit }),
      }))
    });
    
    setEditingPackId(pack.pack_id);
    
    toast({
      title: 'Pack Loaded',
      description: `Editing ${content.name} v${pack.version}`,
    });
  };
  
  const clearEditMode = () => {
    setEditingPackId(null);
    setForm({
      mainCategory: '',
      subCategory: '',
      microCategory: '',
      questions: []
    });
    onClearEdit?.();
    
    toast({
      title: 'Cleared',
      description: 'Ready to create a new pack',
    });
  };

  const loadMainCategories = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('category_group', { ascending: true })
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      if (data) setMainCategories(data);
    } catch (error) {
      console.error('Error loading main categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load categories',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSubcategories = async (categoryName: string) => {
    try {
      // First get category ID by name
      const { data: catData, error: catError } = await supabase
        .from('service_categories')
        .select('id')
        .eq('name', categoryName)
        .single();
      
      if (catError || !catData) {
        console.error('Category not found:', categoryName);
        return;
      }
      
      // Then get subcategories
      const { data, error } = await supabase
        .from('service_subcategories')
        .select('id, name')
        .eq('category_id', catData.id)
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      if (data) setSubcategories(data);
    } catch (error) {
      console.error('Error loading subcategories:', error);
    }
  };

  const loadMicroCategories = async (subcategoryName: string) => {
    try {
      // Get subcategory ID
      const { data: subData, error: subError } = await supabase
        .from('service_subcategories')
        .select('id')
        .eq('name', subcategoryName)
        .single();
      
      if (subError || !subData) {
        console.error('Subcategory not found:', subcategoryName);
        return;
      }
      
      // Get micro-categories
      const { data, error } = await supabase
        .from('service_micro_categories')
        .select('id, name')
        .eq('subcategory_id', subData.id)
        .eq('is_active', true)
        .order('display_order');
      
      if (error) throw error;
      if (data) setMicroCategories(data);
    } catch (error) {
      console.error('Error loading micro-categories:', error);
    }
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
      const result = await importMutation.mutateAsync({
        slug: json.micro_slug,
        content: json.content,
        source: 'manual'
      });

      toast({
        title: 'Import Successful',
        description: `${form.microCategory} imported to database. You can now view it in the Browse Packs tab.`,
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
      if (!pasteText.trim()) {
        toast({
          title: 'No Text Found',
          description: 'Please paste some questions in the text box',
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
        const aiParsed = await parseQuestionsWithAI(pasteText);
        
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
        const simpleParsed = parseQuestionsSimple(pasteText);
        
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

      // Clear the textarea after successful parse
      setPasteText('');
    } catch (err) {
      toast({
        title: 'Parse Failed',
        description: err instanceof Error ? err.message : 'Could not parse questions',
        variant: 'destructive',
      });
    }
  };

  const importFromJson = () => {
    if (!jsonImport.trim()) {
      toast({
        title: 'No Data',
        description: 'Please paste JSON data',
        variant: 'destructive'
      });
      return;
    }

    try {
      const data = JSON.parse(jsonImport);
      
      // Map question types from various formats
      const typeMap: Record<string, any> = {
        'short_text': 'text',
        'long_text': 'text',
        'multiple_choice': 'single',
        'single_select': 'single',
        'checkbox': 'multi',
        'multi_select': 'multi'
      };

      // Convert questions - filter out conditional sub-questions (e.g., "6a", "9a")
      const mainQuestions = data.questions.filter((q: any) => 
        typeof q.id === 'number' || !String(q.id).match(/[a-z]$/)
      );

      const importedQuestions = mainQuestions.map((q: any) => {
        // Handle options - could be strings or objects
        let options: QuestionOption[] = [];
        if (q.options && Array.isArray(q.options)) {
          options = q.options.map((opt: any) => {
            if (typeof opt === 'string') {
              return { value: toSlug(opt), label: opt };
            } else if (opt.value && opt.label) {
              return { value: opt.value, label: opt.label };
            }
            return { value: toSlug(String(opt)), label: String(opt) };
          });
        }

        return {
          id: crypto.randomUUID(),
          text: q.question,
          type: typeMap[q.type] || 'text',
          required: q.required === true,
          options
        };
      });

      setForm(prev => ({
        ...prev,
        questions: importedQuestions
      }));

      // Set categories if they match
      if (data.category) {
        setForm(prev => ({ ...prev, mainCategory: data.category }));
      }
      if (data.subcategory) {
        setForm(prev => ({ ...prev, subCategory: data.subcategory }));
      }
      if (data.service) {
        setForm(prev => ({ ...prev, microCategory: data.service }));
      }

      setJsonImport('');
      toast({
        title: 'Import Successful',
        description: `Imported ${importedQuestions.length} questions`
      });
    } catch (err) {
      console.error('Import error:', err);
      toast({
        title: 'Import Failed',
        description: err instanceof Error ? err.message : 'Invalid JSON format',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Load Existing Pack Section */}
      <Collapsible open={loadPackOpen} onOpenChange={setLoadPackOpen}>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                <div>
                  <CardTitle className="text-lg">Load Existing Pack</CardTitle>
                  <CardDescription className="text-sm">
                    Select a pack to edit or start creating a new one
                  </CardDescription>
                </div>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {loadPackOpen ? 'Hide' : 'Show'}
                </Button>
              </CollapsibleTrigger>
            </div>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              {editingPackId && (
                <Alert>
                  <FileEdit className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>
                      <strong>Editing:</strong> {allPacks.find(p => p.pack_id === editingPackId)?.content?.name || 'Pack'} v{allPacks.find(p => p.pack_id === editingPackId)?.version} - Changes create a new version
                    </span>
                    <Button variant="ghost" size="sm" onClick={clearEditMode}>
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label>Select Pack to Edit</Label>
                {packsLoading ? (
                  <div className="text-sm text-muted-foreground py-2">Loading packs...</div>
                ) : (
                  <Select
                    value={editingPackId || ''}
                    onValueChange={(packId) => {
                      const pack = allPacks.find(p => p.pack_id === packId);
                      if (pack) {
                        loadPackIntoForm(pack);
                        setLoadPackOpen(false);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a pack to edit..." />
                    </SelectTrigger>
                    <SelectContent>
                      {['approved', 'draft', 'retired'].map(status => {
                        const packsInStatus = allPacks.filter(p => p.status === status);
                        if (packsInStatus.length === 0) return null;
                        
                        return (
                          <div key={status}>
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
                              {status}
                            </div>
                            {packsInStatus.map(pack => (
                              <SelectItem key={pack.pack_id} value={pack.pack_id}>
                                <div className="flex items-center gap-2">
                                  {pack.content?.name || pack.micro_slug} 
                                  <Badge variant="outline" className="text-xs">v{pack.version}</Badge>
                                  <Badge variant="secondary" className="text-xs">{pack.source}</Badge>
                                  {pack.is_active && <Badge className="text-xs bg-green-500">ACTIVE</Badge>}
                                </div>
                              </SelectItem>
                            ))}
                          </div>
                        );
                      })}
                      {allPacks.length === 0 && (
                        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                          No packs available. Create your first one below!
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
      
      {!editingPackId && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            <strong>Form Builder:</strong> Create microservices manually by adding questions one-by-one.
            Paste multiple questions at once or build them individually.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Form Builder */}
        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">Service Information</h3>
            
            {loading && <p className="text-sm text-muted-foreground">Loading categories...</p>}
            
            <div className="space-y-2">
              <Label>Main Category *</Label>
              <Select
                value={form.mainCategory}
                onValueChange={(value) => setForm(prev => ({ ...prev, mainCategory: value, subCategory: '', microCategory: '' }))}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select main category" />
                </SelectTrigger>
                <SelectContent>
                  {mainCategories.map(category => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Sub Category *</Label>
              <Select
                value={form.subCategory}
                onValueChange={(value) => setForm(prev => ({ ...prev, subCategory: value, microCategory: '' }))}
                disabled={!form.mainCategory || subcategories.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={form.mainCategory ? "Select sub category" : "Select main category first"} />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map(subCat => (
                    <SelectItem key={subCat.id} value={subCat.name}>
                      {subCat.name}
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
                disabled={!form.subCategory || microCategories.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={form.subCategory ? "Select service" : "Select sub category first"} />
                </SelectTrigger>
                <SelectContent>
                  {microCategories.map(microCat => (
                    <SelectItem key={microCat.id} value={microCat.name}>
                      {microCat.name}
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
            <h3 className="font-semibold text-lg">Import Questions</h3>
            
            <Tabs defaultValue="paste" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="paste">Paste Text</TabsTrigger>
                <TabsTrigger value="json">Import JSON</TabsTrigger>
              </TabsList>
              
              <TabsContent value="paste" className="space-y-3 mt-4">
                <Textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Paste your questions here in any format...

Examples:
1. What is the project location?
2. How many rooms? [number: 1-20]
3. Paint type: {Interior, Exterior, Both}"
                  className="min-h-[180px] font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={pasteQuestions}
                  disabled={!pasteText.trim()}
                  className="w-full"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Parse & Add Questions
                </Button>
                <p className="text-xs text-muted-foreground">
                  AI will intelligently detect question types, options, required fields, and more from any format you paste.
                </p>
              </TabsContent>
              
              <TabsContent value="json" className="space-y-3 mt-4">
                <Textarea
                  value={jsonImport}
                  onChange={(e) => setJsonImport(e.target.value)}
                  placeholder='Paste JSON output here...

Example:
{
  "category": "Building & Construction Services",
  "subcategory": "Excavation & Groundworks",
  "service": "Site Preparation & Clearance",
  "questions": [...]
}'
                  className="min-h-[180px] font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={importFromJson}
                  disabled={!jsonImport.trim()}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import from JSON
                </Button>
                <p className="text-xs text-muted-foreground">
                  Import structured JSON data with questions and categories already parsed.
                </p>
              </TabsContent>
            </Tabs>

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
                    {editingPackId ? 'Saving New Version...' : 'Importing...'}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {editingPackId ? 'Save as New Version' : 'Import to Database'}
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
