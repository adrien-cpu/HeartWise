'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Star, Image as ImageIcon, Tag } from 'lucide-react';
import { reviewService, Review, ReviewStats } from '@/services/review_service';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ReviewManagerProps {
    placeId: string;
    userId: string;
}

export function ReviewManager({ placeId, userId }: ReviewManagerProps) {
    const t = useTranslations('ReviewManager');
    const { toast } = useToast();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<ReviewStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [newReview, setNewReview] = useState({
        rating: 5,
        comment: '',
        tags: [] as string[],
        photos: [] as string[],
    });
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        loadReviews();
    }, [placeId]);

    const loadReviews = async () => {
        try {
            const [placeReviews, reviewStats] = await Promise.all([
                reviewService.getPlaceReviews(placeId),
                reviewService.getPlaceReviewStats(placeId),
            ]);
            setReviews(placeReviews);
            setStats(reviewStats);
        } catch (error) {
            toast({
                variant: "destructive",
                title: t('loadError'),
                description: t('loadErrorDescription'),
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRatingChange = (rating: number) => {
        setNewReview(prev => ({ ...prev, rating }));
    };

    const handleCommentChange = (comment: string) => {
        setNewReview(prev => ({ ...prev, comment }));
    };

    const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            if (!newReview.tags.includes(tagInput.trim())) {
                setNewReview(prev => ({
                    ...prev,
                    tags: [...prev.tags, tagInput.trim()],
                }));
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setNewReview(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove),
        }));
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        // TODO: Implémenter l'upload de photos
        toast({
            title: t('photoUploadNotImplemented'),
            description: t('photoUploadNotImplementedDescription'),
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await reviewService.createReview({
                placeId,
                userId,
                ...newReview,
            });

            await loadReviews();
            setNewReview({
                rating: 5,
                comment: '',
                tags: [],
                photos: [],
            });

            toast({
                title: t('submitSuccess'),
                description: t('submitSuccessDescription'),
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: t('submitError'),
                description: t('submitErrorDescription'),
            });
        }
    };

    if (loading) {
        return <div>{t('loading')}</div>;
    }

    return (
        <div className="space-y-6">
            {stats && (
                <Card>
                    <CardHeader>
                        <CardTitle>{t('statsTitle')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="text-4xl font-bold">
                                {stats.averageRating.toFixed(1)}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`h-5 w-5 ${star <= Math.round(stats.averageRating)
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {stats.totalReviews} {t('reviews')}
                                </p>
                            </div>
                        </div>
                        {stats.commonTags.length > 0 && (
                            <div className="mt-4">
                                <p className="text-sm font-medium mb-2">{t('commonTags')}</p>
                                <div className="flex flex-wrap gap-2">
                                    {stats.commonTags.map((tag) => (
                                        <Badge key={tag} variant="secondary">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>{t('writeReview')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label>{t('rating')}</Label>
                            <div className="flex items-center gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => handleRatingChange(star)}
                                        className="focus:outline-none"
                                    >
                                        <Star
                                            className={`h-6 w-6 ${star <= newReview.rating
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-gray-300'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="comment">{t('comment')}</Label>
                            <Textarea
                                id="comment"
                                value={newReview.comment}
                                onChange={(e) => handleCommentChange(e.target.value)}
                                className="mt-1"
                                rows={4}
                            />
                        </div>

                        <div>
                            <Label htmlFor="tags">{t('tags')}</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {newReview.tags.map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant="secondary"
                                        className="flex items-center gap-1"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="hover:text-destructive"
                                        >
                                            ×
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                            <Input
                                id="tags"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagInputKeyDown}
                                placeholder={t('addTag')}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label htmlFor="photos">{t('photos')}</Label>
                            <div className="mt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => document.getElementById('photos')?.click()}
                                >
                                    <ImageIcon className="h-4 w-4 mr-2" />
                                    {t('uploadPhotos')}
                                </Button>
                                <input
                                    id="photos"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        <Button type="submit" className="w-full">
                            {t('submit')}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-4">
                {reviews.map((review) => (
                    <Card key={review.id}>
                        <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`h-4 w-4 ${star <= review.rating
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="mt-2">{review.comment}</p>
                                    {review.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {review.tags.map((tag) => (
                                                <Badge key={tag} variant="secondary">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {format(review.createdAt, 'PPP', { locale: fr })}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
} 