import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CallSession {
  id: string;
  room_id: string;
  initiator_id: string;
  participants: string[];
  call_type: 'audio' | 'video' | 'screen_share';
  status: 'waiting' | 'active' | 'ended';
  started_at: string;
  ended_at?: string;
  duration_seconds?: number;
}

export const useVideoCall = (conversationId?: string) => {
  const [callSession, setCallSession] = useState<CallSession | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const { toast } = useToast();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Initialize WebRTC
  const initializeWebRTC = async (callType: 'audio' | 'video' | 'screen_share') => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: callType === 'video' || callType === 'screen_share'
      };

      let stream: MediaStream;

      if (callType === 'screen_share') {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      } else {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      }

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const configuration: RTCConfiguration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };

      peerConnectionRef.current = new RTCPeerConnection(configuration);

      // Add local stream tracks to peer connection
      stream.getTracks().forEach((track) => {
        if (peerConnectionRef.current && localStreamRef.current) {
          peerConnectionRef.current.addTrack(track, localStreamRef.current);
        }
      });

      // Handle remote stream
      peerConnectionRef.current.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      return true;
    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      toast({
        title: 'Error',
        description: 'Failed to access camera/microphone',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Start call
  const startCall = async (callType: 'audio' | 'video' | 'screen_share', participantIds: string[]) => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const initialized = await initializeWebRTC(callType);
    if (!initialized) return;

    const roomId = `${conversationId || 'call'}-${Date.now()}`;

    const { data, error } = await (supabase as any)
      .from('call_sessions')
      .insert({
        room_id: roomId,
        initiator_id: user.data.user.id,
        participants: participantIds,
        call_type: callType,
        status: 'waiting',
        conversation_id: conversationId
      })
      .select()
      .single();

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to start call',
        variant: 'destructive'
      });
      return;
    }

    setCallSession(data as CallSession);
    setIsCallActive(true);

    toast({
      title: 'Call Started',
      description: 'Waiting for participants to join...'
    });
  };

  // Join call
  const joinCall = async (sessionId: string) => {
    const { data, error } = await (supabase as any)
      .from('call_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error || !data) {
      toast({
        title: 'Error',
        description: 'Call session not found',
        variant: 'destructive'
      });
      return;
    }

    const session = data as CallSession;
    const initialized = await initializeWebRTC(session.call_type);
    if (!initialized) return;

    setCallSession(session);
    setIsCallActive(true);

    // Update session status
    await (supabase as any)
      .from('call_sessions')
      .update({ status: 'active' })
      .eq('id', sessionId);
  };

  // End call
  const endCall = async () => {
    if (!callSession) return;

    // Stop all tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }

    // Update session
    const duration = Math.floor(
      (new Date().getTime() - new Date(callSession.started_at).getTime()) / 1000
    );

    await (supabase as any)
      .from('call_sessions')
      .update({
        status: 'ended',
        ended_at: new Date().toISOString(),
        duration_seconds: duration
      })
      .eq('id', callSession.id);

    setIsCallActive(false);
    setCallSession(null);
    localStreamRef.current = null;
    peerConnectionRef.current = null;
  };

  // Toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  // Toggle screen share
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (localStreamRef.current) {
        const videoTrack = localStreamRef.current.getVideoTracks()[0];
        videoTrack?.stop();
      }
      setIsScreenSharing(false);
    } else {
      // Start screen sharing
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = stream.getVideoTracks()[0];

        if (peerConnectionRef.current && localStreamRef.current) {
          const sender = peerConnectionRef.current
            .getSenders()
            .find((s) => s.track?.kind === 'video');

          if (sender) {
            sender.replaceTrack(screenTrack);
          }

          screenTrack.onended = () => {
            setIsScreenSharing(false);
          };

          setIsScreenSharing(true);
        }
      } catch (error) {
        console.error('Error sharing screen:', error);
        toast({
          title: 'Error',
          description: 'Failed to share screen',
          variant: 'destructive'
        });
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  return {
    callSession,
    isCallActive,
    isMuted,
    isVideoOff,
    isScreenSharing,
    localVideoRef,
    remoteVideoRef,
    startCall,
    joinCall,
    endCall,
    toggleMute,
    toggleVideo,
    toggleScreenShare
  };
};
