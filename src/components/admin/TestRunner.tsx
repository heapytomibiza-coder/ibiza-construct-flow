import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, CheckCircle, XCircle, Clock, Languages } from 'lucide-react';
import { useExecuteTests } from '../../../packages/@contracts/clients/ai-testing';
import i18n from '@/i18n';

interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'pending';
  message?: string;
  duration?: number;
}

export function TestRunner() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const { mutateAsync: executeTests, isPending } = useExecuteTests();

  const validateI18nKeys = async () => {
    const testResults: TestResult[] = [];
    const requiredKeys = {
      'services': ['searchPlaceholder', 'categories.all', 'categories.cleaning', 'filters.title'],
      'wizard': ['steps.category.title', 'steps.details.title', 'navigation.progressLabels.category'],
      'common': []
    };

    for (const [namespace, keys] of Object.entries(requiredKeys)) {
      for (const key of keys) {
        const enExists = i18n.exists(key, { ns: namespace, lng: 'en' });
        const esExists = i18n.exists(key, { ns: namespace, lng: 'es' });
        
        if (!enExists || !esExists) {
          testResults.push({ test: `i18n: ${namespace}.${key}`, status: 'fail', message: `Missing in ${!enExists ? 'en' : 'es'}` });
        } else {
          testResults.push({ test: `i18n: ${namespace}.${key}`, status: 'pass' });
        }
      }
    }
    return testResults;
  };

  const handleRunTests = async () => {
    setResults([]);
    setLogs([]);
    
    try {
      setLogs(prev => [...prev, '=== Running i18n validation ===']);
      const i18nResults = await validateI18nKeys();
      
      const failedI18n = i18nResults.filter(r => r.status === 'fail').length;
      setLogs(prev => [...prev, failedI18n > 0 ? `⚠️  ${failedI18n} i18n keys missing` : '✅ All i18n keys validated']);

      setLogs(prev => [...prev, '\n=== Running AI test suite ===']);
      const testResponse = await executeTests({
        testSuites: ['database', 'edge-functions', 'storage', 'templates'],
        includeI18n: false,
      });

      setResults([...i18nResults, ...testResponse.results]);
      testResponse.logs.forEach(log => setLogs(prev => [...prev, log]));
    } catch (error) {
      setLogs(prev => [...prev, `Error: ${(error as Error).message}`]);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'fail': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'pass' ? 'default' : status === 'fail' ? 'destructive' : 'secondary';
    return <Badge variant={variant}>{status.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            System Test Runner
            <Badge variant="outline" className="ml-auto">
              <Languages className="w-3 h-3 mr-1" />
              i18n + AI Tests
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRunTests} disabled={isPending} className="w-full">
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Execute Tests
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Output</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm font-mono whitespace-pre-wrap">{logs.join('\n')}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.test}</span>
                    {result.duration && <span className="text-sm text-muted-foreground">({result.duration}ms)</span>}
                  </div>
                  <div className="flex items-center gap-2">{getStatusBadge(result.status)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
