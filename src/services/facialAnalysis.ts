import * as tf from '@tensorflow/tfjs';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as faceDetection from '@tensorflow-models/face-detection';

interface Point {
    x: number;
    y: number;
    z?: number;
}

export interface FacialFeatures {
    faceId: string;
    landmarks: {
        eyes: Point[];
        nose: Point[];
        mouth: Point[];
    };
    emotions: {
        happiness: number;
        sadness: number;
        anger: number;
        surprise: number;
        fear: number;
        disgust: number;
        neutral: number;
    };
    attributes: {
        age: number;
        gender: string;
        smile: number;
        glasses: boolean;
        facialHair: boolean;
    };
}

export interface PsychologicalProfile {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
}

export interface CompatibilityScore {
    overall: number;
    facial: number;
    psychological: number;
    details: {
        facialFeatures: {
            symmetry: number;
            expression: number;
            attractiveness: number;
        };
        personality: {
            values: number;
            interests: number;
            communication: number;
        };
    };
}

class FacialAnalysisService {
    private faceMesh: FaceMesh | null = null;
    private faceLandmarksModel: faceLandmarksDetection.FaceLandmarksDetector | null = null;
    private faceDetectionModel: faceDetection.FaceDetector | null = null;
    private isInitialized = false;

    async initialize() {
        if (this.isInitialized) return;

        this.faceMesh = new FaceMesh({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
            }
        });

        this.faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        this.faceLandmarksModel = await faceLandmarksDetection.createDetector(
            faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
            {
                runtime: 'tfjs',
                refineLandmarks: true,
                maxFaces: 1
            }
        );

        this.faceDetectionModel = await faceDetection.createDetector(
            faceDetection.SupportedModels.MediaPipeFaceDetector,
            {
                runtime: 'tfjs',
                modelType: 'full'
            }
        );

