'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { facialAnalysisService, FacialFeatures, CompatibilityScore } from '@/services/facialAnalysis';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { FACEMESH_TESSELATION } from '@mediapipe/face_mesh';
import { useAuth } from '@/contexts/AuthContext';

// Chargement dynamique des composants MediaPipe
const MediaPipeComponents = dynamic(
    () => import('@/components/facial-analysis/MediaPipeComponents'),
    { ssr: false }
);

export default function FacialAnalysisPage() {
    const t = useTranslations('FacialAnalysis');
    const { toast } = useToast();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hasConsent, setHasConsent] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [facialFeatures, setFacialFeatures] = useState<FacialFeatures | null>(null);
    const [compatibilityScore, setCompatibilityScore] = useState<CompatibilityScore | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (error) {
            console.error('Erreur lors de l\'accès à la caméra:', error);
            toast({
                title: t('cameraError.title'),
                description: t('cameraError.description'),
                variant: 'destructive'
            });
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const captureImage = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        return canvas.toDataURL('image/jpeg');
    };

    const drawFaceMesh = (landmarks: any[]) => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(videoRef.current!, 0, 0, canvas.width, canvas.height);

        drawConnectors(context, landmarks, FACEMESH_TESSELATION, {
            color: '#C0C0C070',
            lineWidth: 1
        });
        drawLandmarks(context, landmarks, {
            color: '#FF0000',
            lineWidth: 1,
            radius: 2
        });
    };

    const analyzeFace = async () => {
        if (!hasConsent) {
            toast({
                title: t('consentRequired.title'),
                description: t('consentRequired.description'),
                variant: 'destructive'
            });
            return;
        }

        setIsAnalyzing(true);
        try {
            const imageData = captureImage();
            if (!imageData) throw new Error('Impossible de capturer l\'image');

            const features = await facialAnalysisService.analyzeFace(imageData);
            setFacialFeatures(features);

            // Simuler un calcul de compatibilité
            const score = await facialAnalysisService.calculateCompatibility(
                'current-user',
                'target-user'
            );
            setCompatibilityScore(score);

            toast({
                title: t('analysisSuccess.title'),
                description: t('analysisSuccess.description')
            });
        } catch (error) {
            console.error('Erreur lors de l\'analyse:', error);
            toast({
                title: t('analysisError.title'),
                description: t('analysisError.description'),
                variant: 'destructive'
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="container mx-auto p-4 space-y-6">
            <h1 className="text-3xl font-bold text-center mb-8">{t('title')}</h1>

            {!hasConsent ? (
                <Card>
                    <CardHeader>
                        <CardTitle>{t('consent.title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>{t('consent.description')}</p>
                        <div className="space-y-2">
                            <p className="font-semibold">{t('consent.dataCollection')}</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>{t('consent.dataPoints.facialFeatures')}</li>
                                <li>{t('consent.dataPoints.emotions')}</li>
                                <li>{t('consent.dataPoints.attributes')}</li>
                            </ul>
                        </div>
                        <div className="space-y-2">
                            <p className="font-semibold">{t('consent.dataUsage')}</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>{t('consent.usagePoints.matching')}</li>
                                <li>{t('consent.usagePoints.recommendations')}</li>
                                <li>{t('consent.usagePoints.improvements')}</li>
                            </ul>
                        </div>
                        <Button
                            onClick={() => setHasConsent(true)}
                            className="w-full"
                        >
                            {t('consent.accept')}
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('camera.title')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                                <canvas
                                    ref={canvasRef}
                                    className="absolute top-0 left-0 w-full h-full"
                                />
                            </div>
                            <div className="flex gap-4">
                                <Button
                                    onClick={startCamera}
                                    disabled={!!stream}
                                    className="flex-1"
                                >
                                    {t('camera.start')}
                                </Button>
                                <Button
                                    onClick={stopCamera}
                                    disabled={!stream}
                                    variant="destructive"
                                    className="flex-1"
                                >
                                    {t('camera.stop')}
                                </Button>
                            </div>
                            <Button
                                onClick={analyzeFace}
                                disabled={!stream || isAnalyzing}
                                className="w-full"
                            >
                                {isAnalyzing ? t('analyzing') : t('analyze')}
                            </Button>
                        </CardContent>
                    </Card>

                    <MediaPipeComponents videoRef={videoRef} canvasRef={canvasRef} />
                </div>
            )}
        </div>
    );
} 