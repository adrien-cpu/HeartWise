
"use client";

import React, { useState, ChangeEvent, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, ScanFace, AlertCircle, UserSearch, Upload, Video } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { suggestFacialMatches, FacialMatchSuggestion } from '@/ai/flows/facial-match-suggestions';
import { useAuth } from '@/contexts/AuthContext'; // For getting currentUserId
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

/**
 * @fileOverview Implements the AI-Powered Facial Analysis and Matching page.
 * @module FacialAnalysisMatchingPage
 * @description Allows users to upload/capture their photo. The AI then suggests potential matches
 *              based on simulated facial and psychological compatibility with a mock user database.
 */
export default function FacialAnalysisMatchingPage() {
  const t = useTranslations('FacialAnalysisMatching');
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const [userImageFile, setUserImageFile] = useState<File | null>(null);
  const [userImageDataUri, setUserImageDataUri] = useState<string | null>(null);
  const [suggestedMatches, setSuggestedMatches] = useState<FacialMatchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);


  useEffect(() => {
    // Clean up stream when component unmounts or camera is hidden
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const enableCamera = async () => {
    setShowCamera(true);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setHasCameraPermission(false);
        setError(t('cameraAccessDeniedError'));
        toast({ variant: 'destructive', title: t('errorTitle'), description: t('cameraAccessDeniedError') });
        setShowCamera(false);
      }
    } else {
      setHasCameraPermission(false);
      setError(t('cameraNotSupportedError'));
      toast({ variant: 'destructive', title: t('errorTitle'), description: t('cameraNotSupportedError') });
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        setUserImageDataUri(dataUri);
        // Convert data URI to File object for consistency, though flow uses data URI
        fetch(dataUri).then(res => res.blob()).then(blob => {
            setUserImageFile(new File([blob], "capture.jpg", { type: "image/jpeg" }));
        });

        // Stop camera stream
        if (video.srcObject) {
            (video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        }
        setShowCamera(false);
        setHasCameraPermission(null); // Reset camera permission state for next time
      }
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
       if (file.size > 5 * 1024 * 1024) { 
        toast({ variant: 'destructive', title: t('fileTooLargeTitle'), description: t('fileTooLargeDesc') });
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast({ variant: 'destructive', title: t('invalidFileTypeTitle'), description: t('invalidFileTypeDesc') });
        return;
      }
      setUserImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImageDataUri(reader.result as string);
      };
      reader.readAsDataURL(file);
      setShowCamera(false); // Hide camera if file is chosen
    }
  };

  const handleFindMatches = async () => {
    if (!userImageDataUri) {
      setError(t('errorMissingImage'));
      toast({ variant: "destructive", title: t('errorTitle'), description: t('errorMissingImage') });
      return;
    }
    if (!currentUser?.uid) {
      setError(t('errorAuthRequired'));
      toast({ variant: "destructive", title: t('errorTitle'), description: t('errorAuthRequired') });
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuggestedMatches([]);

    try {
      const result = await suggestFacialMatches({ 
        currentUserPhotoDataUri: userImageDataUri,
        currentUserId: currentUser.uid 
      });
      setSuggestedMatches(result.suggestions);
      if (result.suggestions.length > 0) {
        toast({ title: t('matchesFoundTitle'), description: t('matchesFoundDesc', { count: result.suggestions.length }) });
      } else {
        toast({ title: t('noMatchesFoundTitle'), description: t('noMatchesFoundDesc') });
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t('unknownError');
      console.error("Facial match suggestion failed:", err);
      setError(t('errorAnalysisFailed', { message: errorMessage }));
      toast({ variant: "destructive", title: t('errorTitle'), description: t('errorAnalysisFailed', { message: errorMessage }) });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getInitials = (name?: string): string => {
    if (!name) return '?'; return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto shadow-lg border">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
            <ScanFace className="h-8 w-8 text-primary" />
            {t('titleAiPowered')}
          </CardTitle>
          <CardDescription>{t('descriptionAiPowered')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t('errorTitle')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="border-dashed border-2 p-4 flex flex-col items-center space-y-3 min-h-[250px] justify-center">
            {userImageDataUri && !showCamera && (
              <Image
                src={userImageDataUri}
                alt={t('yourPhotoAlt')}
                width={150}
                height={150}
                className="rounded-md object-cover aspect-square shadow-md"
                data-ai-hint="person"
              />
            )}
            
            {showCamera && (
              <div className="w-full flex flex-col items-center">
                <video ref={videoRef} className="w-full max-w-xs aspect-video rounded-md bg-muted mb-2" autoPlay playsInline muted />
                {hasCameraPermission === false && (
                     <Alert variant="destructive" className="w-full max-w-xs">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{t('cameraAccessDeniedError')}</AlertTitle>
                     </Alert>
                )}
                <Button onClick={capturePhoto} disabled={!hasCameraPermission} className="mt-2">
                  {t('capturePhotoButton')}
                </Button>
                <canvas ref={canvasRef} className="hidden"></canvas>
              </div>
            )}

            {!userImageDataUri && !showCamera && (
              <div className="text-muted-foreground text-sm text-center">{t('uploadOrCapturePrompt')}</div>
            )}

            <div className="flex gap-2 mt-2">
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isLoading || showCamera}>
                    <Upload className="mr-2 h-4 w-4" /> {t('uploadPhotoButton')}
                </Button>
                <Button variant="outline" onClick={enableCamera} disabled={isLoading || showCamera}>
                    <Video className="mr-2 h-4 w-4" /> {t('useCameraButton')}
                </Button>
            </div>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading}
              aria-label={t('uploadPhotoButton')}
            />
             {userImageDataUri && (
                 <Button variant="link" size="sm" onClick={() => { setUserImageDataUri(null); setUserImageFile(null); setShowCamera(false); if(videoRef.current?.srcObject){(videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());} }} className="text-xs">
                     {t('clearImageButton')}
                 </Button>
             )}
          </Card>

          <div className="text-center mt-6">
            <Button onClick={handleFindMatches} disabled={isLoading || !userImageDataUri || !currentUser?.uid} size="lg">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserSearch className="mr-2 h-4 w-4" />}
              {isLoading ? t('findingMatchesButton') : t('findMatchesButton')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Suggested Matches Section */}
      {(!isLoading && suggestedMatches.length > 0) && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-center mb-6">{t('suggestedMatchesTitle')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestedMatches.map((match) => (
              <Card key={match.userId} className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
                <CardHeader className="items-center">
                  <Avatar className="h-24 w-24 border-2" data-ai-hint={match.dataAiHint || 'person'}>
                    <AvatarImage src={match.profilePicture} alt={match.name || 'Match'} />
                    <AvatarFallback>{getInitials(match.name)}</AvatarFallback>
                  </Avatar>
                </CardHeader>
                <CardContent className="text-center flex-grow">
                  <CardTitle className="text-lg mb-1">{match.name || t('unknownUser')}</CardTitle>
                  <Badge variant="secondary" className="mb-2">{t('overallCompatibility', { score: match.overallCompatibilityScore })}</Badge>
                  <CardDescription className="text-xs text-muted-foreground italic leading-relaxed">
                    &quot;{match.reasoning}&quot;
                  </CardDescription>
                </CardContent>
                <CardFooter className="justify-center">
                    <Button variant="outline" size="sm">{t('viewProfileButton')}</Button> 
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
       {(!isLoading && suggestedMatches.length === 0 && userImageDataUri && !error) && (
           <p className="mt-6 text-center text-muted-foreground">{t('noMatchesFoundAfterSearch')}</p>
       )}
    </div>
  );
}