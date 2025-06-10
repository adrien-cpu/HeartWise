import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ratingModerationService, RatingReport, ModerationAction } from '@/services/rating_moderation_service';
import { userRatingService, UserRating } from '@/services/user_rating_service';
import { ShieldCheckIcon, ShieldExclamationIcon, PencilIcon } from '@heroicons/react/24/outline';

interface RatingModerationProps {
    moderatorId: string;
}

export const RatingModeration: React.FC<RatingModerationProps> = ({ moderatorId }) => {
    const { t } = useTranslation();
    const [reports, setReports] = useState<RatingReport[]>([]);
    const [stats, setStats] = useState<{
        totalReports: number;
        pendingReports: number;
        resolvedReports: number;
        averageResolutionTime: number;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedReport, setSelectedReport] = useState<RatingReport | null>(null);
    const [ratingDetails, setRatingDetails] = useState<UserRating | null>(null);

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        try {
            setLoading(true);
            const [pendingReports, reportStats] = await Promise.all([
                ratingModerationService.getPendingReports(),
                ratingModerationService.getReportStats(),
            ]);
            setReports(pendingReports);
            setStats(reportStats);
        } catch (error) {
            setError(t('RatingModeration.errorLoading'));
        } finally {
            setLoading(false);
        }
    };

    const handleReportSelect = async (report: RatingReport) => {
        setSelectedReport(report);
        try {
            const rating = await userRatingService.getUserRating(report.ratingId, report.reporterId);
            setRatingDetails(rating);
        } catch (error) {
            console.error('Erreur lors du chargement des détails:', error);
        }
    };

    const handleModerationAction = async (action: 'approve' | 'reject' | 'edit', changes?: ModerationAction['changes']) => {
        if (!selectedReport) return;

        try {
            await ratingModerationService.takeModerationAction({
                ratingId: selectedReport.ratingId,
                moderatorId,
                action,
                reason: `Action prise par le modérateur: ${action}`,
                changes,
            });

            // Recharger les rapports
            await loadReports();
            setSelectedReport(null);
            setRatingDetails(null);
        } catch (error) {
            setError(t('RatingModeration.errorAction'));
        }
    };

    if (loading) {
        return <div className="animate-pulse">{t('RatingModeration.loading')}</div>;
    }

    if (error) {
        return <div className="text-red-500">{error}</div>;
    }

    return (
        <div className="space-y-6">
            {/* Statistiques */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="text-sm font-medium text-gray-500">{t('RatingModeration.totalReports')}</h3>
                        <p className="text-2xl font-bold">{stats.totalReports}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="text-sm font-medium text-gray-500">{t('RatingModeration.pendingReports')}</h3>
                        <p className="text-2xl font-bold text-yellow-600">{stats.pendingReports}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="text-sm font-medium text-gray-500">{t('RatingModeration.resolvedReports')}</h3>
                        <p className="text-2xl font-bold text-green-600">{stats.resolvedReports}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <h3 className="text-sm font-medium text-gray-500">{t('RatingModeration.avgResolutionTime')}</h3>
                        <p className="text-2xl font-bold">
                            {Math.round(stats.averageResolutionTime / (1000 * 60))} {t('RatingModeration.minutes')}
                        </p>
                    </div>
                </div>
            )}

            {/* Liste des signalements */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b">
                    <h2 className="text-lg font-semibold">{t('RatingModeration.pendingReports')}</h2>
                </div>
                <div className="divide-y">
                    {reports.map((report) => (
                        <div
                            key={report.id}
                            className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedReport?.id === report.id ? 'bg-blue-50' : ''
                                }`}
                            onClick={() => handleReportSelect(report)}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">{report.reason}</p>
                                    <p className="text-sm text-gray-500">{report.details}</p>
                                </div>
                                <span className="text-sm text-gray-500">
                                    {new Date(report.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Détails du signalement */}
            {selectedReport && ratingDetails && (
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-lg font-semibold">{t('RatingModeration.reportDetails')}</h3>
                            <p className="text-sm text-gray-500">
                                {t('RatingModeration.reportedOn')} {new Date(selectedReport.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleModerationAction('approve')}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                            >
                                <ShieldCheckIcon className="h-5 w-5" />
                                {t('RatingModeration.approve')}
                            </button>
                            <button
                                onClick={() => handleModerationAction('reject')}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                            >
                                <ShieldExclamationIcon className="h-5 w-5" />
                                {t('RatingModeration.reject')}
                            </button>
                            <button
                                onClick={() => handleModerationAction('edit')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            >
                                <PencilIcon className="h-5 w-5" />
                                {t('RatingModeration.edit')}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h4 className="font-medium">{t('RatingModeration.reportReason')}</h4>
                            <p className="text-gray-700">{selectedReport.reason}</p>
                        </div>

                        <div>
                            <h4 className="font-medium">{t('RatingModeration.reportDetails')}</h4>
                            <p className="text-gray-700">{selectedReport.details}</p>
                        </div>

                        <div>
                            <h4 className="font-medium">{t('RatingModeration.ratingContent')}</h4>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-gray-700">{ratingDetails.comment}</p>
                                {ratingDetails.tags.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {ratingDetails.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}; 