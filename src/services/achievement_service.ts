import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, Timestamp, orderBy } from 'firebase/firestore';
import { UserRating } from './user_rating_service';
import { notificationService } from './notification_service';

export interface Achievement {
    id: string;
    userId: string;
    type: 'special_event' | 'top_rank' | 'streak_milestone' | 'challenge' | 'social';
    title: string;
    description: string;
    icon: string;
    progress: number;
    completed: boolean;
    unlockedAt: Date;
    createdAt: Date;
}

export interface Recommendation {
    id: string;
    userId: string;
    type: RecommendationType;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    actionUrl?: string;
    createdAt: Date;
}

export type AchievementType =
    | 'rating_milestone' // Atteindre une note moyenne spécifique
    | 'rating_count' // Nombre total de notes reçues
    | 'positive_feedback' // Pourcentage de retours positifs
    | 'profile_completion' // Compléter son profil
    | 'active_user' // Utilisation régulière
    | 'social_butterfly' // Nombre de connexions
    | 'early_adopter' // Inscription précoce
    | 'feedback_provider' // Donner des retours aux autres
    | 'profile_views' // Nombre de vues du profil
    | 'match_maker'; // Nombre de matchs réussis

export type RecommendationType =
    | 'profile_improvement' // Suggestions d'amélioration du profil
    | 'photo_quality' // Qualité des photos
    | 'response_time' // Temps de réponse
    | 'message_quality' // Qualité des messages
    | 'activity_suggestion' // Suggestions d'activités
    | 'match_opportunity' // Opportunités de match
    | 'social_engagement' // Engagement social
    | 'profile_visibility' // Visibilité du profil
    | 'premium_features' // Fonctionnalités premium
    | 'safety_tips'; // Conseils de sécurité

class AchievementService {
    private readonly ACHIEVEMENTS_COLLECTION = 'achievements';
    private readonly RECOMMENDATIONS_COLLECTION = 'recommendations';

    async createAchievement(achievement: Omit<Achievement, 'id'>): Promise<Achievement> {
        try {
            const docRef = await addDoc(collection(db, this.ACHIEVEMENTS_COLLECTION), {
                ...achievement,
                createdAt: Timestamp.now(),
                unlockedAt: achievement.unlockedAt ? Timestamp.fromDate(achievement.unlockedAt) : null,
            });

            return {
                id: docRef.id,
                ...achievement,
            };
        } catch (error) {
            console.error('Erreur lors de la création de l\'accomplissement:', error);
            throw new Error('Impossible de créer l\'accomplissement');
        }
    }

