import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, Timestamp, orderBy, limit } from 'firebase/firestore';
import { notificationService } from './notification_service';

export interface Challenge {
    id: string;
    title: string;
    description: string;
    type: 'daily' | 'weekly' | 'special' | 'premium';
    eventId?: string;
    points: number;
    requirements: string[];
    rewards: any;
    startDate: Date;
    endDate: Date;
    createdAt: Date;
}

export interface UserChallenge {
    id: string;
    userId: string;
    challengeId: string;
    progress: number;
    completed: boolean;
    completedAt?: Date;
    createdAt: Date;
}

class ChallengeService {
    private readonly CHALLENGES_COLLECTION = 'challenges';
    private readonly USER_CHALLENGES_COLLECTION = 'user_challenges';

    async createChallenge(challenge: Omit<Challenge, 'id'>): Promise<Challenge> {
        try {
            const docRef = await addDoc(collection(db, this.CHALLENGES_COLLECTION), {
                ...challenge,
                createdAt: Timestamp.now(),
                startDate: Timestamp.fromDate(challenge.startDate),
                endDate: Timestamp.fromDate(challenge.endDate),
            });

            return {
                id: docRef.id,
                ...challenge,
            };
        } catch (error) {
            console.error('Erreur lors de la création du défi:', error);
            throw new Error('Impossible de créer le défi');
        }
    }

    async getActiveChallenges(userId: string): Promise<Challenge[]> {
        try {
            const now = new Date();
            const q = query(
                collection(db, this.CHALLENGES_COLLECTION),
                where('endDate', '>=', Timestamp.fromDate(now)),
                orderBy('endDate', 'asc')
            );

            const querySnapshot = await getDocs(q);
            const challenges = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                startDate: doc.data().startDate.toDate(),
                endDate: doc.data().endDate.toDate(),
                createdAt: doc.data().createdAt.toDate(),
            })) as Challenge[];

            // Récupérer la progression de l'utilisateur pour chaque défi
            const userChallenges = await this.getUserChallenges(userId);
            return challenges.map(challenge => ({
                ...challenge,
                progress: userChallenges.find(uc => uc.challengeId === challenge.id)?.progress || 0,
            }));
        } catch (error) {
            console.error('Erreur lors de la récupération des défis actifs:', error);
            throw new Error('Impossible de récupérer les défis actifs');
        }
    }

    async getUserChallenges(userId: string): Promise<UserChallenge[]> {
        try {
            const q = query(
                collection(db, this.USER_CHALLENGES_COLLECTION),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                completedAt: doc.data().completedAt?.toDate(),
                createdAt: doc.data().createdAt.toDate(),
            })) as UserChallenge[];
        } catch (error) {
            console.error('Erreur lors de la récupération des défis de l\'utilisateur:', error);
            throw new Error('Impossible de récupérer les défis de l\'utilisateur');
        }
    }

    async updateChallengeProgress(userId: string, challengeId: string, progress: number): Promise<void> {
        try {
            const userChallengeRef = doc(db, this.USER_CHALLENGES_COLLECTION, `${userId}_${challengeId}`);
            const userChallengeDoc = await getDoc(userChallengeRef);

            if (!userChallengeDoc.exists()) {
                // Créer une nouvelle entrée si elle n'existe pas
                await addDoc(collection(db, this.USER_CHALLENGES_COLLECTION), {
                    userId,
                    challengeId,
                    progress,
                    completed: progress >= 100,
                    completedAt: progress >= 100 ? Timestamp.now() : null,
                    createdAt: Timestamp.now(),
                });
            } else {
                // Mettre à jour l'entrée existante
                const userChallenge = userChallengeDoc.data() as UserChallenge;
                const newProgress = Math.min(100, progress);
                const completed = newProgress >= 100 && !userChallenge.completed;

                await updateDoc(userChallengeRef, {
                    progress: newProgress,
                    completed,
                    completedAt: completed ? Timestamp.now() : userChallenge.completedAt,
                });

                if (completed) {
                    // Récupérer les informations du défi
                    const challengeDoc = await getDoc(doc(db, this.CHALLENGES_COLLECTION, challengeId));
                    const challenge = challengeDoc.data() as Challenge;

                    // Envoyer une notification
                    await notificationService.sendNotification(userId, {
                        title: 'Défi complété !',
                        body: `Vous avez complété le défi "${challenge.title}"`,
                        data: {
                            type: 'challenge_completed',
                            challengeId,
                        },
                    });

                    // Mettre à jour le score de l'utilisateur
                    await leaderboardService.updateUserScore(userId, challenge.points);
                }
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la progression:', error);
            throw new Error('Impossible de mettre à jour la progression');
        }
    }

    async getChallengeStats(userId: string): Promise<{
        total: number;
        completed: number;
        points: number;
        byType: Record<string, number>;
    }> {
        try {
            const userChallenges = await this.getUserChallenges(userId);
            const challenges = await this.getActiveChallenges(userId);

            const byType = challenges.reduce((acc, challenge) => {
                acc[challenge.type] = (acc[challenge.type] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const points = userChallenges.reduce((total, uc) => {
                const challenge = challenges.find(c => c.id === uc.challengeId);
                return total + (uc.completed ? (challenge?.points || 0) : 0);
            }, 0);

            return {
                total: challenges.length,
                completed: userChallenges.filter(uc => uc.completed).length,
                points,
                byType,
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            throw new Error('Impossible de récupérer les statistiques');
        }
    }
}

export const challengeService = new ChallengeService(); 