import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useCategories, useSubcategories, useMicroCategories } from "@/hooks/useCategories";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Sparkles, Save, CheckCircle2, AlertCircle } from "lucide-react";

export default function QuestionPackGenerator() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>("");
  const [selectedMicroId, setSelectedMicroId] = useState<string>("");
  const [customServiceName, setCustomServiceName] = useState("");
  const [notes, setNotes] = useState("");
  const [generatedJson, setGeneratedJson] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch taxonomy data
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: subcategories, isLoading: subcategoriesLoading } = useSubcategories(selectedCategoryId);
  const { data: microCategories, isLoading: microCategoriesLoading } = useMicroCategories(selectedSubcategoryId);

  // Get selected taxonomy details
  const selectedCategory = categories?.find(c => c.id === selectedCategoryId);
  const selectedSubcategory = subcategories?.find(s => s.id === selectedSubcategoryId);
  const selectedMicro = microCategories?.find(m => m.id === selectedMicroId);

  // Check for existing question pack
  const { data: existingPack } = useQuery({
    queryKey: ['existing-pack', selectedMicro?.slug],
    queryFn: async () => {
      if (!selectedMicro?.slug) return null;
      
      const { data, error } = await supabase
        .from('question_packs')
        .select('micro_slug, version, status')
        .eq('micro_slug', selectedMicro.slug)
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedMicro?.slug,
  });

  // Reset downstream selections when parent changes
  useEffect(() => {
    setSelectedSubcategoryId("");
    setSelectedMicroId("");
    setCustomServiceName("");
  }, [selectedCategoryId]);

  useEffect(() => {
    setSelectedMicroId("");
    setCustomServiceName("");
  }, [selectedSubcategoryId]);

  // Determine service name and slug to use
  const isNewService = selectedMicroId === "new";
  const serviceName = isNewService ? customServiceName : (selectedMicro?.name || "");
  const category = selectedCategory?.slug || "";
  const subcategory = selectedSubcategory?.slug || "";

  const handleGenerate = async () => {
    if (!category || !serviceName) {
      toast.error("Please select a category and provide a service name");
      return;
    }

    if (isNewService && !customServiceName.trim()) {
      toast.error("Please enter a service name");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-question-pack", {
        body: {
          category,
          subcategory,
          serviceName,
          notes,
        },
      });

      if (error) throw error;

      setGeneratedJson(JSON.stringify(data.questionPack, null, 2));
      toast.success("Question pack generated successfully!");
    } catch (error) {
      console.error("Error generating question pack:", error);
      toast.error("Failed to generate question pack");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedJson) {
      toast.error("No question pack to save");
      return;
    }

    setIsSaving(true);
    try {
      const pack = JSON.parse(generatedJson);

      const { error } = await supabase.from("question_packs").insert({
        micro_slug: pack.micro_slug,
        version: 1,
        status: "draft",
        source: "ai",
        content: pack.content,
        is_active: false,
      });

      if (error) throw error;

      toast.success("Question pack saved to database!");
      setGeneratedJson("");
      setSelectedCategoryId("");
      setSelectedSubcategoryId("");
      setSelectedMicroId("");
      setCustomServiceName("");
      setNotes("");
    } catch (error) {
      console.error("Error saving question pack:", error);
      toast.error("Failed to save question pack");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Question Pack Generator</h1>
        <p className="text-muted-foreground">
          Generate AI-powered question packs for any service automatically
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
            <CardDescription>
              Fill in the service information to generate a question pack
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={selectedCategoryId}
                onValueChange={setSelectedCategoryId}
                disabled={categoriesLoading}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category"} />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCategoryId && (
              <div className="space-y-2">
                <Label htmlFor="subcategory">Subcategory</Label>
                <Select
                  value={selectedSubcategoryId}
                  onValueChange={setSelectedSubcategoryId}
                  disabled={subcategoriesLoading || !subcategories?.length}
                >
                  <SelectTrigger id="subcategory">
                    <SelectValue placeholder={subcategoriesLoading ? "Loading..." : "Select subcategory (optional)"} />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories?.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedSubcategoryId && (
              <div className="space-y-2">
                <Label htmlFor="service">Service *</Label>
                <Select
                  value={selectedMicroId}
                  onValueChange={setSelectedMicroId}
                  disabled={microCategoriesLoading}
                >
                  <SelectTrigger id="service">
                    <SelectValue placeholder={microCategoriesLoading ? "Loading..." : "Select or create service"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">➕ Create New Service</SelectItem>
                    {microCategories?.map((micro) => (
                      <SelectItem key={micro.id} value={micro.id}>
                        {micro.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {isNewService && (
              <div className="space-y-2">
                <Label htmlFor="serviceName">Service Name *</Label>
                <Input
                  id="serviceName"
                  placeholder="e.g., Pool Heat Pump Installation"
                  value={customServiceName}
                  onChange={(e) => setCustomServiceName(e.target.value)}
                />
              </div>
            )}

            {existingPack && !isNewService && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                {existingPack.status === 'approved' ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Pack exists (v{existingPack.version}, approved)</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Pack exists (v{existingPack.version}, {existingPack.status})</span>
                  </>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Context / Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any specific context, requirements, or notes about this service..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !category || !serviceName}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate Question Pack
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated JSON</CardTitle>
            <CardDescription>
              Review and edit the generated question pack before saving
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={generatedJson}
              onChange={(e) => setGeneratedJson(e.target.value)}
              placeholder="Generated JSON will appear here..."
              className="font-mono text-sm h-[400px]"
            />

            <Button
              onClick={handleSave}
              disabled={isSaving || !generatedJson}
              className="w-full"
              size="lg"
              variant="default"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  Save to Database
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Rules & Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Generates 6-8 questions per service</li>
            <li>• NO logistics: dates, budget, address, parking, contact info</li>
            <li>• Focus on technical scope: materials, performance, usage, finish level</li>
            <li>• Options are short and tile-friendly (2-5 words)</li>
            <li>• Uses "single" for radio buttons, "multi" for checkboxes</li>
            <li>• Questions are unique to each service</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
