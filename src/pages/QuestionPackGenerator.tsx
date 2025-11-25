import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles, Save } from "lucide-react";

export default function QuestionPackGenerator() {
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [notes, setNotes] = useState("");
  const [generatedJson, setGeneratedJson] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleGenerate = async () => {
    if (!category || !serviceName) {
      toast.error("Please fill in at least category and service name");
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
      setCategory("");
      setSubcategory("");
      setServiceName("");
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
              <Input
                id="category"
                placeholder="e.g., hvac, kitchen-installation"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategory</Label>
              <Input
                id="subcategory"
                placeholder="e.g., ac-installation-upgrades"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceName">Service Name *</Label>
              <Input
                id="serviceName"
                placeholder="e.g., Pool Heat Pump Installation"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
              />
            </div>

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
