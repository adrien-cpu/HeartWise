import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, orderBy, Timestamp, limit } from 'firebase/firestore';

export interface UserRating {
    id: string;
    fromUserId: string;
    toUserId: string;
    rating: number;
    comment: string;
    tags: string[];
    verified: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserRatingStats {
    averageRating: number;
    totalRatings: number;
    ratingDistribution: {
        [key: number]: number;
    };
    commonTags: string[];
    verifiedRatings: number;
}

class UserRatingService {
    private readonly RATINGS_COLLECTION = 'user_ratings';

    async createRating(rating: Omit<UserRating, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserRating> {
        try {
            // Vérifier si l'utilisateur a déjà noté cet utilisateur
            const existingRating = await this.getUserRating(rating.fromUserId, rating.toUserId);
            if (existingRating) {
                throw new Error('Vous avez déjà noté cet utilisateur');
            }

            const ratingData = {
                ...rating,
                verified: false,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            };

            const docRef = await addDoc(collection(db, this.RATINGS_COLLECTION), ratingData);

            return {
                id: docRef.id,
                ...ratingData,
                createdAt: ratingData.createdAt.toDate(),
                updatedAt: ratingData.updatedAt.toDate(),
            };
        } catch (error) {
            console.error('Erreur lors de la création de la notation:', error);
            throw error;
        }
    }

    async getUserRating(fromUserId: string, toUserId: string): Promise<UserRating | null> {
        try {
            const q = query(
                collection(db, this.RATINGS_COLLECTION),
                where('fromUserId', '==', fromUserId),
                where('toUserId', '==', toUserId)
            );

            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                return null;
            }

            const doc = querySnapshot.docs[0];
            return {
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt.toDate(),
                updatedAt: doc.data().updatedAt.toDate(),
            } as UserRating;
        } catch (error) {
            console.error('Erreur lors de la récupération de la notation:', error);
            throw new Error('Impossible de récupérer la notation');
        }
    }

    async getUserRatings(userId: string, options: { limit?: number; verifiedOnly?: boolean } = {}): Promise<UserRating[]> {
        try {
            let q = query(
                collection(db, this.RATINGS_COLLECTION),
                where('toUserId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            if (options.verifiedOnly) {
                q = query(q, where('verified', '==', true));
            }

            if (options.limit) {
                q = query(q, limit(options.limit));
            }

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt.toDate(),
                updatedAt: doc.data().updatedAt.toDate(),
            })) as UserRating[];
        } catch (error) {
            console.error('Erreur lors de la récupération des notations:', error);
            throw new Error('Impossible de récupérer les notations');
        }
    }

    async updateRating(ratingId: string, updates: Partial<UserRating>): Promise<void> {
        try {
            const docRef = doc(db, this.RATINGS_COLLECTION, ratingId);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: Timestamp.now(),
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de la notation:', error);
            throw new Error('Impossible de mettre à jour la notation');
        }
    }

    async verifyRating(ratingId: string): Promise<void> {
        try {
            const docRef = doc(db, this.RATINGS_COLLECTION, ratingId);
            await updateDoc(docRef, {
                verified: true,
                updatedAt: Timestamp.now(),
            });
        } catch (error) {
            console.error('Erreur lors de la vérification de la notation:', error);
            throw new Error('Impossible de vérifier la notation');
        }
    }

    async getUserRatingStats(userId: string): Promise<UserRatingStats> {
        try {
            const ratings = await this.getUserRatings(userId);

            const totalRatings = ratings.length;
            const averageRating = ratings.reduce((acc, rating) => acc + rating.rating, 0) / totalRatings;

            const ratingDistribution = ratings.reduce((acc, rating) => {
                acc[rating.rating] = (acc[rating.rating] || 0) + 1;
                return acc;
            }, {} as { [key: number]: number });

            const tagCounts = ratings.reduce((acc, rating) => {
                rating.tags.forEach(tag => {
                    acc[tag] = (acc[tag] || 0) + 1;
                });
                return acc;
            }, {} as { [key: string]: number });

            const commonTags = Object.entries(tagCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([tag]) => tag);

            const verifiedRatings = ratings.filter(rating => rating.verified).length;

            return {
                averageRating,
                totalRatings,
                ratingDistribution,
                commonTags,
                verifiedRatings,
            };
        } catch (error) {
            console.error('Erreur lors du calcul des statistiques:', error);
            throw new Error('Impossible de calculer les statistiques');
        }
    }
}

export const userRatingService = new UserRatingService(); 