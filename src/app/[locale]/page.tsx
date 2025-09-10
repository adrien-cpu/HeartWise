"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "next-intl";
import { Heart, MessageCircle, Users, Trophy } from "lucide-react";
import { Icons } from '@/components/icons';
import { Badge } from "@/components/ui/badge";
import { useAuth } from '@/contexts/AuthContext';
import { motion } from "framer-motion";

export default function Home() {
  const t = useTranslations("Home");
  const featureT = useTranslations("FeatureCards");
  const { user } = useAuth();

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerChildren = {
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-rose-50 via-purple-50 to-blue-50 py-20 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <div className="inline-flex items-center gap-2 mb-6">
              <Heart className="h-8 w-8 text-primary" />
              <Badge variant="secondary" className="text-sm">
                {user ? t('welcomeBack') : t('newGeneration')}
              </Badge>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-primary mb-6">
              HeartWise
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
              {t('heroDescription')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link href="/dashboard">
                  <Button size="lg" className="px-8 py-3 text-lg">
                    {t('goToDashboard')}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/signup">
                    <Button size="lg" className="px-8 py-3 text-lg">
                      {t('getStartedButton')}
                    </Button>
                  </Link>
                  <Link href="/features">
                    <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                      {t('learnMoreButton')}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('featuresTitle')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('featuresSubtitle')}
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerChildren}
          >
            <motion.div variants={fadeInUp}>
              <Link href="/facial-analysis-matching">
                <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Icons.scanFace className="h-8 w-8 text-blue-600 group-hover:scale-110 transition-transform" />
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        IA
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{t('facialAnalysisMatching')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{featureT('facialAnalysisMatchingDescription')}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Link href="/ai-conversation-coach">
                <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Icons.messageSquare className="h-8 w-8 text-green-600 group-hover:scale-110 transition-transform" />
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        IA
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{t('aiConversationCoach')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{featureT('aiConversationCoachDescription')}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Link href="/speed-dating">
                <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Icons.zap className="h-8 w-8 text-purple-600 group-hover:scale-110 transition-transform" />
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        Social
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{t('speedDating')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{featureT('speedDatingDescription')}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Link href="/chat">
                <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <MessageCircle className="h-8 w-8 text-indigo-600 group-hover:scale-110 transition-transform" />
                      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                        Core
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{t('chat')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{featureT('chatDescription')}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Link href="/game">
                <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Icons.gamepad className="h-8 w-8 text-red-600 group-hover:scale-110 transition-transform" />
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Jeux
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{t('game')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{featureT('gameDescription')}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Link href="/rewards">
                <Card className="h-full hover:shadow-lg transition-all duration-300 group cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Trophy className="h-8 w-8 text-amber-600 group-hover:scale-110 transition-transform" />
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        Récompenses
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{t('rewards')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{featureT('rewardsDescription')}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 bg-primary/5">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                {t('ctaTitle')}
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                {t('ctaDescription')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="px-8 py-3 text-lg">
                    {t('getStartedButton')}
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                    {t('learnMoreButton')}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}