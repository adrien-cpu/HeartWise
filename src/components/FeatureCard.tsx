import Link from 'next/link';
import { ReactNode } from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  link: string;
}

export const FeatureCard = ({ title, description, icon, link }: FeatureCardProps) => {
  return (
    <Link href={link} className="block p-6 bg-card rounded-lg shadow-soft card-hover">
      <div className="flex items-center justify-center w-16 h-16 mb-4 bg-primary/10 rounded-full">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </Link>
  );
};
