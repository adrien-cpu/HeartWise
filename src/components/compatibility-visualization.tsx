'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CompatibilityScore } from '@/services/facialAnalysis';

interface CompatibilityVisualizationProps {
    score: CompatibilityScore;
    user1Name: string;
    user2Name: string;
}

export function CompatibilityVisualization({
    score,
    user1Name,
    user2Name
}: CompatibilityVisualizationProps) {
    const t = useTranslations('Compatibility');

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>
                    {t('title', { user1: user1Name, user2: user2Name })}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span>{t('overall')}</span>
                        <span>{Math.round(score.overall * 100)}%</span>
                    </div>
                    <Progress value={score.overall * 100} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-semibold mb-2">{t('facial.title')}</h3>
                        <div className="space-y-2">
                            <div>
                                <div className="flex justify-between text-sm">
                                    <span>{t('facial.symmetry')}</span>
                                    <span>{Math.round(score.details.facialFeatures.symmetry * 100)}%</span>
                                </div>
                                <Progress value={score.details.facialFeatures.symmetry * 100} />
                            </div>
                            <div>
                                <div className="flex justify-between text-sm">
                                    <span>{t('facial.expression')}</span>
                                    <span>{Math.round(score.details.facialFeatures.expression * 100)}%</span>
                                </div>
                                <Progress value={score.details.facialFeatures.expression * 100} />
                            </div>
                            <div>
                                <div className="flex justify-between text-sm">
                                    <span>{t('facial.attractiveness')}</span>
                                    <span>{Math.round(score.details.facialFeatures.attractiveness * 100)}%</span>
                                </div>
                                <Progress value={score.details.facialFeatures.attractiveness * 100} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">{t('personality.title')}</h3>
                        <div className="space-y-2">
                            <div>
                                <div className="flex justify-between text-sm">
                                    <span>{t('personality.values')}</span>
                                    <span>{Math.round(score.details.personality.values * 100)}%</span>
                                </div>
                                <Progress value={score.details.personality.values * 100} />
                            </div>
                            <div>
                                <div className="flex justify-between text-sm">
                                    <span>{t('personality.interests')}</span>
                                    <span>{Math.round(score.details.personality.interests * 100)}%</span>
                                </div>
                                <Progress value={score.details.personality.interests * 100} />
                            </div>
                            <div>
                                <div className="flex justify-between text-sm">
                                    <span>{t('personality.communication')}</span>
                                    <span>{Math.round(score.details.personality.communication * 100)}%</span>
                                </div>
                                <Progress value={score.details.personality.communication * 100} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 p-4 bg-muted rounded-lg">
                    <h3 className="font-semibold mb-2">{t('insights.title')}</h3>
                    <p className="text-sm text-muted-foreground">
                        {score.overall > 0.8
                            ? t('insights.high')
                            : score.overall > 0.6
                                ? t('insights.medium')
                                : t('insights.low')}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
} 