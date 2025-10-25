import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { UserProfile } from '@/types/UserProfile';

export function useUserProfile() {
  const { user, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!user) {
      setLoading(false);
      setUserProfile(null);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const docRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserProfile(docSnap.data() as UserProfile);
        } else {
          console.log("No such document!");
          // You might want to create a default profile here
          setError('User profile not found.');
        }
      } catch (e) {
        console.error("Error fetching user profile:", e);
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, authLoading]);

  return { user, userProfile, loading, error };
}
