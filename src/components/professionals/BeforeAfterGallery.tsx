import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X, ArrowRight } from 'lucide-react';

interface JobPhoto {
  id: string;
  job_id: string;
  photo_type: 'before' | 'after' | 'progress';
  image_url: string;
  caption?: string;
  taken_at?: string;
}

interface BeforeAfterPair {
  jobId: string;
  before: JobPhoto[];
  after: JobPhoto[];
}

interface BeforeAfterGalleryProps {
  photos: JobPhoto[];
}

export const BeforeAfterGallery = ({ photos }: BeforeAfterGalleryProps) => {
  const [selectedPair, setSelectedPair] = useState<BeforeAfterPair | null>(null);

  if (!photos || photos.length === 0) {
    return null;
  }

  // Group photos by job_id to create before/after pairs
  const photosByJob = photos.reduce((acc, photo) => {
    if (!acc[photo.job_id]) {
      acc[photo.job_id] = { before: [], after: [], progress: [] };
    }
    acc[photo.job_id][photo.photo_type].push(photo);
    return acc;
  }, {} as Record<string, { before: JobPhoto[]; after: JobPhoto[]; progress: JobPhoto[] }>);

  // Filter to only include jobs with both before and after photos
  const completePairs: BeforeAfterPair[] = Object.entries(photosByJob)
    .filter(([_, photos]) => photos.before.length > 0 && photos.after.length > 0)
    .map(([jobId, photos]) => ({
      jobId,
      before: photos.before,
      after: photos.after
    }));

  if (completePairs.length === 0) {
    return null;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Before & After</CardTitle>
          <p className="text-sm text-muted-foreground">
            Real transformations from completed jobs
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {completePairs.map((pair, index) => {
              const beforePhoto = pair.before[0];
              const afterPhoto = pair.after[0];
              
              return (
                <div
                  key={pair.jobId}
                  className="group cursor-pointer"
                  onClick={() => setSelectedPair(pair)}
                >
                  <div className="relative rounded-lg overflow-hidden bg-muted">
                    <div className="grid grid-cols-2 gap-1">
                      {/* Before Image */}
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={beforePhoto.image_url}
                          alt="Before"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <Badge className="absolute top-2 left-2 bg-red-500">
                          Before
                        </Badge>
                      </div>

                      {/* After Image */}
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={afterPhoto.image_url}
                          alt="After"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <Badge className="absolute top-2 right-2 bg-green-500">
                          After
                        </Badge>
                      </div>
                    </div>

                    {/* Arrow overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                      <div className="bg-white rounded-full p-3 shadow-lg">
                        <ArrowRight className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  </div>

                  {/* Captions */}
                  {(beforePhoto.caption || afterPhoto.caption) && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      {beforePhoto.caption && (
                        <p className="line-clamp-2">{beforePhoto.caption}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed View Dialog */}
      <Dialog open={!!selectedPair} onOpenChange={() => setSelectedPair(null)}>
        <DialogContent className="max-w-6xl p-0">
          {selectedPair && (
            <div className="relative">
              <button
                onClick={() => setSelectedPair(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6">
                <h3 className="text-2xl font-bold mb-6 text-center">
                  Job Transformation
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* All Before Photos */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold flex items-center gap-2">
                      <Badge className="bg-red-500">Before</Badge>
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      {selectedPair.before.map((photo) => (
                        <div key={photo.id} className="space-y-2">
                          <img
                            src={photo.image_url}
                            alt="Before"
                            className="w-full rounded-lg"
                          />
                          {photo.caption && (
                            <p className="text-sm text-muted-foreground">
                              {photo.caption}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* All After Photos */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold flex items-center gap-2">
                      <Badge className="bg-green-500">After</Badge>
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      {selectedPair.after.map((photo) => (
                        <div key={photo.id} className="space-y-2">
                          <img
                            src={photo.image_url}
                            alt="After"
                            className="w-full rounded-lg"
                          />
                          {photo.caption && (
                            <p className="text-sm text-muted-foreground">
                              {photo.caption}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
