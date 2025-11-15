'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { UserProfile } from '@/types/UserProfile';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { QuestionnaireSection } from '@/components/profile/QuestionnaireSection';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const fetchUserProfile = async () => {
    if (!user) return;
    try {
      const docRef = doc(firestore, 'users', user.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile({ id: docSnap.id, ...docSnap.data() } as UserProfile);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast({ title: "Erreur", description: "Impossible de charger le profil.", variant: "destructive" });
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchUserProfile();
    }
  }, [user, authLoading]);

  const handleUpdateProfile = async (formData: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const userDocRef = doc(firestore, 'users', user.id);
      await updateDoc(userDocRef, formData);
      await fetchUserProfile(); // Re-fetch to update the state
      toast({ title: "Succès", description: "Votre profil a été mis à jour." });
    } catch (error) {
      console.error("Error updating profile: ", error);
      toast({ title: "Erreur", description: "La mise à jour du profil a échoué.", variant: "destructive" });
    }
  };

  if (authLoading || loadingProfile) {
    return (
      <div className="container mx-auto py-10 px-4">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Skeleton className="h-12 w-full mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!userProfile) {
    return <p>Impossible de charger le profil.</p>;
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Gérer votre profil</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <ProfileForm userProfile={userProfile} onUpdate={handleUpdateProfile} />
        </div>
        <div className="lg:col-span-2">
          <QuestionnaireSection 
            userProfile={userProfile} 
            onUpdate={handleUpdateProfile}
          />
        </div>
      </div>
    </div>
  );
}
