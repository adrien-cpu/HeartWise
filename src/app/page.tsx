"use client";

import { MessageCircle, Gamepad2, Zap, LocateFixed, Smile, EyeOff } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/FeatureCard"; // Import the new component

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex flex-col items-center justify-center py-12 px-4">
      <div className="text-center mb-16 px-4">
        <h1 className="text-6xl md:text-8xl font-extrabold text-primary mb-6 drop-shadow-lg animate-fade-in-down">
          HeartWise <span role="img" aria-label="sparkling heart">💖</span>
        </h1>
        <p className="text-xl md:text-2xl text-foreground max-w-3xl mx-auto mb-10 animate-fade-in-up">
          Discover meaningful connections and ignite your love story with intelligent matching and engaging experiences.
        </p>
        <Link href="/signup" passHref>
          <Button 
            size="lg" 
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-xl px-10 py-6 rounded-full shadow-lg transform transition-transform duration-300 hover:scale-105 animate-bounce-in"
          >
            Join HeartWise Today!
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto w-full px-4">
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
          color="border-yellow-300"
        />
        <FeatureCard
          icon={<LocateFixed className="w-10 h-10 text-green-500" />}
          title="Geolocation Meetings"
          description="Discover potential matches in public places near you. Real-world connections, made easy."
          link="/geolocation-meeting"
          linkText="Explore Nearby"
          color="border-green-300"
        />
        <FeatureCard
          icon={<Smile className="w-10 h-10 text-purple-500" />}
          title="AI Facial Analysis"
          description="Our AI suggests matches based on facial compatibility and emotional insights. Deeper connections await."
          link="/facial-analysis-matching"
          linkText="Analyze & Match"
          color="border-purple-300"
        />
        <FeatureCard
          icon={<MessageCircle className="w-10 h-10 text-blue-500" />}
          title="AI Conversation Coach"
          description="Get AI-powered tips and personalized advice to enhance your conversations and make a lasting impression."
          link="/ai-conversation-coach"
          linkText="Get Coaching"
          color="border-blue-300"
        />
        <FeatureCard
          icon={<EyeOff className="w-10 h-10 text-gray-500" />}
          title="Blind Exchange Mode"
          description="Connect and chat without initial photos or profiles. Discover personalities first, then reveal yourselves."
          link="/blind-exchange-mode"
          linkText="Try Blind Mode"
          color="border-gray-300"
        />
      </div>
    </div>
  );
}
