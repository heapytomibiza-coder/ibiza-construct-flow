import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCallRecordings } from '@/hooks/useCallRecordings';
import { Play, Download, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CallRecordingPlayerProps {
  sessionId: string;
}

export const CallRecordingPlayer = ({ sessionId }: CallRecordingPlayerProps) => {
  const { recordings, transcriptions, isLoading } = useCallRecordings(sessionId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const recording = recordings?.[0];
  const transcription = transcriptions?.[0];

  if (!recording && !transcription) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No recording or transcription available</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <Tabs defaultValue="recording">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recording" disabled={!recording}>
            <Play className="h-4 w-4 mr-2" />
            Recording
          </TabsTrigger>
          <TabsTrigger value="transcription" disabled={!transcription}>
            <FileText className="h-4 w-4 mr-2" />
            Transcription
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recording" className="mt-4">
          {recording ? (
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <video
                  controls
                  className="w-full h-full rounded-lg"
                  src={recording.recording_url}
                >
                  Your browser does not support the video tag.
                </video>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>
                  Duration: {Math.floor((recording.duration_seconds || 0) / 60)}m{' '}
                  {(recording.duration_seconds || 0) % 60}s
                </div>
                {recording.file_size && (
                  <div>Size: {(recording.file_size / (1024 * 1024)).toFixed(2)} MB</div>
                )}
              </div>

              <Button className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Recording
              </Button>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No recording available
            </p>
          )}
        </TabsContent>

        <TabsContent value="transcription" className="mt-4">
          {transcription ? (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4 max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">
                  {transcription.transcription_text}
                </pre>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>Language: {transcription.language?.toUpperCase() || 'EN'}</div>
                {transcription.confidence_score && (
                  <div>
                    Confidence: {(transcription.confidence_score * 100).toFixed(0)}%
                  </div>
                )}
              </div>

              <Button className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Transcript
              </Button>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No transcription available
            </p>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};