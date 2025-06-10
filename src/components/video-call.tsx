'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { WebRTCService } from '@/services/webrtc_service';
import { Mic, MicOff, Video, VideoOff, Share, PhoneOff } from 'lucide-react';

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
    const [callState, setCallState] = useState<{
        isCallActive: boolean;
        isMuted: boolean;
        isVideoEnabled: boolean;
        isScreenSharing: boolean;
    }>({
        isCallActive: false,
        isMuted: false,
        isVideoEnabled: true,
        isScreenSharing: false
    });

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const webrtcServiceRef = useRef<WebRTCService | null>(null);

    useEffect(() => {
        const initializeCall = async () => {
            webrtcServiceRef.current = new WebRTCService(userId);
            webrtcServiceRef.current.setCallStateChangeCallback((state) => {
                setCallState({
                    isCallActive: state.isCallActive,
                    isMuted: state.isMuted,
                    isVideoEnabled: state.isVideoEnabled,
                    isScreenSharing: state.isScreenSharing
                });

                if (state.localStream && localVideoRef.current) {
                    localVideoRef.current.srcObject = state.localStream;
                }
                if (state.remoteStream && remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = state.remoteStream;
                }
            });

            try {
                if (isIncoming) {
                    const callId = `${targetUserId}_${userId}_${Date.now()}`;
                    await webrtcServiceRef.current.handleIncomingCall(callId);
                } else {
                    await webrtcServiceRef.current.initializeCall(targetUserId);
                }
            } catch (error) {
                console.error('Erreur lors de l\'initialisation de l\'appel:', error);
                onCallEnd?.();
            }
        };

        initializeCall();

        return () => {
            webrtcServiceRef.current?.endCall();
        };
    }, [userId, targetUserId, isIncoming, onCallEnd]);

    const handleToggleMute = async () => {
        await webrtcServiceRef.current?.toggleMute();
    };

    const handleToggleVideo = async () => {
        await webrtcServiceRef.current?.toggleVideo();
    };

    const handleToggleScreenShare = async () => {
        await webrtcServiceRef.current?.toggleScreenShare();
    };

    const handleEndCall = async () => {
        await webrtcServiceRef.current?.endCall();
        onCallEnd?.();
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

            <div className="flex justify-center gap-4 mt-4">
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
            </div>
        </Card>
    );
} 