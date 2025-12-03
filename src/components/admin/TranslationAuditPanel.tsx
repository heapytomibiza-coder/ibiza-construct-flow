/**
 * Translation Audit Panel
 * Admin component to check translation coverage across all languages
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, CheckCircle2, AlertCircle, XCircle, RefreshCw } from 'lucide-react';
import { getTranslationAuditReport, logTranslationAudit } from '@/lib/i18n/translationAudit';

interface NamespaceResult {
  name: string;
  coverage: number;
  missingCount: { es: number; de: number; fr: number };
}

export function TranslationAuditPanel() {
  const { t, i18n } = useTranslation();
  const [auditResults, setAuditResults] = useState<{
    namespaces: NamespaceResult[];
    overallCoverage: number;
    recommendations: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const runAudit = () => {
    setIsLoading(true);
    setTimeout(() => {
      const report = getTranslationAuditReport();
      setAuditResults(report);
      logTranslationAudit();
      setIsLoading(false);
    }, 500);
  };

  useEffect(() => {
    runAudit();
  }, []);

  const getCoverageIcon = (coverage: number) => {
    if (coverage >= 0.9) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (coverage >= 0.7) return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getCoverageBadge = (coverage: number) => {
    const percent = Math.round(coverage * 100);
    if (coverage >= 0.9) return <Badge className="bg-green-500">{percent}%</Badge>;
    if (coverage >= 0.7) return <Badge className="bg-yellow-500">{percent}%</Badge>;
    return <Badge variant="destructive">{percent}%</Badge>;
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Translation Audit
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={runAudit}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {auditResults && (
          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="namespaces">Namespaces</TabsTrigger>
              <TabsTrigger value="recommendations">Issues</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="space-y-4">
                {/* Overall Coverage */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Overall Coverage</span>
                    {getCoverageBadge(auditResults.overallCoverage)}
                  </div>
                  <Progress value={auditResults.overallCoverage * 100} className="h-2" />
                </div>

                {/* Language Switcher Test */}
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">Test Language Switching</h4>
                  <div className="flex gap-2 flex-wrap">
                    {languages.map((lang) => (
                      <Button
                        key={lang.code}
                        variant={i18n.language === lang.code ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => i18n.changeLanguage(lang.code)}
                      >
                        {lang.flag} {lang.name}
                      </Button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Current: {languages.find(l => l.code === i18n.language)?.flag} {i18n.language}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-card border rounded-lg text-center">
                    <div className="text-2xl font-bold">{auditResults.namespaces.length}</div>
                    <div className="text-xs text-muted-foreground">Namespaces</div>
                  </div>
                  <div className="p-3 bg-card border rounded-lg text-center">
                    <div className="text-2xl font-bold">{languages.length}</div>
                    <div className="text-xs text-muted-foreground">Languages</div>
                  </div>
                  <div className="p-3 bg-card border rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {auditResults.namespaces.filter(ns => ns.coverage >= 0.9).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Complete</div>
                  </div>
                  <div className="p-3 bg-card border rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-500">
                      {auditResults.recommendations.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Issues</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="namespaces">
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {auditResults.namespaces.map((ns) => (
                    <div 
                      key={ns.name}
                      className="flex items-center justify-between p-3 bg-card border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getCoverageIcon(ns.coverage)}
                        <span className="font-medium">{ns.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-xs space-x-2">
                          <span className="text-muted-foreground">
                            🇪🇸 -{ns.missingCount.es}
                          </span>
                          <span className="text-muted-foreground">
                            🇩🇪 -{ns.missingCount.de}
                          </span>
                          <span className="text-muted-foreground">
                            🇫🇷 -{ns.missingCount.fr}
                          </span>
                        </div>
                        {getCoverageBadge(ns.coverage)}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="recommendations">
              <ScrollArea className="h-[400px]">
                {auditResults.recommendations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>All translations are in good shape!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {auditResults.recommendations.map((rec, i) => (
                      <div 
                        key={i}
                        className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm"
                      >
                        {rec}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
