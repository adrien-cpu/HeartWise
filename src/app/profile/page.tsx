"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from '@/lib/firebase';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast"
import AuthGuard from '@/components/auth-guard';
import { Loader2 } from 'lucide-react';


export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { userProfile, loading: profileLoading, error: profileError } = useUserProfile();
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setBio(userProfile.bio || '');
    }
  }, [userProfile]);

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
        toast({
            variant: "destructive",
            title: "Not Authenticated",
            description: "You must be logged in to update your profile.",
        })
        return;
    }

    setIsSubmitting(true);
    try {
        const userDocRef = doc(firestore, "users", user.uid);
        await updateDoc(userDocRef, {
            name,
            bio
        });
        toast({
            title: "Profile Updated",
            description: "Your profile has been successfully updated.",
        })
    } catch (error) {
        console.error("Error updating profile: ", error);
        toast({
            variant: "destructive",
            title: "Update Failed",
            description: "There was an error updating your profile. Please try again.",
        })
    } finally {
        setIsSubmitting(false);
    }
  };
  
  if (authLoading || profileLoading) {
      return <div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin" /></div>;
  }

  return (
      <AuthGuard>
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Edit Your Profile</CardTitle>
                    <CardDescription>Update your public information.</CardDescription>
                </CardHeader>
                <form onSubmit={handleUpdateProfile}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input 
                                id="name" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                placeholder="Your full name"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" value={userProfile?.email || ''} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea 
                                id="bio" 
                                value={bio} 
                                onChange={(e) => setBio(e.target.value)} 
                                placeholder="Tell us a little about yourself"
                                disabled={isSubmitting}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} 
                            Update Profile
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
      </AuthGuard>
  );
}