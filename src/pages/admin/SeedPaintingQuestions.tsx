/**
 * Admin Page: Seed Painting & Decorating Question Packs
 * Provides UI for inserting all 8 interior painting question packs
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { seedPaintingQuestions, type SeedResult } from '@/lib/admin/seedPaintingQuestions';
import { Link } from 'react-router-dom';

export default function SeedPaintingQuestions() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);

  const handleSeed = async () => {
    setIsSeeding(true);
    setResult(null);

    try {
      const seedResult = await seedPaintingQuestions();
      setResult(seedResult);
    } catch (error) {
      console.error('Seeding error:', error);
      setResult({
        success: 0,
        failed: 8,
        skipped: 0,
        errors: [{ microSlug: 'all', error: 'Unexpected error during seeding' }],
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Seed Painting & Decorating Question Packs</h1>
        <p className="text-muted-foreground">
          Insert question packs for all 8 interior painting micro-services
        </p>
      </div>

      {/* Service List */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>8 Interior Painting Micro-Services</CardTitle>
          <CardDescription>
            All micro-services already exist in the database. This tool will create their question packs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>✓ Room Painting (multi-room)</li>
            <li>✓ Full Property Interior Painting</li>
            <li>✓ Cabinet Painting</li>
            <li>✓ Single Room Painting</li>
            <li>✓ Feature Wall / Accent Design</li>
            <li>✓ Wallpaper Installation</li>
            <li>✓ Wallpaper Removal & Preparation</li>
            <li>✓ Plaster Repair & Prep Before Painting</li>
          </ul>
        </CardContent>
      </Card>

      {/* Seed Action */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Create Question Packs</CardTitle>
          <CardDescription>
            Each pack contains 7 service-specific questions with no logistics overlap
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleSeed}
            disabled={isSeeding}
            size="lg"
            className="w-full"
          >
            {isSeeding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSeeding ? 'Seeding Question Packs...' : 'Seed All 8 Question Packs'}
          </Button>

          {/* Results */}
          {result && (
            <div className="space-y-3">
              {result.success > 0 && (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    Successfully created {result.success} question pack{result.success !== 1 ? 's' : ''}
                  </AlertDescription>
                </Alert>
              )}

              {result.skipped > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Skipped {result.skipped} existing pack{result.skipped !== 1 ? 's' : ''}
                  </AlertDescription>
                </Alert>
              )}

              {result.failed > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold mb-2">
                      Failed to create {result.failed} pack{result.failed !== 1 ? 's' : ''}
                    </div>
                    {result.errors.length > 0 && (
                      <ul className="text-sm space-y-1">
                        {result.errors.map((err, idx) => (
                          <li key={idx}>
                            <span className="font-mono">{err.microSlug}</span>: {err.error}
                          </li>
                        ))}
                      </ul>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Testing Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <strong>1. Verify Database</strong>
            <p className="text-muted-foreground">Check question_packs table for 8 new entries</p>
          </div>
          <div>
            <strong>2. Test User Flow</strong>
            <p className="text-muted-foreground">
              <Link to="/post" className="text-primary hover:underline">
                Go to /post
              </Link>
              {' '}→ Select "Painting & Decorating" → Choose any micro-service → Verify 7 custom questions appear
            </p>
          </div>
          <div>
            <strong>3. Submit Test Job</strong>
            <p className="text-muted-foreground">
              Complete wizard and verify micro_q_answers captures all responses
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
