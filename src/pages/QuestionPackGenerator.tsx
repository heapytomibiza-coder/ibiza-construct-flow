import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useCategories, useSubcategories, useMicroCategories } from "@/hooks/useCategories";
import { useServicesNeedingPacks } from "@/hooks/useServicesNeedingPacks";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Sparkles, Save, CheckCircle2, AlertCircle, ChevronDown, Search, ChevronRight, Circle } from "lucide-react";
import { createQuestionPack } from "@/lib/questionPacks/createPack";

export default function QuestionPackGenerator() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>("");
  const [selectedMicroId, setSelectedMicroId] = useState<string>("");
  const [customServiceName, setCustomServiceName] = useState("");
  const [notes, setNotes] = useState("");
  const [generatedJson, setGeneratedJson] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());
  
  // Bulk generation state
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, subcategoryName: "" });
  const [bulkStatuses, setBulkStatuses] = useState<Record<string, 'pending' | 'generating' | 'saved' | 'error'>>({});

  // Fetch taxonomy data
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: subcategories, isLoading: subcategoriesLoading } = useSubcategories(selectedCategoryId);
  const { data: microCategories, isLoading: microCategoriesLoading } = useMicroCategories(selectedSubcategoryId);
  const { data: servicesNeeded, isLoading: servicesLoading, refetch: refetchNeeds } = useServicesNeedingPacks();

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

  const handleBulkGenerate = async (
    categorySlug: string,
    subcategorySlug: string,
    subcategoryName: string,
    services: Array<{ id: string; name: string; slug: string }>
  ) => {
    setBulkGenerating(true);
    setBulkProgress({ current: 0, total: services.length, subcategoryName });
    
    const statuses: Record<string, 'pending' | 'generating' | 'saved' | 'error'> = {};
    services.forEach(s => statuses[s.slug] = 'pending');
    setBulkStatuses(statuses);

    let successCount = 0;
    
    for (let i = 0; i < services.length; i++) {
      const service = services[i];
      
      try {
        // Update status to generating
        setBulkStatuses(prev => ({ ...prev, [service.slug]: 'generating' }));
        
        // Generate question pack
        const { data, error } = await supabase.functions.invoke('generate-question-pack', {
          body: {
            category: categorySlug,
            subcategory: subcategorySlug,
            serviceName: service.name,
          }
        });

        if (error) throw error;
        
        // Auto-save as draft
        await createQuestionPack(service.slug, data.questionPack, 'draft', 'ai');
        
        // Update status to saved
        setBulkStatuses(prev => ({ ...prev, [service.slug]: 'saved' }));
        successCount++;
        
        // Update progress
        setBulkProgress({ current: i + 1, total: services.length, subcategoryName });
        
        // Small delay to avoid rate limits
        if (i < services.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      } catch (error: any) {
        console.error(`Error generating pack for ${service.name}:`, error);
        setBulkStatuses(prev => ({ ...prev, [service.slug]: 'error' }));
        
        // If rate limited, show message and stop
        if (error.message?.includes('rate limit') || error.message?.includes('429')) {
          toast.error(`Rate Limited: Generated ${successCount}/${services.length} packs. Please wait and try again.`);
          break;
        }
      }
    }

    toast.success(`Bulk generation complete: ${successCount}/${services.length} packs generated.`);

    // Refresh the needs list
    refetchNeeds();
    setBulkGenerating(false);
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

  const handleServiceSelect = (service: any) => {
    setSelectedCategoryId(service.category_id);
    setSelectedSubcategoryId(service.subcategory_id);
    setSelectedMicroId(service.id);
    setCustomServiceName("");
  };

  const toggleCategory = (categoryName: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryName)) {
      newExpanded.delete(categoryName);
    } else {
      newExpanded.add(categoryName);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleSubcategory = (key: string) => {
    const newExpanded = new Set(expandedSubcategories);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedSubcategories(newExpanded);
  };

  const filteredGroups = servicesNeeded?.grouped
    ? Object.entries(servicesNeeded.grouped).filter(([categoryName, data]) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          categoryName.toLowerCase().includes(query) ||
          Object.values(data.subcategories).some(sub =>
            sub.services.some(s => s.name.toLowerCase().includes(query))
          )
        );
      })
    : [];

  return (
    <div className="container mx-auto p-6 max-w-[1800px]">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Question Pack Generator</h1>
        <p className="text-muted-foreground">
          Generate AI-powered question packs for any service automatically
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Services Needing Packs Panel */}
        <Card className="xl:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <span>Needs Packs</span>
              {servicesNeeded && (
                <Badge variant="secondary">{servicesNeeded.totalCount}</Badge>
              )}
            </CardTitle>
            <CardDescription>
              Click to auto-select
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            {bulkGenerating && (
              <div className="border rounded-lg p-4 space-y-3 bg-accent/50 mb-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Generating {bulkProgress.subcategoryName}</span>
                  <span className="text-muted-foreground">{bulkProgress.current}/{bulkProgress.total}</span>
                </div>
                <Progress value={(bulkProgress.current / bulkProgress.total) * 100} />
                <ScrollArea className="h-32">
                  <div className="space-y-1">
                    {Object.entries(bulkStatuses).map(([slug, status]) => (
                      <div key={slug} className="flex items-center gap-2 text-xs">
                        {status === 'saved' && <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />}
                        {status === 'generating' && <Loader2 className="h-3 w-3 animate-spin flex-shrink-0" />}
                        {status === 'pending' && <Circle className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                        {status === 'error' && <AlertCircle className="h-3 w-3 text-red-600 flex-shrink-0" />}
                        <span className="truncate">{slug}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            <ScrollArea className="h-[calc(100vh-320px)]">
              {servicesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredGroups.map(([categoryName, data]) => {
                    const totalServices = Object.values(data.subcategories).reduce((sum, sub) => sum + sub.services.length, 0);
                    
                    return (
                      <Collapsible
                        key={categoryName}
                        open={expandedCategories.has(categoryName)}
                        onOpenChange={() => toggleCategory(categoryName)}
                      >
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-md hover:bg-accent transition-colors">
                          <div className="flex items-center gap-2">
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${
                                expandedCategories.has(categoryName) ? 'rotate-0' : '-rotate-90'
                              }`}
                            />
                            <span className="font-medium text-sm">{categoryName}</span>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {totalServices}
                          </Badge>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-4 pt-1 space-y-1">
                          {Object.entries(data.subcategories).map(([subcategoryName, subcategoryData]) => {
                            const subKey = `${categoryName}-${subcategoryName}`;
                            
                            return (
                              <Collapsible
                                key={subKey}
                                open={expandedSubcategories.has(subKey)}
                                onOpenChange={() => toggleSubcategory(subKey)}
                              >
                                <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent">
                                  <CollapsibleTrigger className="flex items-center gap-2 flex-1 text-left">
                                    {expandedSubcategories.has(subKey) ? (
                                      <ChevronDown className="h-3 w-3" />
                                    ) : (
                                      <ChevronRight className="h-3 w-3" />
                                    )}
                                    <span className="text-sm font-medium">{subcategoryName}</span>
                                    <Badge variant="secondary" className="text-xs h-5">
                                      {subcategoryData.services.length}
                                    </Badge>
                                  </CollapsibleTrigger>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const firstService = subcategoryData.services[0];
                                      if (firstService) {
                                        handleBulkGenerate(
                                          firstService.category_slug,
                                          firstService.subcategory_slug,
                                          subcategoryName,
                                          subcategoryData.services
                                        );
                                      }
                                    }}
                                    disabled={bulkGenerating}
                                    className="h-7 text-xs ml-2"
                                  >
                                    {bulkGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : "Generate All"}
                                  </Button>
                                </div>
                                <CollapsibleContent className="pl-8 pt-1 space-y-1">
                                  {subcategoryData.services.map((service) => (
                                    <button
                                      key={service.id}
                                      onClick={() => handleServiceSelect(service)}
                                      className={`w-full text-left p-2 rounded-md text-sm hover:bg-accent transition-colors ${
                                        selectedMicroId === service.id ? 'bg-accent' : ''
                                      }`}
                                    >
                                      • {service.name}
                                    </button>
                                  ))}
                                </CollapsibleContent>
                              </Collapsible>
                            );
                          })}
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Service Details Form */}
        <Card className="xl:col-span-4">
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

        {/* Generated JSON Panel */}
        <Card className="xl:col-span-5">
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
