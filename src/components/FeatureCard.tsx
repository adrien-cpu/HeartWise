"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  linkText: string;
  color: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, link, linkText, color }) => (
  <Card className={`flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 ${color}`}>
    <CardHeader className="p-0 mb-4">
      <div className={`p-3 rounded-full ${color.replace('border', 'bg').replace(/-\d+/, '-100')} mb-4`}>
        {icon}
      </div>
      <CardTitle className="text-2xl font-bold text-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent className="p-0 mb-6 flex-grow">
      <CardDescription className="text-gray-600">{description}</CardDescription>
    </CardContent>
    <CardFooter className="p-0">
      <Link href={link} passHref>
        <Button variant="outline" className={`text-primary border-primary hover:bg-primary hover:text-primary-foreground transition-colors`}>
          {linkText}
        </Button>
      </Link>
    </CardFooter>
  </Card>
);
