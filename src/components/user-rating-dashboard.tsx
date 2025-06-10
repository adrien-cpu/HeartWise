import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { userRatingService, UserRating, UserRatingStats } from '@/services/user_rating_service';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { SparklesIcon, ArrowTrendingUpIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

interface UserRatingDashboardProps {
    userId: string;
}

interface SentimentAnalysis {
    positive: number;
    neutral: number;
    negative: number;
}

interface AIRecommendation {
    category: string;
    suggestion: string;
    impact: 'high' | 'medium' | 'low';
}

export const UserRatingDashboard: React.FC<UserRatingDashboardProps> = ({ userId }) => {
    const { t } = useTranslation();
    const [stats, setStats] = useState<UserRatingStats | null>(null);
    const [recentRatings, setRecentRatings] = useState<UserRating[]>([]);
    const [sentimentAnalysis, setSentimentAnalysis] = useState<SentimentAnalysis>({
        positive: 0,
        neutral: 0,
        negative: 0,
    });
    const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadDashboardData();
    }, [userId]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [userStats, ratings] = await Promise.all([
                userRatingService.getUserRatingStats(userId),
                userRatingService.getUserRatings(userId, { limit: 50 }),
            ]);
            setStats(userStats);
            setRecentRatings(ratings);

            // Analyser le sentiment des commentaires
            const sentiment = analyzeSentiment(ratings);
            setSentimentAnalysis(sentiment);

            // Générer des recommandations
            const aiRecommendations = generateRecommendations(userStats, sentiment, ratings);
            setRecommendations(aiRecommendations);
        } catch (error) {
            setError(t('UserRatingDashboard.errorLoading'));
        } finally {
            setLoading(false);
        }
    };

    const analyzeSentiment = (ratings: UserRating[]): SentimentAnalysis => {
        // Logique simple d'analyse de sentiment basée sur les notes et les tags
        const sentiment = {
            positive: 0,
            neutral: 0,
            negative: 0,
        };

        ratings.forEach(rating => {
            if (rating.rating >= 4) {
                sentiment.positive++;
            } else if (rating.rating <= 2) {
                sentiment.negative++;
            } else {
                sentiment.neutral++;
            }
        });

        return sentiment;
    };

    const generateRecommendations = (
        stats: UserRatingStats,
        sentiment: SentimentAnalysis,
        ratings: UserRating[]
    ): AIRecommendation[] => {
        const recommendations: AIRecommendation[] = [];

        // Recommandations basées sur la note moyenne
        if (stats.averageRating < 4) {
            recommendations.push({
                category: 'Note globale',
                suggestion: t('UserRatingDashboard.recommendations.improveRating'),
                impact: 'high',
            });
        }

        // Recommandations basées sur les tags
        const tagFrequency = new Map<string, number>();
        ratings.forEach(rating => {
            rating.tags.forEach(tag => {
                tagFrequency.set(tag, (tagFrequency.get(tag) || 0) + 1);
            });
        });

        const leastFrequentTags = Array.from(tagFrequency.entries())
            .sort(([, a], [, b]) => a - b)
            .slice(0, 2);

        leastFrequentTags.forEach(([tag]) => {
            recommendations.push({
                category: 'Tags',
                suggestion: t('UserRatingDashboard.recommendations.improveTag', { tag }),
                impact: 'medium',
            });
        });

        // Recommandations basées sur le sentiment
        if (sentiment.negative > sentiment.positive) {
            recommendations.push({
                category: 'Sentiment',
                suggestion: t('UserRatingDashboard.recommendations.improveSentiment'),
                impact: 'high',
            });
        }

        return recommendations;
    };

    const ratingDistributionData = {
        labels: ['5 étoiles', '4 étoiles', '3 étoiles', '2 étoiles', '1 étoile'],
        datasets: [
            {
                label: t('UserRatingDashboard.ratingDistribution'),
                data: [
                    stats?.ratingDistribution[5] || 0,
                    stats?.ratingDistribution[4] || 0,
                    stats?.ratingDistribution[3] || 0,
                    stats?.ratingDistribution[2] || 0,
                    stats?.ratingDistribution[1] || 0,
                ],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(34, 197, 94, 0.6)',
                    'rgba(234, 179, 8, 0.6)',
                    'rgba(234, 179, 8, 0.4)',
                    'rgba(239, 68, 68, 0.6)',
                ],
            },
        ],
    };

    const sentimentData = {
        labels: [
            t('UserRatingDashboard.positive'),
            t('UserRatingDashboard.neutral'),
            t('UserRatingDashboard.negative'),
        ],
        datasets: [
            {
                data: [
                    sentimentAnalysis.positive,
                    sentimentAnalysis.neutral,
                    sentimentAnalysis.negative,
                ],
                backgroundColor: [
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(234, 179, 8, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                ],
            },
        ],
    };

    if (loading) {
        return <div className="animate-pulse">{t('UserRatingDashboard.loading')}</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="space-y-6">
            {/* En-tête avec statistiques principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">
                                {t('UserRatingDashboard.averageRating')}
                            </h3>
                            <p className="text-3xl font-bold">{stats?.averageRating.toFixed(1)}</p>
                        </div>
                        <SparklesIcon className="h-8 w-8 text-yellow-400" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">
                                {t('UserRatingDashboard.totalRatings')}
                            </h3>
                            <p className="text-3xl font-bold">{stats?.totalRatings}</p>
                        </div>
                        <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-400" />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">
                                {t('UserRatingDashboard.verifiedRatings')}
                            </h3>
                            <p className="text-3xl font-bold">{stats?.verifiedRatings}</p>
                        </div>
                        <ArrowTrendingUpIcon className="h-8 w-8 text-green-400" />
                    </div>
                </div>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">
                        {t('UserRatingDashboard.ratingDistribution')}
                    </h3>
                    <Bar
                        data={ratingDistributionData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    display: false,
                                },
                            },
                        }}
                    />
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">
                        {t('UserRatingDashboard.sentimentAnalysis')}
                    </h3>
                    <Doughnut
                        data={sentimentData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                },
                            },
                        }}
                    />
                </div>
            </div>

            {/* Recommandations IA */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">
                    {t('UserRatingDashboard.recommendations')}
                </h3>
                <div className="space-y-4">
                    {recommendations.map((recommendation, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-lg ${recommendation.impact === 'high'
                                    ? 'bg-red-50 border border-red-200'
                                    : recommendation.impact === 'medium'
                                        ? 'bg-yellow-50 border border-yellow-200'
                                        : 'bg-blue-50 border border-blue-200'
                                }`}
                        >
                            <div className="flex items-start">
                                <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">{recommendation.category}</h4>
                                    <p className="mt-1 text-gray-600">{recommendation.suggestion}</p>
                                </div>
                                <span
                                    className={`px-2 py-1 text-sm rounded-full ${recommendation.impact === 'high'
                                            ? 'bg-red-100 text-red-800'
                                            : recommendation.impact === 'medium'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : 'bg-blue-100 text-blue-800'
                                        }`}
                                >
                                    {t(`UserRatingDashboard.impact.${recommendation.impact}`)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tags les plus utilisés */}
            {stats?.commonTags && stats.commonTags.length > 0 && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">
                        {t('UserRatingDashboard.commonTags')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {stats.commonTags.map((tag) => (
                            <span
                                key={tag}
                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}; 