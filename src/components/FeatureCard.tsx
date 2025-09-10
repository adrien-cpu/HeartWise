"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  linkText: string;
  gradient?: string;
  bgGradient?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon, 
  title, 
  description, 
  link, 
  linkText, 
  gradient = "from-rose-500 to-purple-600",
  bgGradient = "from-rose-50 to-purple-50"
}) => (
  <div className="group h-full">
    <Link href={link}>
      <Card className="h-full overflow-hidden border-2 border-transparent hover:border-rose-200 bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer transform hover:-translate-y-2">
        <CardHeader className="p-8">
          <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          <CardTitle className="text-2xl font-bold group-hover:text-rose-600 transition-colors duration-300 mb-3">
            {title}
          </CardTitle>
          <CardDescription className="text-base leading-relaxed text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <div className="flex items-center text-rose-600 group-hover:translate-x-2 transition-transform duration-300">
            <span className="font-semibold">{linkText}</span>
            <ArrowRight className="ml-2 w-5 h-5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  </div>
);