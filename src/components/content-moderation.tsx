'use client';

import { useTranslations } from 'next-intl';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { ModerationResult } from '@/services/moderation_service';

interface ContentModerationProps {
    result: ModerationResult;
    onApprove?: () => void;
    onReject?: () => void;
    onEdit?: () => void;
}

export function ContentModeration({
    result,
    onApprove,
    onReject,
    onEdit
}: ContentModerationProps) {
    const t = useTranslations('ContentModeration');

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {result.isApproved ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    {result.isApproved ? t('approved') : t('rejected')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {result.violations.length > 0 && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{t('violations')}</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc pl-4 mt-2">
                                {result.violations.map((violation, index) => (
                                    <li key={index}>{violation}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                {result.suggestions && result.suggestions.length > 0 && (
                    <Alert>
                        <AlertTitle>{t('suggestions')}</AlertTitle>
                        <AlertDescription>
                            <ul className="list-disc pl-4 mt-2">
                                {result.suggestions.map((suggestion, index) => (
                                    <li key={index}>{suggestion}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                        {t('confidence', { value: Math.round(result.confidence * 100) })}
                    </div>
                    <div className="flex gap-2">
                        {onEdit && (
                            <Button variant="outline" onClick={onEdit}>
                                {t('edit')}
                            </Button>
                        )}
                        {onReject && !result.isApproved && (
                            <Button variant="destructive" onClick={onReject}>
                                {t('reject')}
                            </Button>
                        )}
                        {onApprove && result.isApproved && (
                            <Button variant="default" onClick={onApprove}>
                                {t('approve')}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 