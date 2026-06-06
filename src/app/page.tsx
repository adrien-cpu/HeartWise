"use client";

import { MessageCircle, Gamepad2, Zap, LocateFixed, Smile, EyeOff } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/FeatureCard";
import { motion } from "framer-motion"; // Importation de framer-motion

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 to-purple-100 flex flex-col items-center justify-center py-12 px-4"> {/* Modification du dégradé */}
      <div className="text-center mb-16 px-4">
        <motion.h1
          className="text-6xl md:text-8xl font-extrabold text-primary mb-6 drop-shadow-lg"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          HeartWise <span role="img" aria-label="sparkling heart">💖</span>
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl text-foreground max-w-3xl mx-auto mb-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Discover meaningful connections and ignite your love story with intelligent matching and engaging experiences.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link href="/signup" passHref>
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-xl px-10 py-6 rounded-full shadow-modern hover:shadow-modern-lg transform transition-all duration-300 hover:-translate-y-1" // Utilisation des nouvelles classes d'ombre
            >
              Join HeartWise Today!
            </Button>
          </Link>
        </motion.div>
      </div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto w-full px-4"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <FeatureCard
          icon={<Gamepad2 className="w-10 h-10 text-primary" />}
          title="Engaging Games"
          description="Break the ice and connect through fun, interactive games designed to reveal your true compatibility."
          link="/game"
          linkText="Play Now"
          color="border-primary"
        />
        <FeatureCard
          icon={<Zap className="w-10 h-10 text-yellow-500" />}
          title="Speed Dating Events"
          description="Experience quick, interest-based virtual speed dating sessions. Find your spark in minutes!"
          link="/speed-dating"
          linkText="Join a Session"
          color="border-yellow-300" // Utilisation des couleurs Tailwind par défaut pour varier
        />
        <FeatureCard
          icon={<LocateFixed className="w-10 h-10 text-green-500" />}
          title="Geolocation Meetings"
          description="Discover potential matches in public places near you. Real-world connections, made easy."
          link="/geolocation-meeting"
          linkText="Explore Nearby"
          color="border-green-500" // Utilisation des couleurs Tailwind par défaut
        />
        <FeatureCard
          icon={<Smile className="w-10 h-10 text-purple-500" />}
          title="AI Facial Analysis"
          description="Our AI suggests matches based on facial compatibility and emotional insights. Deeper connections await."
          link="/facial-analysis-matching"
          linkText="Analyze & Match"
          color="border-purple-500" // Utilisation des couleurs Tailwind par défaut
        />
        <FeatureCard
          icon={<MessageCircle className="w-10 h-10 text-blue-500" />}
          title="AI Conversation Coach"
          description="Get AI-powered tips and personalized advice to enhance your conversations and make a lasting impression."
          link="/ai-conversation-coach"
          linkText="Get Coaching"
          color="border-blue-500" // Utilisation des couleurs Tailwind par défaut
        />
        <FeatureCard
          icon={<EyeOff className="w-10 h-10 text-gray-500" />}
          title="Blind Exchange Mode"
          description="Connect and chat without initial photos or profiles. Discover personalities first, then reveal yourselves."
          link="/blind-exchange-mode"
          linkText="Try Blind Mode"
          color="border-gray-500" // Utilisation des couleurs Tailwind par default
        />
      </motion.div>
    </div>
  );
}
