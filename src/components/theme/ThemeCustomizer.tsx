import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Paintbrush, Type, Layout } from 'lucide-react';

export function ThemeCustomizer() {
  const [fontSize, setFontSize] = useState(16);
  const [spacing, setSpacing] = useState(1);
  const [borderRadius, setBorderRadius] = useState(0.5);

  const applyCustomizations = () => {
    document.documentElement.style.setProperty('--base-font-size', `${fontSize}px`);
    document.documentElement.style.setProperty('--spacing-scale', spacing.toString());
    document.documentElement.style.setProperty('--radius', `${borderRadius}rem`);
    
    localStorage.setItem('theme-customization', JSON.stringify({
      fontSize,
      spacing,
      borderRadius
    }));
  };

  const resetCustomizations = () => {
    setFontSize(16);
    setSpacing(1);
    setBorderRadius(0.5);
    
    document.documentElement.style.removeProperty('--base-font-size');
    document.documentElement.style.removeProperty('--spacing-scale');
    document.documentElement.style.removeProperty('--radius');
    
    localStorage.removeItem('theme-customization');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Paintbrush className="w-5 h-5" />
          Theme Customizer
        </CardTitle>
        <CardDescription>
          Customize the appearance to your preference
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="typography">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="typography">
              <Type className="w-4 h-4 mr-2" />
              Typography
            </TabsTrigger>
            <TabsTrigger value="spacing">
              <Layout className="w-4 h-4 mr-2" />
              Spacing
            </TabsTrigger>
            <TabsTrigger value="corners">
              Corners
            </TabsTrigger>
          </TabsList>

          <TabsContent value="typography" className="space-y-4">
            <div className="space-y-2">
              <Label>Font Size: {fontSize}px</Label>
              <Slider
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
                min={12}
                max={20}
                step={1}
              />
              <p className="text-sm text-muted-foreground">
                Adjusts the base font size across the application
              </p>
            </div>
          </TabsContent>

          <TabsContent value="spacing" className="space-y-4">
            <div className="space-y-2">
              <Label>Spacing Scale: {spacing}x</Label>
              <Slider
                value={[spacing]}
                onValueChange={(value) => setSpacing(value[0])}
                min={0.75}
                max={1.5}
                step={0.25}
              />
              <p className="text-sm text-muted-foreground">
                Controls the overall spacing and padding
              </p>
            </div>
          </TabsContent>

          <TabsContent value="corners" className="space-y-4">
            <div className="space-y-2">
              <Label>Border Radius: {borderRadius}rem</Label>
              <Slider
                value={[borderRadius]}
                onValueChange={(value) => setBorderRadius(value[0])}
                min={0}
                max={1}
                step={0.125}
              />
              <p className="text-sm text-muted-foreground">
                Adjusts the roundness of corners
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 mt-6">
          <Button onClick={applyCustomizations} className="flex-1">
            Apply Changes
          </Button>
          <Button onClick={resetCustomizations} variant="outline">
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
