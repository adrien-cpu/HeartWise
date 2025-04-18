import {Button} from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-4">HeartWise App</h1>
      <p className="text-lg mb-8">Explore the core features:</p>
      <div className="flex space-x-4">
        <Link href="/geolocation-meeting">
          <Button>Geolocation Meeting</Button>
        </Link>
        <Link href="/facial-analysis-matching">
          <Button>Facial Analysis &amp; Matching</Button>
        </Link>
        <Link href="/ai-conversation-coach">
          <Button>AI Conversation Coach</Button>
        </Link>
        <Link href="/blind-exchange-mode">
          <Button>Blind Exchange Mode</Button>
        </Link>
      </div>
    </div>
  );
}
