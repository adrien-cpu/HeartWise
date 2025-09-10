"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "next-intl";
import { 
  Heart, 
  MessageCircle, 
  Users, 
  Trophy, 
  Sparkles,
  ArrowRight,
  ScanFace,
  MessageSquare,
  Zap,
  Gamepad2,
  EyeOff,
  MapPin,
  Brain,
  Shield
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const t = useTranslations("Home");
  const { user } = useAuth();

  const features = [
    {
      icon: <ScanFace className="w-7 h-7" />,
      title: t('facialAnalysisMatching'),
      description: t('facialAnalysisMatchingDescription'),
      href: "/facial-analysis-matching",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50"
    },
    {
      icon: <MessageSquare className="w-7 h-7" />,
      title: t('aiConversationCoach'),
      description: t('aiConversationCoachDescription'),
      href: "/ai-conversation-coach",
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50"
    },
    {
      icon: <Zap className="w-7 h-7" />,
      title: t('speedDating'),
      description: t('speedDatingDescription'),
      href: "/speed-dating",
      gradient: "from-yellow-500 to-orange-500",
      bgGradient: "from-yellow-50 to-orange-50"
    },
    {
      icon: <Gamepad2 className="w-7 h-7" />,
      title: t('game'),
      description: t('gameDescription'),
      href: "/game",
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50"
    },
    {
      icon: <EyeOff className="w-7 h-7" />,
      title: t('blindExchangeMode'),
      description: t('blindExchangeModeDescription'),
      href: "/blind-exchange-mode",
      gradient: "from-gray-500 to-slate-600",
      bgGradient: "from-gray-50 to-slate-50"
    },
    {
      icon: <MapPin className="w-7 h-7" />,
      title: t('geolocationMeeting'),
      description: t('geolocationMeetingDescription'),
      href: "/geolocation-meeting",
      gradient: "from-red-500 to-rose-500",
      bgGradient: "from-red-50 to-rose-50"
    }
  ];

  const benefits = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: t('aiPoweredTitle'),
      description: t('aiPoweredDesc')
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: t('safeSecureTitle'),
      description: t('safeSecureDesc')
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: t('meaningfulTitle'),
      description: t('meaningfulDesc')
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50 min-h-screen flex items-center">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 w-96 h-96 rounded-full bg-gradient-to-tr from-pink-400/20 to-purple-400/20 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-3 mb-8 px-6 py-3 rounded-full bg-white/80 backdrop-blur-sm border shadow-lg">
              <Heart className="w-6 h-6 text-rose-500" />
              <span className="text-sm font-medium bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
                {user ? t('welcomeBack') : t('newGeneration')}
              </span>
              <Sparkles className="w-5 h-5 text-purple-500" />
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8">
              <span className="bg-gradient-to-r from-rose-600 via-purple-600 to-rose-600 bg-clip-text text-transparent">
                HeartWise
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl lg:text-3xl text-gray-700 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
              {t('heroDescription')}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {user ? (
                <Link href="/dashboard">
                  <Button 
                    size="lg" 
                    className="text-lg px-12 py-6 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-purple-600 hover:to-rose-500 shadow-lg hover:shadow-xl transform transition-all duration-300 hover:-translate-y-1"
                  >
                    {t('goToDashboard')}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/signup">
                    <Button 
                      size="lg" 
                      className="text-lg px-12 py-6 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-purple-600 hover:to-rose-500 shadow-lg hover:shadow-xl transform transition-all duration-300 hover:-translate-y-1"
                    >
                      {t('getStartedButton')}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="text-lg px-12 py-6 rounded-full border-2 border-gray-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:border-rose-300 transition-all duration-300"
                    >
                      {t('learnMoreButton')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-gray-800">
              {t('featuresTitle')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {t('featuresSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <Link href={feature.href}>
                  <Card className="h-full overflow-hidden border-2 border-transparent hover:border-rose-200 bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2">
                    <CardHeader className="p-8">
                      <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {feature.icon}
                      </div>
                      <CardTitle className="text-2xl font-bold group-hover:text-rose-600 transition-colors duration-300 mb-3">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-base leading-relaxed text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-0">
                      <div className="flex items-center text-rose-600 group-hover:translate-x-2 transition-transform duration-300">
                        <span className="font-semibold">Découvrir</span>
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-rose-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-6 text-gray-800">
                {t('whyChooseTitle')}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {t('whyChooseSubtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-rose-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4 group-hover:text-rose-600 transition-colors text-gray-800">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-24 relative overflow-hidden bg-white">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-100/50 via-purple-100/30 to-pink-100/50"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-black mb-6 text-gray-800">
                {t('ctaTitle')}
              </h2>
              <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
                {t('ctaDescription')}
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/signup">
                  <Button 
                    size="lg" 
                    className="text-lg px-12 py-6 rounded-full bg-gradient-to-r from-rose-500 to-purple-600 hover:from-purple-600 hover:to-rose-500 shadow-lg hover:shadow-xl transform transition-all duration-300"
                  >
                    {t('getStartedButton')}
                    <Heart className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="text-lg px-12 py-6 rounded-full border-2 border-gray-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:border-rose-300 transition-all duration-300"
                  >
                    {t('learnMoreButton')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-16 border-t bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-black text-rose-600 mb-2">500+</div>
              <div className="text-sm text-gray-600">{t('statsConnections')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-rose-600 mb-2">95%</div>
              <div className="text-sm text-gray-600">{t('statsSatisfaction')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-rose-600 mb-2">24/7</div>
              <div className="text-sm text-gray-600">{t('statsSupport')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-black text-rose-600 mb-2">AI</div>
              <div className="text-sm text-gray-600">{t('statsAIPowered')}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}