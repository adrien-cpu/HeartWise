import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';

export interface Review {
    id: string;
    placeId: string;
    userId: string;
    rating: number;
    comment: string;
    photos?: string[];
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface ReviewStats {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
        [key: number]: number;
    };
    commonTags: string[];
}

class ReviewService {
    private readonly REVIEWS_COLLECTION = 'reviews';

    async createReview(review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<Review> {
        try {
            const reviewData = {
                ...review,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            };

            const docRef = await addDoc(collection(db, this.REVIEWS_COLLECTION), reviewData);

            return {
                id: docRef.id,
                ...reviewData,
                createdAt: reviewData.createdAt.toDate(),
                updatedAt: reviewData.updatedAt.toDate(),
            };
        } catch (error) {
            console.error('Erreur lors de la création de l\'avis:', error);
            throw new Error('Impossible de créer l\'avis');
        }
    }

    async getPlaceReviews(placeId: string): Promise<Review[]> {
        try {
            const q = query(
                collection(db, this.REVIEWS_COLLECTION),
                where('placeId', '==', placeId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt.toDate(),
                updatedAt: doc.data().updatedAt.toDate(),
            })) as Review[];
        } catch (error) {
            console.error('Erreur lors de la récupération des avis:', error);
            throw new Error('Impossible de récupérer les avis');
        }
    }

    async getUserReviews(userId: string): Promise<Review[]> {
        try {
            const q = query(
                collection(db, this.REVIEWS_COLLECTION),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt.toDate(),
                updatedAt: doc.data().updatedAt.toDate(),
            })) as Review[];
        } catch (error) {
            console.error('Erreur lors de la récupération des avis:', error);
            throw new Error('Impossible de récupérer les avis');
        }
    }

    async updateReview(reviewId: string, updates: Partial<Review>): Promise<void> {
        try {
            const docRef = doc(db, this.REVIEWS_COLLECTION, reviewId);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: Timestamp.now(),
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'avis:', error);
            throw new Error('Impossible de mettre à jour l\'avis');
        }
    }

    async getPlaceReviewStats(placeId: string): Promise<ReviewStats> {
        try {
            const reviews = await this.getPlaceReviews(placeId);

            const totalReviews = reviews.length;
            const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews;

            const ratingDistribution = reviews.reduce((acc, review) => {
                acc[review.rating] = (acc[review.rating] || 0) + 1;
                return acc;
            }, {} as { [key: number]: number });

            const tagCounts = reviews.reduce((acc, review) => {
                review.tags.forEach(tag => {
                    acc[tag] = (acc[tag] || 0) + 1;
                });
                return acc;
            }, {} as { [key: string]: number });

            const commonTags = Object.entries(tagCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([tag]) => tag);

            return {
                averageRating,
                totalReviews,
                ratingDistribution,
                commonTags,
            };
        } catch (error) {
            console.error('Erreur lors du calcul des statistiques:', error);
            throw new Error('Impossible de calculer les statistiques');
        }
    }
}

export const reviewService = new ReviewService(); 