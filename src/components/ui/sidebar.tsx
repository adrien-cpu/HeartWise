import Link from 'next/link';
import { Home, Users, MessageSquare, Gamepad2, Calendar, Settings } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-card p-6 flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold mb-8">HeartWise</h2>
        <nav className="flex flex-col space-y-4">
          <Link href="/" className="flex items-center space-x-3 text-lg text-muted-foreground hover:text-foreground transition-colors">
            <Home className="w-6 h-6" />
            <span>Accueil</span>
          </Link>
          <Link href="/profile" className="flex items-center space-x-3 text-lg text-muted-foreground hover:text-foreground transition-colors">
            <Users className="w-6 h-6" />
            <span>Profil</span>
          </Link>
          <Link href="/chat" className="flex items-center space-x-3 text-lg text-muted-foreground hover:text-foreground transition-colors">
            <MessageSquare className="w-6 h-6" />
            <span>Messages</span>
          </Link>
          <Link href="/game" className="flex items-center space-x-3 text-lg text-muted-foreground hover:text-foreground transition-colors">
            <Gamepad2 className="w-6 h-6" />
            <span>Jeux</span>
          </Link>
          <Link href="/calendar" className="flex items-center space-x-3 text-lg text-muted-foreground hover:text-foreground transition-colors">
            <Calendar className="w-6 h-6" />
            <span>Calendrier</span>
          </Link>
        </nav>
      </div>
      <div className="flex flex-col space-y-4">
        <Link href="/settings" className="flex items-center space-x-3 text-lg text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="w-6 h-6" />
          <span>Paramètres</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
