import { AuthProvider } from '@/contexts/AuthContext';

export default function GameLayout({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}