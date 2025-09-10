"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { motion } from "framer-motion";
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
  gradient = "from-primary to-accent",
  bgGradient = "from-primary/5 to-accent/5"
}) => (
  <motion.div
    whileHover={{ y: -8, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    className="group h-full"
  >
    <Link href={link}>
      <Card className={`h-full overflow-hidden border-2 border-transparent hover:border-primary/20 bg-gradient-to-br ${bgGradient} transition-all duration-500 shadow-soft hover:shadow-card-hover cursor-pointer`}>
        <CardHeader className="p-8">
          <motion.div 
            className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white mb-6 shadow-lg`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.3 }}
          >
            {icon}
          </motion.div>
          <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors duration-300 mb-3">
            {title}
          </CardTitle>
          <CardDescription className="text-base leading-relaxed text-muted-foreground group-hover:text-foreground/70 transition-colors duration-300">
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 pt-0">
          <div className="flex items-center text-primary group-hover:translate-x-2 transition-transform duration-300">
            <span className="font-semibold">{linkText}</span>
            <ArrowRight className="ml-2 w-5 h-5" />
          </div>
        </CardContent>
      </Card>
    </Link>
  </motion.div>
);