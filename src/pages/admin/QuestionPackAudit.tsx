/**
 * Question Pack Audit Page
 * Comprehensive audit tool for all 328 question packs
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, AlertTriangle, CheckCircle, Eye, Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface QuestionPack {
  pack_id: string;
  micro_slug: string;
  status: string;
  version: number;
  is_active: boolean;
  content: any;
  created_at: string;
  approved_at: string | null;
}

interface PackWithIssues extends QuestionPack {
  issues: PackIssue[];
  questionCount: number;
}

interface PackIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
}

const QuestionPackAudit = () => {
  const [search, setSearch] = useState('');
  const [selectedPack, setSelectedPack] = useState<QuestionPack | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'issues' | 'healthy'>('all');

  // Fetch all question packs
  const { data: packs, isLoading } = useQuery({
    queryKey: ['question-packs-audit'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('question_packs')
        .select('*')
        .eq('is_active', true)
        .order('micro_slug');

      if (error) throw error;
      return data as unknown as QuestionPack[];
    }
  });

  // Validate a single pack
  const validatePack = (pack: QuestionPack): PackIssue[] => {
    const issues: PackIssue[] = [];
    const questions = pack.content?.questions || [];

    // Check if pack has questions
    if (questions.length === 0) {
      issues.push({ type: 'error', message: 'No questions in pack' });
      return issues;
    }

    // Validate each question
    questions.forEach((q, idx) => {
      if (!q.key) {
        issues.push({ type: 'error', message: `Question ${idx + 1}: Missing key` });
      }
      if (!q.type) {
        issues.push({ type: 'error', message: `Question ${idx + 1}: Missing type` });
      }
      if (!q.i18nKey && !q.title) {
        issues.push({ type: 'error', message: `Question ${idx + 1}: Missing i18nKey or title` });
      }
      if (q.type === 'single' || q.type === 'multi') {
        if (!q.options || q.options.length === 0) {
          issues.push({ type: 'error', message: `Question ${idx + 1}: No options for ${q.type} type` });
        } else {
          q.options.forEach((opt: any, optIdx: number) => {
            if (!opt.value) {
              issues.push({ type: 'warning', message: `Q${idx + 1} Option ${optIdx + 1}: Missing value` });
            }
            if (!opt.i18nKey && !opt.label) {
              issues.push({ type: 'warning', message: `Q${idx + 1} Option ${optIdx + 1}: Missing i18nKey or label` });
            }
          });
        }
      }
      if (q.required === undefined) {
        issues.push({ type: 'warning', message: `Question ${idx + 1}: Required field not set` });
      }
    });

    // Check for duplicate keys
    const keys = questions.map(q => q.key).filter(Boolean);
    const duplicateKeys = keys.filter((key, idx) => keys.indexOf(key) !== idx);
    if (duplicateKeys.length > 0) {
      issues.push({ type: 'error', message: `Duplicate question keys: ${duplicateKeys.join(', ')}` });
    }

    return issues;
  };

  // Calculate stats and filter packs
  const packsWithIssues: PackWithIssues[] = useMemo(() => {
    if (!packs) return [];
    return packs.map(pack => ({
      ...pack,
      issues: validatePack(pack),
      questionCount: pack.content?.questions?.length || 0
    }));
  }, [packs]);

  const filteredPacks = useMemo(() => {
    let filtered = packsWithIssues;

    if (search) {
      filtered = filtered.filter(p => 
        p.micro_slug.toLowerCase().includes(search.toLowerCase()) ||
        p.content?.name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterStatus === 'issues') {
      filtered = filtered.filter(p => p.issues.length > 0);
    } else if (filterStatus === 'healthy') {
      filtered = filtered.filter(p => p.issues.length === 0);
    }

    return filtered;
  }, [packsWithIssues, search, filterStatus]);

  const stats = useMemo(() => {
    const total = packsWithIssues.length;
    const withIssues = packsWithIssues.filter(p => p.issues.length > 0).length;
    const healthy = total - withIssues;
    const totalErrors = packsWithIssues.reduce((sum, p) => sum + p.issues.filter(i => i.type === 'error').length, 0);
    const totalWarnings = packsWithIssues.reduce((sum, p) => sum + p.issues.filter(i => i.type === 'warning').length, 0);

    return { total, withIssues, healthy, totalErrors, totalWarnings };
  }, [packsWithIssues]);

  // Export audit report
  const exportReport = () => {
    const report = packsWithIssues
      .filter(p => p.issues.length > 0)
      .map(p => ({
        micro_slug: p.micro_slug,
        pack_name: p.content?.name,
        question_count: p.questionCount,
        issues: p.issues.map(i => `[${i.type}] ${i.message}`).join('; ')
      }));

    const csv = [
      ['Micro Slug', 'Pack Name', 'Question Count', 'Issues'].join(','),
      ...report.map(r => [r.micro_slug, r.pack_name, r.question_count, `"${r.issues}"`].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `question-pack-audit-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Question Pack Audit</h1>
          <p className="text-muted-foreground">
            Comprehensive validation of all {stats.total} question packs
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => window.location.href = '/admin/question-pack-standardizer'}
            variant="default"
          >
            Go to Tone Standardizer
          </Button>
          <Button onClick={exportReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Issues Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Packs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Healthy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.healthy}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">With Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.withIssues}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.totalErrors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.totalWarnings}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by slug or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="issues">Issues Only</TabsTrigger>
            <TabsTrigger value="healthy">Healthy Only</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Packs Table */}
      <Card>
        <ScrollArea className="h-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Micro Slug</TableHead>
                <TableHead>Pack Name</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issues</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPacks.map((pack) => (
                <TableRow key={pack.pack_id}>
                  <TableCell className="font-mono text-sm">{pack.micro_slug}</TableCell>
                  <TableCell>{pack.content?.name || 'Unnamed'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{pack.questionCount}</Badge>
                  </TableCell>
                  <TableCell>
                    {pack.issues.length === 0 ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Healthy
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {pack.issues.length} issue{pack.issues.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {pack.issues.slice(0, 2).map((issue, idx) => (
                      <Badge 
                        key={idx} 
                        variant={issue.type === 'error' ? 'destructive' : 'secondary'}
                        className="mr-1 mb-1"
                      >
                        {issue.message}
                      </Badge>
                    ))}
                    {pack.issues.length > 2 && (
                      <Badge variant="outline">+{pack.issues.length - 2} more</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedPack(pack)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>

      {/* Pack Detail Dialog */}
      <Dialog open={!!selectedPack} onOpenChange={() => setSelectedPack(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedPack?.micro_slug}</DialogTitle>
            <DialogDescription>
              {selectedPack?.content?.name} • {(selectedPack as PackWithIssues)?.questionCount || 0} questions
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            <div className="space-y-4">
              {/* Issues Section */}
              {selectedPack && (selectedPack as PackWithIssues).issues && (selectedPack as PackWithIssues).issues.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold">Issues</h3>
                  {(selectedPack as PackWithIssues).issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border ${
                        issue.type === 'error' 
                          ? 'bg-red-50 border-red-200' 
                          : 'bg-yellow-50 border-yellow-200'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                          issue.type === 'error' ? 'text-red-600' : 'text-yellow-600'
                        }`} />
                        <span className="text-sm">{issue.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Questions Preview */}
              <div className="space-y-2">
                <h3 className="font-semibold">Questions</h3>
                {selectedPack?.content?.questions?.map((q, idx) => (
                  <Card key={idx}>
                    <CardHeader>
                      <CardTitle className="text-sm">
                        {idx + 1}. {q.i18nKey || q.title || q.key}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline">Type: {q.type}</Badge>
                        <Badge variant="outline">Key: {q.key}</Badge>
                        {q.required && <Badge variant="secondary">Required</Badge>}
                      </div>
                      {q.aiHint && (
                        <p className="text-sm text-muted-foreground">{q.aiHint}</p>
                      )}
                      {q.options && q.options.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Options:</p>
                          <ul className="text-sm space-y-1 ml-4">
                            {q.options.map((opt: any, optIdx: number) => (
                              <li key={optIdx}>
                                • {opt.i18nKey || opt.label || opt.value}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Raw JSON */}
              <div className="space-y-2">
                <h3 className="font-semibold">Raw JSON</h3>
                <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto">
                  {JSON.stringify(selectedPack?.content, null, 2)}
                </pre>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuestionPackAudit;
