import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, CheckCircle, XCircle, Clock, Languages } from 'lucide-react';
import { aiTesting } from '@/lib/api/ai-testing';
import i18n from '@/i18n';

interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'pending';
  message?: string;
  duration?: number;
}

export function TestRunner() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const validateI18nKeys = async () => {
    const testResults: TestResult[] = [];
    const requiredKeys = {
      'services': [
        'searchPlaceholder',
        'categories.all',
        'categories.cleaning',
        'filters.title'
      ],
      'wizard': [
        'steps.category.title',
        'steps.details.title',
        'navigation.progressLabels.category'
      ],
      'common': [
        // Add common keys as needed
      ]
    };

    for (const [namespace, keys] of Object.entries(requiredKeys)) {
      for (const key of keys) {
        const enExists = i18n.exists(key, { ns: namespace, lng: 'en' });
        const esExists = i18n.exists(key, { ns: namespace, lng: 'es' });
        
        if (!enExists || !esExists) {
          testResults.push({
            test: `i18n: ${namespace}.${key}`,
            status: 'fail',
            message: `Missing in ${!enExists ? 'en' : 'es'}`
          });
        } else {
          testResults.push({
            test: `i18n: ${namespace}.${key}`,
            status: 'pass'
          });
        }
      }
    }

    return testResults;
  };

  const handleRunTests = async () => {
    setIsRunning(true);
    setResults([]);
    setLogs([]);
    
    // Capture console logs
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      setLogs(prev => [...prev, args.join(' ')]);
      originalConsoleLog(...args);
    };

    try {
      // Run i18n validation
      setLogs(prev => [...prev, '=== Running i18n validation ===']);
      const i18nResults = await validateI18nKeys();
      
      const failedI18n = i18nResults.filter(r => r.status === 'fail').length;
      if (failedI18n > 0) {
        setLogs(prev => [...prev, `⚠️  ${failedI18n} i18n keys missing or incomplete`]);
      } else {
        setLogs(prev => [...prev, '✅ All i18n keys validated']);
      }

      // Run comprehensive AI tests via contract-based API
      setLogs(prev => [...prev, '\n=== Running comprehensive test suite ===']);
      const testResponse = await aiTesting.executeTests({
        testSuites: ['database', 'edge-functions', 'storage', 'templates'],
        includeI18n: false,
      });

      // Merge results
      setResults([...i18nResults, ...testResponse.results]);
      
      // Add backend logs
      testResponse.logs.forEach(log => {
        setLogs(prev => [...prev, log]);
      });

    } catch (error) {
      setLogs(prev => [...prev, `Error: ${(error as Error).message}`]);
    } finally {
      console.log = originalConsoleLog;
      setIsRunning(false);
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
          <Button 
            onClick={handleRunTests} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Comprehensive Tests...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Execute Test Plan
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
              <pre className="text-sm font-mono whitespace-pre-wrap">
                {logs.join('\n')}
              </pre>
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
                    {result.duration && (
                      <span className="text-sm text-muted-foreground">
                        ({result.duration}ms)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(result.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}