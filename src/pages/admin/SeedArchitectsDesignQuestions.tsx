/**
 * Admin UI for Seeding Architects & Design Question Packs
 * 6 micro-services across Interior Design, Residential Architects, Structural Engineers
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, AlertCircle, Cuboid, LayoutGrid, Home, FileText, Scale, Calculator } from 'lucide-react';
import { seedArchitectsDesignQuestions } from '@/lib/admin/seedArchitectsDesignQuestions';
import { Link } from 'react-router-dom';

interface SeedingStatus {
  isSeeding: boolean;
  result?: {
    success: number;
    failed: number;
    skipped: number;
    errors: string[];
    details: Array<{
      slug: string;
      status: 'success' | 'failed' | 'skipped';
      message?: string;
    }>;
  };
}

const SERVICES = [
  { slug: '3d-visualization', name: '3D Visualization', icon: Cuboid, subcategory: 'Interior Design' },
  { slug: 'space-planning', name: 'Space Planning', icon: LayoutGrid, subcategory: 'Interior Design' },
  { slug: 'house-extension-plans', name: 'House Extension Plans', icon: Home, subcategory: 'Residential Architects' },
  { slug: 'planning-drawings', name: 'Planning Drawings', icon: FileText, subcategory: 'Residential Architects' },
  { slug: 'load-assessment', name: 'Load Assessment', icon: Scale, subcategory: 'Structural Engineers' },
  { slug: 'structural-calculations', name: 'Structural Calculations', icon: Calculator, subcategory: 'Structural Engineers' }
];

export default function SeedArchitectsDesignQuestions() {
  const [seedingStatus, setSeedingStatus] = useState<SeedingStatus>({
    isSeeding: false
  });

  const handleSeedQuestions = async () => {
    setSeedingStatus({ isSeeding: true });

    try {
      const result = await seedArchitectsDesignQuestions();
      setSeedingStatus({
        isSeeding: false,
        result
      });
    } catch (error) {
      console.error('Seeding error:', error);
      setSeedingStatus({
        isSeeding: false,
        result: {
          success: 0,
          failed: SERVICES.length,
          skipped: 0,
          errors: [`Unexpected error: ${error}`],
          details: SERVICES.map(s => ({
            slug: s.slug,
            status: 'failed' as const,
            message: 'Seeding process failed'
          }))
        }
      });
    }
  };

  const getStatusIcon = (status?: 'success' | 'failed' | 'skipped') => {
    if (!status) return null;
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'skipped':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getServiceStatus = (slug: string) => {
    return seedingStatus.result?.details.find(d => d.slug === slug);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Architects & Design Question Packs</h1>
        <p className="text-muted-foreground">
          Seed question packs for 6 micro-services across Interior Design, Residential Architects, and Structural Engineers
        </p>
      </div>

      {/* Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>📋 Services Overview</CardTitle>
          <CardDescription>
            All 6 micro-services already exist in the database. This tool will create their question packs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SERVICES.map((service) => {
              const Icon = service.icon;
              const status = getServiceStatus(service.slug);
              
              return (
                <div
                  key={service.slug}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                >
                  <Icon className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{service.name}</p>
                      {status && getStatusIcon(status.status)}
                    </div>
                    <p className="text-xs text-muted-foreground">{service.subcategory}</p>
                    {status?.message && (
                      <p className="text-xs text-muted-foreground mt-1">{status.message}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Seeding Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>🌱 Seed Question Packs</CardTitle>
          <CardDescription>
            Create question packs for all 6 services. Each pack contains 7 service-specific questions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleSeedQuestions}
            disabled={seedingStatus.isSeeding}
            size="lg"
            className="w-full"
          >
            {seedingStatus.isSeeding ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Seeding Question Packs...
              </>
            ) : (
              'Seed Question Packs'
            )}
          </Button>

          {/* Results */}
          {seedingStatus.result && (
            <Alert className={
              seedingStatus.result.failed > 0 ? 'border-red-500' :
              seedingStatus.result.success > 0 ? 'border-green-500' :
              'border-yellow-500'
            }>
              <AlertDescription>
                <div className="space-y-2">
                  <div className="flex items-center gap-4 flex-wrap">
                    <Badge variant="default" className="bg-green-600">
                      ✅ Success: {seedingStatus.result.success}
                    </Badge>
                    <Badge variant="destructive">
                      ❌ Failed: {seedingStatus.result.failed}
                    </Badge>
                    <Badge variant="secondary">
                      ⏭️ Skipped: {seedingStatus.result.skipped}
                    </Badge>
                  </div>

                  {seedingStatus.result.errors.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="font-semibold text-sm">Errors:</p>
                      {seedingStatus.result.errors.map((error, idx) => (
                        <p key={idx} className="text-xs text-red-600">{error}</p>
                      ))}
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Testing Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>🧪 Testing Instructions</CardTitle>
          <CardDescription>
            Verify the question packs are working correctly in the job posting wizard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium mb-2">1. Navigate to Job Wizard</h4>
              <Button variant="outline" asChild>
                <Link to="/post">Go to /post</Link>
              </Button>
            </div>

            <div>
              <h4 className="font-medium mb-2">2. Test Each Service</h4>
              <ul className="space-y-2 text-sm text-muted-foreground ml-4">
                <li>• Select "Architects & Design" category</li>
                <li>• Test each subcategory:</li>
                <li className="ml-4">
                  <strong>Interior Design:</strong> Should show 3D Visualization + Space Planning
                </li>
                <li className="ml-4">
                  <strong>Residential Architects:</strong> Should show House Extension Plans + Planning Drawings
                </li>
                <li className="ml-4">
                  <strong>Structural Engineers:</strong> Should show Load Assessment + Structural Calculations
                </li>
                <li>• For each service, verify 7 custom questions appear</li>
                <li>• Confirm no logistics questions are duplicated</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">3. Expected Behavior</h4>
              <ul className="space-y-1 text-sm text-muted-foreground ml-4">
                <li>✅ Each service shows exactly 7 service-specific questions</li>
                <li>✅ Questions are relevant to the service type</li>
                <li>✅ No overlap with logistics screen (location, dates, budget, etc.)</li>
                <li>✅ Options can be selected and saved correctly</li>
                <li>✅ Job submission captures all question responses</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
