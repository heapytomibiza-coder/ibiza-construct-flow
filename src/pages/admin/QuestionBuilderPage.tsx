/**
 * Question Builder - Create custom question packs from scratch
 */

import { AdminLayout } from '@/components/admin/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useQuestionBuilder } from '@/hooks/admin/useQuestionBuilder';
import { useToast } from '@/hooks/use-toast';
import { Plus, ArrowLeft, ArrowRight, Save, Eye } from 'lucide-react';
import { QuestionEditor } from '@/components/admin/questionPacks/QuestionEditor';
import { QuestionPreview } from '@/components/admin/questionPacks/QuestionPreview';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { validateQuestionPack } from '@/lib/questionPacks/validateQuestionPack';

export default function QuestionBuilderPage() {
  const { toast } = useToast();
  const {
    currentStep,
    microSlug,
    microName,
    category,
    questions,
    setMicroSlug,
    setMicroName,
    setCategory,
    addQuestion,
    updateQuestion,
    removeQuestion,
    reorderQuestions,
    savePack,
    isSaving,
    nextStep,
    prevStep,
    resetBuilder,
  } = useQuestionBuilder();
  
  const [showPreview, setShowPreview] = useState(false);
  
  const handleSave = async (status: 'draft' | 'approved') => {
    try {
      await savePack(status);
      toast({
        title: 'Success',
        description: `Question pack saved as ${status}`,
      });
    } catch (error: any) {
      toast({
        title: 'Save Failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  
  const validation = microSlug && microName && questions.length > 0
    ? validateQuestionPack({
        id: '',
        category,
        name: microName,
        slug: microSlug,
        i18nPrefix: microSlug.replace(/-/g, '.'),
        questions: questions.map(({ tempId, ...q }) => q),
      })
    : { valid: true, warnings: [], errors: [] };
  
  const canSave = microSlug && microName && questions.length > 0 && validation.valid;
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Question Builder</h1>
            <p className="text-muted-foreground">
              Create custom question packs for microcategories
            </p>
          </div>
          {questions.length > 0 && (
            <Button variant="outline" onClick={() => setShowPreview(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          )}
        </div>
        
        <Progress value={(currentStep / 2) * 100} className="h-2" />
        
        {currentStep === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Microcategory Details</CardTitle>
              <CardDescription>
                Define the microcategory for this question pack
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Micro Slug *</Label>
                <Input
                  value={microSlug}
                  onChange={(e) => setMicroSlug(e.target.value)}
                  placeholder="e.g. deck-building"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Kebab-case format (lowercase, hyphens only)
                </p>
              </div>
              
              <div>
                <Label>Service Name *</Label>
                <Input
                  value={microName}
                  onChange={(e) => setMicroName(e.target.value)}
                  placeholder="e.g. Deck Building"
                />
              </div>
              
              <div>
                <Label>Category</Label>
                <Input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. construction"
                />
              </div>
              
              <Button
                onClick={nextStep}
                disabled={!microSlug || !microName}
                className="w-full"
              >
                Next: Add Questions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
        
        {currentStep === 1 && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Add Questions</CardTitle>
                <CardDescription>
                  Create 4-8 questions for this microcategory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-muted-foreground">
                    Questions: {questions.length}/8
                    {questions.length < 4 && ' (minimum 4 recommended)'}
                    {questions.length > 12 && ' (maximum 12 recommended)'}
                  </div>
                  <Button onClick={addQuestion} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </div>
                
                {validation.warnings.length > 0 && (
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {validation.warnings.map((w, i) => (
                        <div key={i}>{w}</div>
                      ))}
                    </AlertDescription>
                  </Alert>
                )}
                
                {validation.errors.length > 0 && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {validation.errors.map((e, i) => (
                        <div key={i}>{e}</div>
                      ))}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
            
            <div className="space-y-3">
              {questions.map((question, index) => (
                <QuestionEditor
                  key={question.tempId}
                  question={{ ...question, text: question.i18nKey }}
                  index={index}
                  onUpdate={updateQuestion}
                  onRemove={removeQuestion}
                  onMoveUp={index > 0 ? () => reorderQuestions(index, index - 1) : undefined}
                  onMoveDown={index < questions.length - 1 ? () => reorderQuestions(index, index + 1) : undefined}
                />
              ))}
            </div>
            
            {questions.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground mb-4">No questions yet</p>
                  <Button onClick={addQuestion}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Question
                  </Button>
                </CardContent>
              </Card>
            )}
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={prevStep}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSave('draft')}
                disabled={!canSave || isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                Save as Draft
              </Button>
              <Button
                onClick={() => handleSave('approved')}
                disabled={!canSave || isSaving}
                className="flex-1"
              >
                <Save className="mr-2 h-4 w-4" />
                Save & Approve
              </Button>
            </div>
          </div>
        )}
        
        {/* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{microName}</DialogTitle>
              <DialogDescription>
                Preview how questions will appear to users
              </DialogDescription>
            </DialogHeader>
            
            <QuestionPreview
              questions={questions.map(({ tempId, text, ...q }) => ({
                ...q,
                i18nKey: text || q.i18nKey,
              }))}
            />
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
