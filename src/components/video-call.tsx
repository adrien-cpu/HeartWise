'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { WebRTCService } from '@/services/webrtc_service';
import { Mic, MicOff, Video, VideoOff, Share, PhoneOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoCallProps {
  userId: string;
  targetUserId: string;
  isIncoming?: boolean;
  onCallEnd?: () => void;
}

export function VideoCall({
  userId,
  targetUserId,
  isIncoming = false,
  onCallEnd
}: VideoCallProps) {
  const t = useTranslations('VideoCall');
  const { toast } = useToast();
  const [callState, setCallState] = useState<{
    isCallActive: boolean;
    isMuted: boolean;
    isVideoEnabled: boolean;
    isScreenSharing: boolean;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
  }>({
    isCallActive: false,
    isMuted: false,
    isVideoEnabled: true,
    isScreenSharing: false,
    localStream: null,
    remoteStream: null
  });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const webrtcServiceRef = useRef<WebRTCService | null>(null);

  useEffect(() => {
    const initializeCall = async () => {
      try {
        webrtcServiceRef.current = new WebRTCService(userId);
        
        webrtcServiceRef.current.setCallStateChangeCallback((state) => {
          setCallState(state);
          
          // Update video elements when streams change
          if (state.localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = state.localStream;
          }
          
          if (state.remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = state.remoteStream;
          }
        });

        if (isIncoming) {
          const callId = `${targetUserId}_${userId}_${Date.now()}`;
          await webrtcServiceRef.current.handleIncomingCall(callId);
          await webrtcServiceRef.current.acceptCall();
        } else {
          await webrtcServiceRef.current.initializeCall(targetUserId);
        }
      } catch (error) {
        console.error('Error initializing call:', error);
        toast({
          variant: 'destructive',
          title: t('error.general'),
          description: error instanceof Error ? error.message : t('error.connection')
        });
        handleEndCall();
      }
    };

    initializeCall();

    return () => {
      if (webrtcServiceRef.current) {
        webrtcServiceRef.current.endCall();
      }
    };
  }, [userId, targetUserId, isIncoming, toast, t]);

  const handleToggleMute = async () => {
    if (!webrtcServiceRef.current) return;
    
    try {
      const isMuted = await webrtcServiceRef.current.toggleMute();
      setCallState(prev => ({ ...prev, isMuted }));
    } catch (error) {
      console.error('Error toggling mute:', error);
      toast({
        variant: 'destructive',
        title: t('error.general'),
        description: t('error.microphoneAccess')
      });
    }
  };

  const handleToggleVideo = async () => {
    if (!webrtcServiceRef.current) return;
    
    try {
      const isVideoEnabled = await webrtcServiceRef.current.toggleVideo();
      setCallState(prev => ({ ...prev, isVideoEnabled }));
    } catch (error) {
      console.error('Error toggling video:', error);
      toast({
        variant: 'destructive',
        title: t('error.general'),
        description: t('error.cameraAccess')
      });
    }
  };

  const handleToggleScreenShare = async () => {
    if (!webrtcServiceRef.current) return;
    
    try {
      const isScreenSharing = await webrtcServiceRef.current.toggleScreenShare();
      setCallState(prev => ({ ...prev, isScreenSharing }));
    } catch (error) {
      console.error('Error toggling screen share:', error);
      toast({
        variant: 'destructive',
        title: t('error.general'),
        description: t('error.screenShare')
      });
    }
  };

  const handleEndCall = async () => {
    if (webrtcServiceRef.current) {
      await webrtcServiceRef.current.endCall();
    }
    
    if (onCallEnd) {
      onCallEnd();
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto p-4">
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="absolute bottom-4 right-4 w-48 h-36 object-cover rounded-lg border-2 border-white"
        />
      </div>

      <CardContent className="flex justify-center gap-4 mt-4">
        <Button
          variant={callState.isMuted ? "destructive" : "secondary"}
          size="icon"
          onClick={handleToggleMute}
          title={callState.isMuted ? t('unmute') : t('mute')}
        >
          {callState.isMuted ? <MicOff /> : <Mic />}
        </Button>

        <Button
          variant={!callState.isVideoEnabled ? "destructive" : "secondary"}
          size="icon"
          onClick={handleToggleVideo}
          title={callState.isVideoEnabled ? t('disableVideo') : t('enableVideo')}
        >
          {callState.isVideoEnabled ? <Video /> : <VideoOff />}
        </Button>

        <Button
          variant={callState.isScreenSharing ? "destructive" : "secondary"}
          size="icon"
          onClick={handleToggleScreenShare}
          title={callState.isScreenSharing ? t('stopSharing') : t('shareScreen')}
        >
          <Share />
        </Button>

        <Button
          variant="destructive"
          size="icon"
          onClick={handleEndCall}
          title={t('endCall')}
        >
          <PhoneOff />
        </Button>
      </CardContent>
    </Card>
  );
}