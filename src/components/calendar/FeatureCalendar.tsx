"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { useTranslations } from 'next-intl';
import { Link } from 'next-intl';
import { format, isSameDay, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  CalendarDays, 
  Clock, 
  Users, 
  Zap, 
  Gamepad2, 
  MessageCircle,
  MapPin,
  ScanFace,
  EyeOff,
  Trophy,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  duration: string;
  type: 'speed-dating' | 'game-session' | 'local-meetup' | 'ai-feature' | 'special-event';
  icon: React.ReactNode;
  gradient: string;
  maxParticipants?: number;
  currentParticipants?: number;
  interests?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
  href: string;
  canJoin: boolean;
}

export function FeatureCalendar() {
  const t = useTranslations('Calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');

  // Générer des événements d'exemple
  useEffect(() => {
    const generateEvents = () => {
      const today = new Date();
      const mockEvents: CalendarEvent[] = [
        {
          id: 'sd1',
          title: 'Speed Dating - Tech Lovers',
          description: 'Session rapide pour les passionnés de technologie',
          date: addDays(today, 1),
          time: '19:00',
          duration: '1h30',
          type: 'speed-dating',
          icon: <Zap className="w-4 h-4" />,
          gradient: 'from-yellow-500 to-orange-500',
          maxParticipants: 12,
          currentParticipants: 8,
          interests: ['Tech', 'Innovation', 'Gaming'],
          href: '/speed-dating',
          canJoin: true
        },
        {
          id: 'game1',
          title: 'Quiz Culture Générale',
          description: 'Défi de connaissances générales',
          date: addDays(today, 2),
          time: '20:30',
          duration: '45min',
          type: 'game-session',
          icon: <Gamepad2 className="w-4 h-4" />,
          gradient: 'from-indigo-500 to-purple-500',
          difficulty: 'medium',
          href: '/game',
          canJoin: true
        },
        {
          id: 'meetup1',
          title: 'Café Rencontre - Centre Ville',
          description: 'Rencontre informelle dans un café branché',
          date: addDays(today, 3),
          time: '15:00',
          duration: '2h',
          type: 'local-meetup',
          icon: <MapPin className="w-4 h-4" />,
          gradient: 'from-red-500 to-rose-500',
          maxParticipants: 6,
          currentParticipants: 3,
          href: '/geolocation-meeting',
          canJoin: true
        },
        {
          id: 'ai1',
          title: 'Session Analyse Faciale',
          description: 'Découvrez vos matchs IA personnalisés',
          date: addDays(today, 0),
          time: '16:00',
          duration: '30min',
          type: 'ai-feature',
          icon: <ScanFace className="w-4 h-4" />,
          gradient: 'from-purple-500 to-pink-500',
          href: '/facial-analysis-matching',
          canJoin: true
        },
        {
          id: 'blind1',
          title: 'Échange Aveugle Guidé',
          description: 'Session de chat mystère avec assistance',
          date: addDays(today, 4),
          time: '21:00',
          duration: '1h',
          type: 'ai-feature',
          icon: <EyeOff className="w-4 h-4" />,
          gradient: 'from-gray-600 to-slate-700',
          href: '/blind-exchange-mode',
          canJoin: true
        }
      ];
      setEvents(mockEvents);
    };

    generateEvents();
  }, []);

  const eventsForSelectedDate = events.filter(event => 
    isSameDay(event.date, selectedDate)
  );

  const getEventIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'speed-dating': return <Zap className="w-4 h-4" />;
      case 'game-session': return <Gamepad2 className="w-4 h-4" />;
      case 'local-meetup': return <MapPin className="w-4 h-4" />;
      case 'ai-feature': return <ScanFace className="w-4 h-4" />;
      case 'special-event': return <Trophy className="w-4 h-4" />;
      default: return <CalendarDays className="w-4 h-4" />;
    }
  };

  const getDayClassName = (date: Date) => {
    const hasEvents = events.some(event => isSameDay(event.date, date));
    if (hasEvents) {
      return 'relative after:absolute after:bottom-1 after:left-1/2 after:transform after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-rose-500 after:rounded-full';
    }
    return '';
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Calendrier des activités</h1>
        <p className="text-muted-foreground">
          Découvrez et participez aux événements HeartWise
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Calendrier */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="w-6 h-6 text-primary" />
                  {format(selectedDate, 'MMMM yyyy', { locale: fr })}
                </CardTitle>
                <CardDescription>
                  Cliquez sur une date pour voir les événements disponibles
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setView('month')}>
                  Mois
                </Button>
                <Button variant="outline" size="sm" onClick={() => setView('week')}>
                  Semaine
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border"
              modifiers={{
                hasEvents: (date) => events.some(event => isSameDay(event.date, date))
              }}
              modifiersClassNames={{
                hasEvents: 'bg-rose-100 text-rose-900 font-semibold relative after:absolute after:bottom-1 after:left-1/2 after:transform after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-rose-500 after:rounded-full'
              }}
            />
          </CardContent>
        </Card>

        {/* Événements du jour sélectionné */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
            </CardTitle>
            <CardDescription>
              {eventsForSelectedDate.length} événement(s) disponible(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eventsForSelectedDate.length > 0 ? (
              <div className="space-y-4">
                {eventsForSelectedDate.map((event) => (
                  <Card key={event.id} className="border shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${event.gradient} flex items-center justify-center text-white flex-shrink-0`}>
                          {event.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{event.title}</h4>
                          <p className="text-xs text-muted-foreground mb-2">{event.description}</p>
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                            <Clock className="w-3 h-3" />
                            <span>{event.time}</span>
                            <span>•</span>
                            <span>{event.duration}</span>
                          </div>

                          {event.interests && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {event.interests.slice(0, 2).map((interest) => (
                                <Badge key={interest} variant="secondary" className="text-xs">
                                  {interest}
                                </Badge>
                              ))}
                              {event.interests.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{event.interests.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}

                          {event.maxParticipants && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                              <Users className="w-3 h-3" />
                              <span>{event.currentParticipants}/{event.maxParticipants}</span>
                            </div>
                          )}

                          <Link href={event.href}>
                            <Button 
                              size="sm" 
                              className="w-full"
                              disabled={!event.canJoin}
                            >
                              {event.canJoin ? 'Participer' : 'Complet'}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Aucun événement ce jour</p>
                <p className="text-xs">Sélectionnez une autre date</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Événements à venir */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Événements à venir</CardTitle>
          <CardDescription>
            Prochains événements recommandés pour vous
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events
              .filter(event => event.date >= new Date())
              .slice(0, 6)
              .map((event) => (
                <Card key={event.id} className="border hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${event.gradient} flex items-center justify-center text-white`}>
                        {event.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm truncate">{event.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {format(event.date, 'EEE d MMM', { locale: fr })} à {event.time}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-3">{event.description}</p>
                    
                    <Link href={event.href}>
                      <Button size="sm" variant="outline" className="w-full">
                        En savoir plus
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}