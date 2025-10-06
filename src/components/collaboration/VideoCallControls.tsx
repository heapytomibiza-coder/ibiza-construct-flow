import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useVideoCall } from '@/hooks/useVideoCall';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  Monitor,
  MonitorOff
} from 'lucide-react';

interface VideoCallControlsProps {
  conversationId?: string;
  onCallEnd?: () => void;
}

export const VideoCallControls = ({ conversationId, onCallEnd }: VideoCallControlsProps) => {
  const {
    isCallActive,
    isMuted,
    isVideoOff,
    isScreenSharing,
    localVideoRef,
    remoteVideoRef,
    endCall,
    toggleMute,
    toggleVideo,
    toggleScreenShare
  } = useVideoCall(conversationId);

  const handleEndCall = async () => {
    await endCall();
    onCallEnd?.();
  };

  if (!isCallActive) return null;

  return (
    <Card className="fixed inset-4 z-50 flex flex-col bg-background/95 backdrop-blur">
      {/* Video containers */}
      <div className="flex-1 relative">
        {/* Remote video (main) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover rounded-t-lg"
        />

        {/* Local video (picture-in-picture) */}
        <div className="absolute bottom-4 right-4 w-48 h-36 rounded-lg overflow-hidden shadow-lg border-2 border-primary">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 p-4 bg-muted/50">
        <Button
          variant={isMuted ? 'destructive' : 'secondary'}
          size="lg"
          onClick={toggleMute}
          className="rounded-full h-14 w-14"
        >
          {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </Button>

        <Button
          variant={isVideoOff ? 'destructive' : 'secondary'}
          size="lg"
          onClick={toggleVideo}
          className="rounded-full h-14 w-14"
        >
          {isVideoOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
        </Button>

        <Button
          variant={isScreenSharing ? 'default' : 'secondary'}
          size="lg"
          onClick={toggleScreenShare}
          className="rounded-full h-14 w-14"
        >
          {isScreenSharing ? (
            <MonitorOff className="h-6 w-6" />
          ) : (
            <Monitor className="h-6 w-6" />
          )}
        </Button>

        <Button
          variant="destructive"
          size="lg"
          onClick={handleEndCall}
          className="rounded-full h-14 w-14"
        >
          <Phone className="h-6 w-6 rotate-135" />
        </Button>
      </div>
    </Card>
  );
};
