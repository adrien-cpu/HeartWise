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
import { motion } from "framer-motion";

export default function Home() {
  const t = useTranslations("Home");
  const { user } = useAuth();

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const scaleOnHover = {
    hover: { 
      scale: 1.03, 
      transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } 
    }
  };

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
      <section className="relative overflow-hidden gradient-hero min-h-screen flex items-center">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-32 w-96 h-96 rounded-full bg-gradient-to-tr from-accent/20 to-primary/20 blur-3xl animate-pulse-slow"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
            >
              <div className="inline-flex items-center gap-3 mb-8 px-6 py-3 rounded-full glass border backdrop-blur-sm">
                <Heart className="w-6 h-6 text-primary animate-pulse" />
                <span className="text-sm font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {user ? t('welcomeBack') : t('newGeneration')}
                </span>
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
              
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-300% animate-pulse">
                  HeartWise
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl lg:text-3xl text-foreground/80 mb-12 max-w-3xl mx-auto font-light leading-relaxed text-balance">
                {t('heroDescription')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                {user ? (
                  <Link href="/dashboard">
                    <Button 
                      size="lg" 
                      className="text-lg px-12 py-6 rounded-full shadow-glow button-glow bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary transition-all duration-500 border-0"
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
                        className="text-lg px-12 py-6 rounded-full shadow-glow button-glow bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary transition-all duration-500 border-0"
                      >
                        {t('getStartedButton')}
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </Link>
                    <Link href="/features">
                      <Button 
                        variant="outline" 
                        size="lg" 
                        className="text-lg px-12 py-6 rounded-full glass hover:bg-white/20 transition-all duration-300"
                      >
                        {t('learnMoreButton')}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background relative">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6">
              {t('featuresTitle')}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('featuresSubtitle')}
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover="hover"
              >
                <Link href={feature.href}>
                  <motion.div variants={scaleOnHover}>
                    <Card className={`h-full card-hover overflow-hidden group cursor-pointer bg-gradient-to-br ${feature.bgGradient} border-2 border-transparent hover:border-primary/20`}>
                      <CardHeader className="pb-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                          {feature.icon}
                        </div>
                        <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                          {feature.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-base leading-relaxed text-muted-foreground group-hover:text-foreground/70 transition-colors">
                          {feature.description}
                        </CardDescription>
                        <div className="mt-6 flex items-center text-primary group-hover:translate-x-2 transition-transform duration-300">
                          <span className="text-sm font-medium">Découvrir</span>
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-6xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                {t('whyChooseTitle')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t('whyChooseSubtitle')}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="text-center group"
                >
                  <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4 group-hover:text-primary transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10"></div>
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              className="text-center max-w-4xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={fadeInUp}
            >
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                {t('ctaTitle')}
              </h2>
              <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
                {t('ctaDescription')}
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/signup">
                  <Button 
                    size="lg" 
                    className="text-lg px-12 py-6 rounded-full shadow-glow button-glow bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary transition-all duration-500"
                  >
                    {t('getStartedButton')}
                    <Heart className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="text-lg px-12 py-6 rounded-full glass hover:bg-white/20 transition-all duration-300"
                  >
                    {t('learnMoreButton')}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      <section className="py-16 border-t">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center">
              <div className="text-3xl font-black text-primary mb-2">500+</div>
              <div className="text-sm text-muted-foreground">{t('statsConnections')}</div>
            </motion.div>
            <motion.div variants={fadeInUp} className="text-center">
              <div className="text-3xl font-black text-primary mb-2">95%</div>
              <div className="text-sm text-muted-foreground">{t('statsSatisfaction')}</div>
            </motion.div>
            <motion.div variants={fadeInUp} className="text-center">
              <div className="text-3xl font-black text-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">{t('statsSupport')}</div>
            </motion.div>
            <motion.div variants={fadeInUp} className="text-center">
              <div className="text-3xl font-black text-primary mb-2">AI</div>
              <div className="text-sm text-muted-foreground">{t('statsAIPowered')}</div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}