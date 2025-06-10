import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { userRatingService, UserRating, UserRatingStats } from '@/services/user_rating_service';
import { StarIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

interface UserRatingProps {
    userId: string;
    currentUserId: string;
    onRatingSubmit?: () => void;
}

export const UserRating: React.FC<UserRatingProps> = ({ userId, currentUserId, onRatingSubmit }) => {
    const { t } = useTranslation();
    const [ratings, setRatings] = useState<UserRating[]>([]);
    const [stats, setStats] = useState<UserRatingStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showRatingForm, setShowRatingForm] = useState(false);
    const [newRating, setNewRating] = useState({
        rating: 0,
        comment: '',
        tags: [] as string[],
    });

    const commonTags = [
        'Ponctuel',
        'Agréable',
        'Sincère',
        'Intéressant',
        'Respectueux',
        'Honnête',
        'Chaleureux',
        'Professionnel',
    ];

    useEffect(() => {
        loadRatings();
    }, [userId]);

    const loadRatings = async () => {
        try {
            setLoading(true);
            const [userRatings, userStats] = await Promise.all([
                userRatingService.getUserRatings(userId, { limit: 5, verifiedOnly: true }),
                userRatingService.getUserRatingStats(userId),
            ]);
            setRatings(userRatings);
            setStats(userStats);
        } catch (error) {
            setError(t('UserRating.errorLoading'));
        } finally {
            setLoading(false);
        }
    };

    const handleRatingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await userRatingService.createRating({
                fromUserId: currentUserId,
                toUserId: userId,
                rating: newRating.rating,
                comment: newRating.comment,
                tags: newRating.tags,
                verified: false,
            });
            setShowRatingForm(false);
            setNewRating({ rating: 0, comment: '', tags: [] });
            loadRatings();
            onRatingSubmit?.();
        } catch (error) {
            setError(t('UserRating.errorSubmitting'));
        }
    };

    const toggleTag = (tag: string) => {
        setNewRating(prev => ({
            ...prev,
            tags: prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag],
        }));
    };

    if (loading) {
        return <div className="animate-pulse">{t('UserRating.loading')}</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="space-y-6">
            {/* Statistiques */}
            {stats && (
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold">{t('UserRating.overallRating')}</h3>
                            <div className="flex items-center">
                                <span className="text-3xl font-bold">{stats.averageRating.toFixed(1)}</span>
                                <div className="ml-2 flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <StarIcon
                                            key={star}
                                            className={`h-5 w-5 ${star <= Math.round(stats.averageRating)
                                                ? 'text-yellow-400'
                                                : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">
                                {stats.totalRatings} {t('UserRating.totalRatings')}
                            </div>
                            <div className="text-sm text-gray-500">
                                {stats.verifiedRatings} {t('UserRating.verifiedRatings')}
                            </div>
                        </div>
                    </div>

                    {/* Distribution des notes */}
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                            <div key={rating} className="flex items-center">
                                <span className="w-8 text-sm text-gray-500">{rating}</span>
                                <div className="flex-1 h-2 mx-2 bg-gray-200 rounded-full">
                                    <div
                                        className="h-2 bg-yellow-400 rounded-full"
                                        style={{
                                            width: `${((stats.ratingDistribution[rating] || 0) / stats.totalRatings) * 100}%`,
                                        }}
                                    />
                                </div>
                                <span className="w-8 text-sm text-gray-500">
                                    {stats.ratingDistribution[rating] || 0}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Tags les plus courants */}
                    {stats.commonTags.length > 0 && (
                        <div className="mt-4">
                            <h4 className="text-sm font-medium text-gray-500 mb-2">
                                {t('UserRating.commonTags')}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {stats.commonTags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Liste des avis */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">{t('UserRating.recentReviews')}</h3>
                    {currentUserId !== userId && (
                        <button
                            onClick={() => setShowRatingForm(!showRatingForm)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            {showRatingForm ? t('UserRating.cancel') : t('UserRating.writeReview')}
                        </button>
                    )}
                </div>

                {showRatingForm && (
                    <form onSubmit={handleRatingSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('UserRating.yourRating')}
                            </label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setNewRating(prev => ({ ...prev, rating: star }))}
                                        className="focus:outline-none"
                                    >
                                        {star <= newRating.rating ? (
                                            <StarIcon className="h-8 w-8 text-yellow-400" />
                                        ) : (
                                            <StarOutlineIcon className="h-8 w-8 text-gray-300" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('UserRating.tags')}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {commonTags.map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => toggleTag(tag)}
                                        className={`px-3 py-1 rounded-full text-sm ${newRating.tags.includes(tag)
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('UserRating.comment')}
                            </label>
                            <textarea
                                value={newRating.comment}
                                onChange={(e) => setNewRating(prev => ({ ...prev, comment: e.target.value }))}
                                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder={t('UserRating.commentPlaceholder')}
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => setShowRatingForm(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                {t('UserRating.cancel')}
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                disabled={newRating.rating === 0}
                            >
                                {t('UserRating.submit')}
                            </button>
                        </div>
                    </form>
                )}

                <div className="space-y-4">
                    {ratings.map((rating) => (
                        <div key={rating.id} className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <StarIcon
                                                key={star}
                                                className={`h-5 w-5 ${star <= rating.rating ? 'text-yellow-400' : 'text-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    {rating.verified && (
                                        <CheckBadgeIcon className="h-5 w-5 text-blue-500 ml-2" />
                                    )}
                                </div>
                                <span className="text-sm text-gray-500">
                                    {new Date(rating.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            {rating.tags.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {rating.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <p className="mt-2 text-gray-700">{rating.comment}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}; 