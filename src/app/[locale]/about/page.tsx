"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, Brain, Shield, Sparkles, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  const t = useTranslations('About');

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: t('aiMatchingTitle'),
      description: t('aiMatchingDesc'),
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: t('emotionalIntelligenceTitle'),
      description: t('emotionalIntelligenceDesc'),
      gradient: "from-red-500 to-pink-500"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: t('realWorldMeetingsTitle'),
      description: t('realWorldMeetingsDesc'),
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: t('privacyFirstTitle'),
      description: t('privacyFirstDesc'),
      gradient: "from-purple-500 to-violet-500"
    }
  ];

  const values = [
    {
      icon: <Target className="h-8 w-8" />,
      title: t('authenticConnectionsTitle'),
      description: t('authenticConnectionsDesc'),
      gradient: "from-primary to-accent"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: t('respectConsentTitle'),
      description: t('respectConsentDesc'),
      gradient: "from-emerald-500 to-green-500"
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: t('innovationTitle'),
      description: t('innovationDesc'),
      gradient: "from-violet-500 to-purple-500"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative gradient-hero py-24 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-32 w-96 h-96 rounded-full bg-gradient-to-tr from-accent/20 to-primary/20 blur-3xl animate-pulse-slow"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            className="text-center max-w-5xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <div className="inline-flex items-center gap-3 mb-8 px-6 py-3 rounded-full glass">
                <Heart className="h-8 w-8 text-primary" />
                <Badge variant="secondary" className="bg-white/20 text-foreground border-0">
                  {t('betaVersion')}
                </Badge>
              </div>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-black mb-8 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
            >
              HeartWise
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-foreground/80 max-w-4xl mx-auto mb-8 leading-relaxed"
            >
              {t('heroDescription')}
            </motion.p>
            
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-foreground/70 max-w-4xl mx-auto leading-relaxed"
            >
              {t('visionStatement')}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6">{t('keyFeaturesTitle')}</h2>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="text-center card-hover bg-gradient-to-br from-background to-muted/30 border-2 border-transparent hover:border-primary/20 h-full">
                  <CardHeader className="pb-6">
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white shadow-glow`}>
                      {feature.icon}
                    </div>
                    <CardTitle className="text-2xl mb-4">{feature.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6">{t('ourValuesTitle')}</h2>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {values.map((value, index) => (
              <motion.div 
                key={index} 
                variants={fadeInUp}
                className="text-center group"
              >
                <div className={`w-20 h-20 mx-auto mb-8 bg-gradient-to-br ${value.gradient} rounded-3xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 shadow-glow`}>
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold mb-6 group-hover:text-primary transition-colors">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-base">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <Card className="max-w-4xl mx-auto bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 border-primary/20 text-center">
              <CardHeader className="pb-8">
                <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center shadow-glow">
                  <Heart className="h-10 w-10 text-white" />
                </div>
                <CardTitle className="text-3xl md:text-4xl">{t('missionTitle')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {t('missionStatement')}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}