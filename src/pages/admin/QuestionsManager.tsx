/**
 * Questions Manager - Admin interface for managing microservice questions
 */

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Edit, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { QuestionsEditor, Question } from '@/components/admin/questions/QuestionsEditor';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminLayout } from '@/components/admin/layout/AdminLayout';
import QuestionBuilder from '@/components/admin/packs/QuestionBuilder';
import type { Json } from '@/integrations/supabase/types';

interface MicroService {
  id: string;
  category: string;
  subcategory: string;
  micro_name: string;
  micro_id: string;
  questions: Json;
}

export default function QuestionsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMicroservice, setSelectedMicroservice] = useState<MicroService | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data: microservices, isLoading } = useQuery({
    queryKey: ['microservices-for-questions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('micro_service_questions')
        .select('*')
        .order('category', { ascending: true });
      
      if (error) throw error;
      return data as MicroService[];
    },
  });

  const filteredMicroservices = microservices?.filter(ms => 
    ms.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ms.subcategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ms.micro_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (microservice: MicroService) => {
    setSelectedMicroservice(microservice);
    setIsEditorOpen(true);
  };

  const handleSave = async (questions: Question[]) => {
    if (!selectedMicroservice) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('micro_service_questions')
        .update({ questions: questions as unknown as Json })
        .eq('id', selectedMicroservice.id);

      if (error) throw error;

      // Invalidate queries to refresh the list
      await queryClient.invalidateQueries({ queryKey: ['microservices-for-questions'] });

      toast({
        title: "Success",
        description: "Questions updated successfully",
      });

      setIsEditorOpen(false);
      setSelectedMicroservice(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Questions Manager</h1>
          <p className="text-muted-foreground">
            Manage questions for microservices in the job posting wizard
          </p>
        </div>
        <Button onClick={() => setIsBuilderOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Microservice
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by category, subcategory, or microservice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {isLoading ? (
        <Card className="p-8 text-center text-muted-foreground">
          Loading microservices...
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredMicroservices?.map((ms) => (
            <Card key={ms.id} className="p-4 hover:bg-accent/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{ms.micro_name}</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {Array.isArray(ms.questions) ? ms.questions.length : 0} questions
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {ms.category} → {ms.subcategory}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(ms)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Questions
                </Button>
              </div>
            </Card>
          ))}

          {filteredMicroservices?.length === 0 && (
            <Card className="p-8 text-center text-muted-foreground">
              No microservices found matching your search
            </Card>
          )}
        </div>
      )}

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit Questions: {selectedMicroservice?.micro_name}
            </DialogTitle>
          </DialogHeader>
          {selectedMicroservice && (
            <QuestionsEditor
              questions={Array.isArray(selectedMicroservice.questions) ? selectedMicroservice.questions as unknown as Question[] : []}
              onSave={handleSave}
              onCancel={() => setIsEditorOpen(false)}
              isSaving={isSaving}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Microservice with Questions</DialogTitle>
          </DialogHeader>
          <QuestionBuilder />
        </DialogContent>
      </Dialog>
      </div>
    </AdminLayout>
  );
}