        await this.faceMesh.initialize();
        this.isInitialized = true;
    }

    private calculateEmotions(landmarks: Point[]): FacialFeatures['emotions'] {
        const mouthPoints = landmarks.slice(61, 68);
        const eyePoints = landmarks.slice(33, 46);
        const eyebrowPoints = landmarks.slice(70, 84);

        const mouthHeight = this.calculateDistance(mouthPoints[3], mouthPoints[9]);
        const eyeOpenness = this.calculateAverageDistance(eyePoints);
        const eyebrowHeight = this.calculateAverageHeight(eyebrowPoints);

        return {
            happiness: Math.min(1, mouthHeight * 2),
            sadness: Math.min(1, (1 - mouthHeight) * 0.5),
            anger: Math.min(1, eyebrowHeight * 0.8),
            surprise: Math.min(1, eyeOpenness * 1.2),
            fear: Math.min(1, (1 - eyeOpenness) * 0.7),
            disgust: Math.min(1, (1 - mouthHeight) * 0.6),
            neutral: Math.min(1, (1 - Math.max(mouthHeight, eyeOpenness, eyebrowHeight)) * 0.5)
        };
    }

    private calculateDistance(point1: Point, point2: Point): number {
        return Math.sqrt(
            Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
        );
    }

    private calculateAverageDistance(points: Point[]): number {
        let total = 0;
        for (let i = 0; i < points.length - 1; i++) {
            total += this.calculateDistance(points[i], points[i + 1]);
        }
        return total / (points.length - 1);
    }

    private calculateAverageHeight(points: Point[]): number {
        return points.reduce((sum, point) => sum + point.y, 0) / points.length;
    }

    private calculateSymmetry(landmarks: Point[]): number {
        const leftSide = landmarks.slice(0, 16);
        const rightSide = landmarks.slice(16, 32).reverse();

        let totalDifference = 0;
        for (let i = 0; i < leftSide.length; i++) {
            totalDifference += Math.abs(
                this.calculateDistance(leftSide[i], rightSide[i])
            );
        }

        return 1 - (totalDifference / leftSide.length);
    }

    private estimateAge(landmarks: Point[]): number {
        const faceHeight = this.calculateDistance(landmarks[10], landmarks[152]);
        const faceWidth = this.calculateDistance(landmarks[234], landmarks[454]);
        const eyeDistance = this.calculateDistance(landmarks[33], landmarks[263]);
        const noseLength = this.calculateDistance(landmarks[1], landmarks[4]);

        const faceRatio = faceHeight / faceWidth;
        const eyeRatio = eyeDistance / faceWidth;
        const noseRatio = noseLength / faceHeight;

        let estimatedAge = 25;
        if (faceRatio > 1.5) estimatedAge += 5;
        if (eyeRatio < 0.2) estimatedAge += 3;
        if (noseRatio > 0.3) estimatedAge += 2;

        return Math.min(Math.max(estimatedAge, 18), 80);
    }

    private detectGender(landmarks: Point[]): string {
        const jawWidth = this.calculateDistance(landmarks[132], landmarks[361]);
        const foreheadHeight = this.calculateDistance(landmarks[10], landmarks[151]);
        const cheekboneWidth = this.calculateDistance(landmarks[123], landmarks[352]);

        const jawRatio = jawWidth / foreheadHeight;
        const cheekboneRatio = cheekboneWidth / jawWidth;

        if (jawRatio > 0.8 && cheekboneRatio < 1.2) {
            return 'male';
        } else if (jawRatio < 0.7 && cheekboneRatio > 1.3) {
            return 'female';
        }
        return 'other';
    }

    private detectGlasses(landmarks: Point[]): boolean {
        const leftEyePoints = landmarks.slice(33, 46);
        const rightEyePoints = landmarks.slice(263, 276);

        const leftEyeReflection = this.calculateAverageDistance(leftEyePoints);
        const rightEyeReflection = this.calculateAverageDistance(rightEyePoints);

        return (leftEyeReflection > 0.1 || rightEyeReflection > 0.1);
    }

    private detectFacialHair(landmarks: Point[]): boolean {
        const mouthArea = landmarks.slice(61, 68);
        const chinArea = landmarks.slice(152, 175);

        const mouthTexture = this.calculateAverageDistance(mouthArea);
        const chinTexture = this.calculateAverageDistance(chinArea);

        return (mouthTexture > 0.15 || chinTexture > 0.15);
    }

    async analyzeFace(imageData: string): Promise<FacialFeatures> {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            const image = new Image();
            image.src = imageData;
            await new Promise((resolve) => (image.onload = resolve));

            const results = await this.faceMesh!.send({ image });
            const landmarks = results.multiFaceLandmarks?.[0] as Point[];

            if (!landmarks) {
                throw new Error('Aucun visage détecté');
            }

            const emotions = this.calculateEmotions(landmarks);
            const symmetry = this.calculateSymmetry(landmarks);
            const age = this.estimateAge(landmarks);
            const gender = this.detectGender(landmarks);
            const glasses = this.detectGlasses(landmarks);
            const facialHair = this.detectFacialHair(landmarks);

            return {
                faceId: Math.random().toString(36).substring(7),
                landmarks: {
                    eyes: landmarks.slice(33, 46).map(p => ({ x: p.x, y: p.y })),
                    nose: landmarks.slice(1, 10).map(p => ({ x: p.x, y: p.y })),
                    mouth: landmarks.slice(61, 68).map(p => ({ x: p.x, y: p.y }))
                },
                emotions,
                attributes: {
                    age,
                    gender,
                    smile: emotions.happiness,
                    glasses,
                    facialHair
                }
            };
        } catch (error) {
            console.error('Erreur lors de l\'analyse faciale:', error);
            throw new Error('Erreur lors de l\'analyse faciale');
        }
    }

    async calculateCompatibility(
        user1Id: string,
        user2Id: string
    ): Promise<CompatibilityScore> {
        try {
            // Pour l'instant, nous utilisons des données simulées
            const psychologicalScore = 0.75;
            const facialScore = 0.8;

            const overallScore = (psychologicalScore + facialScore) / 2;

            return {
                overall: overallScore,
                facial: facialScore,
                psychological: psychologicalScore,
                details: {
                    facialFeatures: {
                        symmetry: 0.8,
                        expression: 0.7,
                        attractiveness: 0.75
                    },
                    personality: {
                        values: 0.8,
                        interests: 0.7,
                        communication: 0.75
                    }
                }
            };
        } catch (error) {
            console.error('Erreur lors du calcul de la compatibilité:', error);
            throw new Error('Erreur lors du calcul de la compatibilité');
        }
    }
}

export const facialAnalysisService = new FacialAnalysisService(); 