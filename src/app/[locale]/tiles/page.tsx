"use client";

import React from 'react';
import { TilesLayout } from '@/components/layouts/TilesLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Link } from 'next-intl';
import { Heart, ArrowRight } from 'lucide-react';

export default function TilesPage() {
  const { user } = useAuth();
  const t = useTranslations("Home");

  return (
    <TilesLayout>
      {!user && (
        <section className="py-24 text-center">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
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
                    className="text-lg px-12 py-6 rounded-full"
                  >
                    {t('getStartedButton')}
                    <Heart className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="text-lg px-12 py-6 rounded-full"
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
      <section className="py-16 border-t bg-white/50">
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
    </TilesLayout>
  );
}