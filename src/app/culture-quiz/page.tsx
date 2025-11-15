'use client';

import CultureQuizGame from '@/components/games/CultureQuizGame';
import AuthGuard from '@/components/auth-guard';

export default function CultureQuizPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Quiz Découverte</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            Répondez correctement aux questions de culture générale pour révéler la photo de votre partenaire potentiel !
          </p>
        </div>
        <CultureQuizGame />
      </div>
    </AuthGuard>
  );
}
