'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, MapPin, Users } from 'lucide-react';
import { bookingService, Booking } from '@/services/booking_service';
import { useToast } from '@/hooks/use-toast';

interface BookingManagerProps {
    userId: string;
    placeId?: string;
}

export function BookingManager({ userId, placeId }: BookingManagerProps) {
    const t = useTranslations('BookingManager');
    const { toast } = useToast();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [loading, setLoading] = useState(true);

    const loadBookings = useCallback(async () => {
        try {
            const userBookings = await bookingService.getUserBookings(userId);
            setBookings(userBookings);
        } catch (error) {
            toast({
                variant: "destructive",
                title: t('loadError'),
                description: t('loadErrorDescription'),
            });
        } finally {
            setLoading(false);
        }
    }, [userId, toast, t]);

    useEffect(() => {
        loadBookings();
    }, [loadBookings]);

    const handleDateSelect = async (date: Date | undefined) => {
        setSelectedDate(date);
        if (date && placeId) {
            const isAvailable = await bookingService.checkAvailability(
                placeId,
                date,
                new Date(date.getTime() + 60 * 60 * 1000) // +1 heure
            );

            if (!isAvailable) {
                toast({
                    title: t('unavailableDate'),
                    description: t('unavailableDateDescription'),
                    variant: "destructive",
                });
            }
        }
    };

    const handleBookingCancel = async (bookingId: string) => {
        try {
            await bookingService.updateBookingStatus(bookingId, 'cancelled');
            await loadBookings();
            toast({
                title: t('cancelSuccess'),
                description: t('cancelSuccessDescription'),
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: t('cancelError'),
                description: t('cancelErrorDescription'),
            });
        }
    };

    const getStatusBadge = (status: Booking['status']) => {
        const statusConfig = {
            pending: { variant: 'warning', label: t('statusPending') },
            confirmed: { variant: 'success', label: t('statusConfirmed') },
            cancelled: { variant: 'destructive', label: t('statusCancelled') },
        };

        const config = statusConfig[status];
        return (
            <Badge variant={config.variant as any}>
                {config.label}
            </Badge>
        );
    };

    if (loading) {
        return <div>{t('loading')}</div>;
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>{t('title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-1/2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedDate ? (
                                        format(selectedDate, 'PPP', { locale: fr })
                                    ) : (
                                        <span>{t('pickDate')}</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={handleDateSelect}
                                    locale={fr}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className="space-y-4">
                    {bookings.length === 0 ? (
                        <p className="text-muted-foreground text-center">{t('noBookings')}</p>
                    ) : (
                        bookings.map((booking) => (
                            <Card key={booking.id} className="p-4">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            <span>
                                                {format(booking.startTime, 'HH:mm')} - {format(booking.endTime, 'HH:mm')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            <span>{booking.placeId}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            <span>{booking.participants.length} {t('participants')}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {getStatusBadge(booking.status)}
                                        {booking.status === 'pending' && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleBookingCancel(booking.id)}
                                            >
                                                {t('cancel')}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 