"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { motion } from "framer-motion"; // Importation de framer-motion

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  linkText: string;
  color: string; // Cette prop sera utilisée pour la couleur de la bordure et de l'arrière-plan de l'icône
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description, link, linkText, color }) => (
  <motion.div
    className={`flex flex-col items-center text-center p-6 bg-card rounded-xl shadow-modern hover:shadow-modern-lg transition-all duration-300 hover:-translate-y-2 border-2 ${color} animate-float`} // Utilisation des nouvelles classes d'ombre et de l'animation
    whileHover={{ scale: 1.03 }} // Animation au survol
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="flex flex-col items-center text-center p-0 border-none shadow-none"> {/* Suppression des styles de Card pour utiliser ceux du motion.div */}
      <CardHeader className="p-0 mb-4">
        <div className={`p-4 rounded-full ${color.replace('border', 'bg').replace(/-d+/, '-100')} mb-4 flex items-center justify-center`}> {/* Ajustement du padding et centrage de l'icône */}
          {icon}
        </div>
        <CardTitle className="text-2xl font-bold text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 mb-6 flex-grow flex items-center justify-center"> {/* Centrage vertical du contenu */}
        <CardDescription className="text-muted-foreground">{description}</CardDescription> {/* Utilisation de muted-foreground pour la description */}
      </CardContent>
      <CardFooter className="p-0">
        <Link href={link} passHref>
          <Button variant="outline" className={`text-primary border-primary hover:bg-primary hover:text-primary-foreground transition-colors`}>
            {linkText}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  </motion.div>
);
