"use client";

import { useTranslations } from "next-intl";
import { Link } from "next-intl";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { TilesLayout } from '@/components/layouts/TilesLayout';

export default function Home() {
  const t = useTranslations("Home");
  const { user } = useAuth();


  return (
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
    </TilesLayout>
  );
}