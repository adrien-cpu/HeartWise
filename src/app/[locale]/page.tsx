import MainLayout from '@/components/layouts/MainLayout';
import TilesLayout from '@/components/layouts/TilesLayout';
import { FeatureCard } from '@/components/FeatureCard'; // Assurez-vous que le chemin est correct
import { MessageSquare, Users, Gamepad2, Calendar, ShieldCheck, HeartPulse } from 'lucide-react';

const features = [
  {
    title: "Discussions instantanées",
    description: "Connectez-vous avec d'autres personnes grâce à notre chat en temps réel.",
    icon: <MessageSquare className="w-12 h-12 text-primary" />,
    link: "/chat"
  },
  {
    title: "Profils détaillés",
    description: "Découvrez des profils complets pour trouver le match parfait.",
    icon: <Users className="w-12 h-12 text-primary" />,
    link: "/profile"
  },
  {
    title: "Jeux interactifs",
    description: "Brisez la glace avec nos jeux amusants et interactifs.",
    icon: <Gamepad2 className="w-12 h-12 text-primary" />,
    link: "/game"
  },
  {
    title: "Planificateur de rendez-vous",
    description: "Organisez vos rendez-vous facilement avec notre calendrier intégré.",
    icon: <Calendar className="w-12 h-12 text-primary" />,
    link: "/calendar"
  },
  {
    title: "Modération de contenu",
    description: "Un environnement sûr grâce à notre modération de contenu IA.",
    icon: <ShieldCheck className="w-12 h-12 text-primary" />,
    link: "/content-moderation"
  },
  {
    title: "Analyse de compatibilité",
    description: "Découvrez votre compatibilité avec les autres grâce à l'IA.",
    icon: <HeartPulse className="w-12 h-12 text-primary" />,
    link: "/compatibility-analysis"
  }
];

export default function HomePage() {
  return (
    <MainLayout>
      <TilesLayout title="Bienvenue sur HeartWise">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            link={feature.link}
          />
        ))}
      </TilesLayout>
    </MainLayout>
  );
}
