import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp, orderBy, limit } from 'firebase/firestore';
import { UserRating } from './user_rating_service';

export interface RatingTrend {
    date: Date;
    averageRating: number;
    totalRatings: number;
}

export interface UserGoal {
    id: string;
    userId: string;
    type: 'rating' | 'tags' | 'sentiment';
    target: number;
    current: number;
    deadline: Date;
    status: 'active' | 'completed' | 'failed';
    createdAt: Date;
    updatedAt: Date;
}

export interface RatingComparison {
    userAverage: number;
    globalAverage: number;
    percentile: number;
    improvement: number;
}

class RatingAnalyticsService {
    private readonly RATINGS_COLLECTION = 'user_ratings';
    private readonly GOALS_COLLECTION = 'user_goals';

    async getRatingTrends(userId: string, period: 'week' | 'month' | 'year'): Promise<RatingTrend[]> {
        try {
            const now = new Date();
            const startDate = new Date();

            switch (period) {
                case 'week':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(now.getMonth() - 1);
                    break;
                case 'year':
                    startDate.setFullYear(now.getFullYear() - 1);
                    break;
            }

            const q = query(
                collection(db, this.RATINGS_COLLECTION),
                where('toUserId', '==', userId),
                where('createdAt', '>=', Timestamp.fromDate(startDate)),
                orderBy('createdAt', 'asc')
            );

            const querySnapshot = await getDocs(q);
            const ratings = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt.toDate(),
            })) as UserRating[];

            // Grouper les notes par jour
            const dailyRatings = new Map<string, { total: number; count: number }>();

            ratings.forEach(rating => {
                const date = rating.createdAt.toISOString().split('T')[0];
                const current = dailyRatings.get(date) || { total: 0, count: 0 };
                dailyRatings.set(date, {
                    total: current.total + rating.rating,
                    count: current.count + 1,
                });
            });

            // Convertir en tableau de tendances
            return Array.from(dailyRatings.entries()).map(([date, data]) => ({
                date: new Date(date),
                averageRating: data.total / data.count,
                totalRatings: data.count,
            }));
        } catch (error) {
            console.error('Erreur lors de la récupération des tendances:', error);
            throw new Error('Impossible de récupérer les tendances');
        }
    }

    async getRatingComparison(userId: string): Promise<RatingComparison> {
        try {
            // Récupérer la moyenne de l'utilisateur
            const userRatings = await this.getUserRatings(userId);
            const userAverage = userRatings.reduce((acc, rating) => acc + rating.rating, 0) / userRatings.length;

            // Récupérer la moyenne globale
            const allRatings = await this.getAllRatings();
            const globalAverage = allRatings.reduce((acc, rating) => acc + rating.rating, 0) / allRatings.length;

            // Calculer le percentile
            const sortedRatings = allRatings.map(r => r.rating).sort((a, b) => a - b);
            const userIndex = sortedRatings.findIndex(r => r >= userAverage);
            const percentile = (userIndex / sortedRatings.length) * 100;

            // Calculer l'amélioration
            const improvement = ((userAverage - globalAverage) / globalAverage) * 100;

            return {
                userAverage,
                globalAverage,
                percentile,
                improvement,
            };
        } catch (error) {
            console.error('Erreur lors de la comparaison des notes:', error);
            throw new Error('Impossible de comparer les notes');
        }
    }

    async createGoal(goal: Omit<UserGoal, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<UserGoal> {
        try {
            const goalData = {
                ...goal,
                status: 'active',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            };

            const docRef = await addDoc(collection(db, this.GOALS_COLLECTION), goalData);

            return {
                id: docRef.id,
                ...goalData,
                createdAt: goalData.createdAt.toDate(),
                updatedAt: goalData.updatedAt.toDate(),
            };
        } catch (error) {
            console.error('Erreur lors de la création de l\'objectif:', error);
            throw new Error('Impossible de créer l\'objectif');
        }
    }

    async getUserGoals(userId: string): Promise<UserGoal[]> {
        try {
            const q = query(
                collection(db, this.GOALS_COLLECTION),
                where('userId', '==', userId),
                orderBy('deadline', 'asc')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt.toDate(),
                updatedAt: doc.data().updatedAt.toDate(),
                deadline: doc.data().deadline.toDate(),
            })) as UserGoal[];
        } catch (error) {
            console.error('Erreur lors de la récupération des objectifs:', error);
            throw new Error('Impossible de récupérer les objectifs');
        }
    }

    async updateGoalProgress(goalId: string, current: number): Promise<void> {
        try {
            const docRef = doc(db, this.GOALS_COLLECTION, goalId);
            const goalDoc = await getDoc(docRef);

            if (!goalDoc.exists()) {
                throw new Error('Objectif non trouvé');
            }

            const goal = goalDoc.data() as UserGoal;
            const status = current >= goal.target ? 'completed' : 'active';

            await updateDoc(docRef, {
                current,
                status,
                updatedAt: Timestamp.now(),
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'objectif:', error);
            throw new Error('Impossible de mettre à jour l\'objectif');
        }
    }

    private async getUserRatings(userId: string): Promise<UserRating[]> {
        const q = query(
            collection(db, this.RATINGS_COLLECTION),
            where('toUserId', '==', userId)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate(),
            updatedAt: doc.data().updatedAt.toDate(),
        })) as UserRating[];
    }

    private async getAllRatings(): Promise<UserRating[]> {
        const q = query(collection(db, this.RATINGS_COLLECTION));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate(),
            updatedAt: doc.data().updatedAt.toDate(),
        })) as UserRating[];
    }
}

export const ratingAnalyticsService = new RatingAnalyticsService(); 