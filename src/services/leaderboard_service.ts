import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, Timestamp, orderBy, limit, getDoc } from 'firebase/firestore';
import { notificationService } from './notification_service';
import { challengeService } from './challenge_service';
import { achievementService } from './achievement_service';

export interface LeaderboardEntry {
    id: string;
    userId: string;
    username: string;
    avatarUrl: string;
    score: number;
    rank: number;
    streak: number;
    completedChallenges: number;
    specialAchievements: string[];
    lastUpdated: Date;
}

export interface SpecialEvent {
    id: string;
    title: string;
    description: string;
    type: 'holiday' | 'seasonal' | 'community' | 'premium';
    startDate: Date;
    endDate: Date;
    challenges: string[];
    rewards: {
        top1: any;
        top10: any;
        top100: any;
        participation: any;
    };
    participants: string[];
    leaderboard: LeaderboardEntry[];
}

class LeaderboardService {
    private readonly LEADERBOARD_COLLECTION = 'leaderboards';
    private readonly SPECIAL_EVENTS_COLLECTION = 'special_events';
    private readonly USER_STREAKS_COLLECTION = 'user_streaks';

    async getWeeklyLeaderboard(): Promise<LeaderboardEntry[]> {
        try {
            const now = new Date();
            const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));

            const q = query(
                collection(db, this.LEADERBOARD_COLLECTION),
                where('lastUpdated', '>=', Timestamp.fromDate(weekStart)),
                orderBy('lastUpdated', 'desc'),
                orderBy('score', 'desc'),
                limit(100)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map((doc, index) => ({
                id: doc.id,
                ...doc.data(),
                rank: index + 1,
                lastUpdated: doc.data().lastUpdated.toDate(),
            })) as LeaderboardEntry[];
        } catch (error) {
            console.error('Erreur lors de la récupération du classement:', error);
            throw new Error('Impossible de récupérer le classement');
        }
    }

    async getSpecialEvents(): Promise<SpecialEvent[]> {
        try {
            const now = new Date();
            const q = query(
                collection(db, this.SPECIAL_EVENTS_COLLECTION),
                where('endDate', '>=', Timestamp.fromDate(now)),
                orderBy('endDate', 'asc')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                startDate: doc.data().startDate.toDate(),
                endDate: doc.data().endDate.toDate(),
            })) as SpecialEvent[];
        } catch (error) {
            console.error('Erreur lors de la récupération des événements spéciaux:', error);
            throw new Error('Impossible de récupérer les événements spéciaux');
        }
    }

    async getUserRank(userId: string): Promise<LeaderboardEntry | null> {
        try {
            const q = query(
                collection(db, this.LEADERBOARD_COLLECTION),
                where('userId', '==', userId),
                orderBy('lastUpdated', 'desc'),
                limit(1)
            );

            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) return null;

            const entry = querySnapshot.docs[0];
            const allEntries = await this.getWeeklyLeaderboard();
            const rank = allEntries.findIndex(e => e.userId === userId) + 1;

            return {
                id: entry.id,
                ...entry.data(),
                rank,
                lastUpdated: entry.data().lastUpdated.toDate(),
            } as LeaderboardEntry;
        } catch (error) {
            console.error('Erreur lors de la récupération du rang:', error);
            throw new Error('Impossible de récupérer le rang');
        }
    }

    async updateUserScore(userId: string, points: number): Promise<void> {
        try {
            const userRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userRef);
            const userData = userDoc.data();

            const entry: Omit<LeaderboardEntry, 'id'> = {
                userId,
                username: userData.username,
                avatarUrl: userData.avatarUrl,
                score: points,
                rank: 0, // Sera mis à jour lors de la récupération
                streak: await this.getUserStreak(userId),
                completedChallenges: await this.getCompletedChallengesCount(userId),
                specialAchievements: await this.getSpecialAchievements(userId),
                lastUpdated: new Date(),
            };

            await addDoc(collection(db, this.LEADERBOARD_COLLECTION), entry);

            // Vérifier les récompenses de classement
            const rank = await this.getUserRank(userId);
            if (rank) {
                await this.checkRankRewards(userId, rank.rank);
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du score:', error);
            throw new Error('Impossible de mettre à jour le score');
        }
    }

    async createSpecialEvent(event: Omit<SpecialEvent, 'id' | 'participants' | 'leaderboard'>): Promise<SpecialEvent> {
        try {
            const eventData = {
                ...event,
                participants: [],
                leaderboard: [],
                createdAt: Timestamp.now(),
            };

            const docRef = await addDoc(collection(db, this.SPECIAL_EVENTS_COLLECTION), eventData);

            // Créer les défis spéciaux
            for (const challengeId of event.challenges) {
                await challengeService.createChallenge({
                    id: challengeId,
                    title: `Défi spécial: ${event.title}`,
                    description: `Défi spécial pour l'événement ${event.title}`,
                    type: 'special',
                    eventId: docRef.id,
                    points: 100,
                    requirements: [],
                    rewards: event.rewards.participation,
                    startDate: event.startDate,
                    endDate: event.endDate,
                    createdAt: new Date(),
                });
            }

            return {
                id: docRef.id,
                ...eventData,
                startDate: eventData.startDate,
                endDate: eventData.endDate,
            } as SpecialEvent;
        } catch (error) {
            console.error('Erreur lors de la création de l\'événement:', error);
            throw new Error('Impossible de créer l\'événement');
        }
    }

    async joinSpecialEvent(userId: string, eventId: string): Promise<void> {
        try {
            const eventRef = doc(db, this.SPECIAL_EVENTS_COLLECTION, eventId);
            const eventDoc = await getDoc(eventRef);

            if (!eventDoc.exists()) {
                throw new Error('Événement non trouvé');
            }

            const event = eventDoc.data() as SpecialEvent;
            if (event.participants.includes(userId)) {
                throw new Error('Vous participez déjà à cet événement');
            }

            await updateDoc(eventRef, {
                participants: [...event.participants, userId],
            });

            // Ajouter l'utilisateur au classement
            const userDoc = await getDoc(doc(db, 'users', userId));
            const userData = userDoc.data();

            const entry: LeaderboardEntry = {
                id: '',
                userId,
                username: userData.username,
                avatarUrl: userData.avatarUrl,
                score: 0,
                rank: event.participants.length + 1,
                streak: 0,
                completedChallenges: 0,
                specialAchievements: [],
                lastUpdated: new Date(),
            };

            await updateDoc(eventRef, {
                leaderboard: [...event.leaderboard, entry],
            });

            // Envoyer une notification
            await notificationService.sendNotification(userId, {
                title: 'Nouvel événement spécial !',
                body: `Vous avez rejoint l'événement "${event.title}"`,
                data: {
                    type: 'special_event_joined',
                    eventId,
                },
            });
        } catch (error) {
            console.error('Erreur lors de la participation à l\'événement:', error);
            throw new Error('Impossible de participer à l\'événement');
        }
    }

    private async getUserStreak(userId: string): Promise<number> {
        try {
            const q = query(
                collection(db, this.USER_STREAKS_COLLECTION),
                where('userId', '==', userId),
                orderBy('lastUpdated', 'desc'),
                limit(1)
            );

            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) return 0;

            return querySnapshot.docs[0].data().streak;
        } catch (error) {
            console.error('Erreur lors de la récupération de la série:', error);
            return 0;
        }
    }

    private async getCompletedChallengesCount(userId: string): Promise<number> {
        try {
            const q = query(
                collection(db, 'user_challenges'),
                where('userId', '==', userId),
                where('completed', '==', true)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.size;
        } catch (error) {
            console.error('Erreur lors du comptage des défis complétés:', error);
            return 0;
        }
    }

    private async getSpecialAchievements(userId: string): Promise<string[]> {
        try {
            const q = query(
                collection(db, 'achievements'),
                where('userId', '==', userId),
                where('type', 'in', ['special_event', 'top_rank', 'streak_milestone'])
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => doc.data().title);
        } catch (error) {
            console.error('Erreur lors de la récupération des accomplissements spéciaux:', error);
            return [];
        }
    }

    private async checkRankRewards(userId: string, rank: number): Promise<void> {
        try {
            if (rank === 1) {
                await achievementService.createAchievement({
                    userId,
                    type: 'top_rank',
                    title: 'Champion',
                    description: 'Atteint la première place du classement',
                    icon: 'trophy',
                    progress: 100,
                    completed: true,
                    unlockedAt: new Date(),
                    createdAt: new Date(),
                });

                await notificationService.sendNotification(userId, {
                    title: 'Félicitations !',
                    body: 'Vous êtes numéro 1 du classement cette semaine !',
                    data: {
                        type: 'top_rank',
                    },
                });
            }
        } catch (error) {
            console.error('Erreur lors de la vérification des récompenses:', error);
        }
    }
}

export const leaderboardService = new LeaderboardService(); 