    async getUserAchievements(userId: string): Promise<Achievement[]> {
        try {
            const q = query(
                collection(db, this.ACHIEVEMENTS_COLLECTION),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                unlockedAt: doc.data().unlockedAt?.toDate(),
                createdAt: doc.data().createdAt.toDate(),
            })) as Achievement[];
        } catch (error) {
            console.error('Erreur lors de la récupération des accomplissements:', error);
            throw new Error('Impossible de récupérer les accomplissements');
        }
    }

    async getUserRecommendations(userId: string): Promise<Recommendation[]> {
        try {
            const q = query(
                collection(db, this.RECOMMENDATIONS_COLLECTION),
                where('userId', '==', userId),
                where('createdAt', '>=', Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))) // Dernière semaine
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt.toDate(),
            })) as Recommendation[];
        } catch (error) {
            console.error('Erreur lors de la récupération des recommandations:', error);
            throw new Error('Impossible de récupérer les recommandations');
        }
    }

    async generateRecommendations(userId: string): Promise<void> {
        try {
            // Récupérer les données de l'utilisateur
            const userRatings = await this.getUserRatings(userId);
            const userProfile = await this.getUserProfile(userId);
            const userActivity = await this.getUserActivity(userId);

            const recommendations: Omit<Recommendation, 'id'>[] = [];

            // Analyser le profil
            if (userProfile.completionRate < 0.8) {
                recommendations.push({
                    userId,
                    type: 'profile_improvement',
                    title: 'Complétez votre profil',
                    description: 'Ajoutez plus d\'informations pour augmenter vos chances de match',
                    priority: 'high',
                    actionUrl: '/profile/edit',
                    createdAt: new Date(),
                });
            }

            // Analyser les photos
            if (userProfile.photoCount < 3) {
                recommendations.push({
                    userId,
                    type: 'photo_quality',
                    title: 'Ajoutez plus de photos',
                    description: 'Les profils avec plus de photos reçoivent plus de matchs',
                    priority: 'medium',
                    actionUrl: '/profile/photos',
                    createdAt: new Date(),
                });
            }

            // Analyser l'activité
            if (userActivity.lastActive > 7 * 24 * 60 * 60 * 1000) { // 7 jours
                recommendations.push({
                    userId,
                    type: 'activity_suggestion',
                    title: 'Restez actif',
                    description: 'Connectez-vous régulièrement pour augmenter votre visibilité',
                    priority: 'high',
                    createdAt: new Date(),
                });
            }

            // Analyser les messages
            if (userActivity.averageResponseTime > 24 * 60 * 60 * 1000) { // 24 heures
                recommendations.push({
                    userId,
                    type: 'response_time',
                    title: 'Répondez plus rapidement',
                    description: 'Les réponses rapides augmentent vos chances de match',
                    priority: 'medium',
                    createdAt: new Date(),
                });
            }

            // Sauvegarder les recommandations
            for (const recommendation of recommendations) {
                await addDoc(collection(db, this.RECOMMENDATIONS_COLLECTION), recommendation);
            }
        } catch (error) {
            console.error('Erreur lors de la génération des recommandations:', error);
            throw new Error('Impossible de générer les recommandations');
        }
    }

    async checkAndUpdateAchievements(userId: string): Promise<void> {
        try {
            const userRatings = await this.getUserRatings(userId);
            const userProfile = await this.getUserProfile(userId);
            const userActivity = await this.getUserActivity(userId);

            const achievements: Omit<Achievement, 'id'>[] = [];

            // Vérifier les jalons de notes
            const averageRating = userRatings.reduce((acc, r) => acc + r.rating, 0) / userRatings.length;
            if (averageRating >= 4.5) {
                achievements.push({
                    userId,
                    type: 'rating_milestone',
                    title: 'Expert en Relations',
                    description: 'Atteint une note moyenne de 4.5/5',
                    icon: 'star',
                    progress: 100,
                    completed: true,
                    unlockedAt: new Date(),
                    createdAt: new Date(),
                });
            }

            // Vérifier le nombre de notes
            if (userRatings.length >= 50) {
                achievements.push({
                    userId,
                    type: 'rating_count',
                    title: 'Populaire',
                    description: 'Reçu 50 notes ou plus',
                    icon: 'users',
                    progress: 100,
                    completed: true,
                    unlockedAt: new Date(),
                    createdAt: new Date(),
                });
            }

            // Vérifier l'activité
            if (userActivity.consecutiveDays >= 30) {
                achievements.push({
                    userId,
                    type: 'active_user',
                    title: 'Fidèle',
                    description: 'Connecté pendant 30 jours consécutifs',
                    icon: 'calendar',
                    progress: 100,
                    completed: true,
                    unlockedAt: new Date(),
                    createdAt: new Date(),
                });
            }

            // Sauvegarder les badges
            for (const achievement of achievements) {
                await addDoc(collection(db, this.ACHIEVEMENTS_COLLECTION), achievement);
            }
        } catch (error) {
            console.error('Erreur lors de la vérification des badges:', error);
            throw new Error('Impossible de vérifier les badges');
        }
    }

    private async getUserRatings(userId: string): Promise<UserRating[]> {
        const q = query(
            collection(db, 'user_ratings'),
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

    private async getUserProfile(userId: string): Promise<any> {
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        return docSnap.data();
    }

    private async getUserActivity(userId: string): Promise<any> {
        const q = query(
            collection(db, 'user_activity'),
            where('userId', '==', userId),
            orderBy('timestamp', 'desc'),
            limit(1)
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs[0]?.data();
    }

    async updateAchievementProgress(achievementId: string, progress: number): Promise<void> {
        try {
            const achievementRef = doc(db, this.ACHIEVEMENTS_COLLECTION, achievementId);
            const achievementDoc = await getDoc(achievementRef);

            if (!achievementDoc.exists()) {
                throw new Error('Accomplissement non trouvé');
            }

            const achievement = achievementDoc.data() as Achievement;
            const newProgress = Math.min(100, progress);
            const completed = newProgress >= 100 && !achievement.completed;

            await updateDoc(achievementRef, {
                progress: newProgress,
                completed,
                unlockedAt: completed ? Timestamp.now() : achievement.unlockedAt,
            });

            if (completed) {
                await notificationService.sendNotification(achievement.userId, {
                    title: 'Nouvel accomplissement !',
                    body: `Vous avez débloqué "${achievement.title}"`,
                    data: {
                        type: 'achievement_unlocked',
                        achievementId,
                    },
                });
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la progression:', error);
            throw new Error('Impossible de mettre à jour la progression');
        }
    }

    async getAchievementStats(userId: string): Promise<{
        total: number;
        completed: number;
        byType: Record<string, number>;
    }> {
        try {
            const achievements = await this.getUserAchievements(userId);
            const byType = achievements.reduce((acc, achievement) => {
                acc[achievement.type] = (acc[achievement.type] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            return {
                total: achievements.length,
                completed: achievements.filter(a => a.completed).length,
                byType,
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            throw new Error('Impossible de récupérer les statistiques');
        }
    }
}

export const achievementService = new AchievementService(); 