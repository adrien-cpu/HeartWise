'use client';

import { useEffect } from 'react';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { FaceMesh, FACEMESH_TESSELATION } from '@mediapipe/face_mesh';

interface MediaPipeComponentsProps {
    videoRef: React.RefObject<HTMLVideoElement>;
    canvasRef: React.RefObject<HTMLCanvasElement>;
}

export default function MediaPipeComponents({ videoRef, canvasRef }: MediaPipeComponentsProps) {
    useEffect(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const faceMesh = new FaceMesh({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            }
        });

        faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        faceMesh.onResults((results) => {
            if (!canvasRef.current || !videoRef.current) return;

            const ctx = canvasRef.current.getContext('2d');
            if (!ctx) return;

            // Clear canvas
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            // Draw video frame
            ctx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

            // Draw face mesh
            if (results.multiFaceLandmarks) {
                for (const landmarks of results.multiFaceLandmarks) {
                    drawConnectors(ctx, landmarks, FACEMESH_TESSELATION, {
                        color: '#C0C0C070',
                        lineWidth: 1
                    });
                    drawLandmarks(ctx, landmarks, {
                        color: '#FF0000',
                        lineWidth: 1,
                        radius: 2
                    });
                }
            }
        });

        const processFrame = async () => {
            if (!videoRef.current || !canvasRef.current) return;

            await faceMesh.send({ image: videoRef.current });
            requestAnimationFrame(processFrame);
        };

        processFrame();

        return () => {
            faceMesh.close();
        };
    }, [videoRef, canvasRef]);

    return null;
} 