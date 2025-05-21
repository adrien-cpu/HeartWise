
"use client";

import type { SubmitHandler } from 'react-hook-form';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UserPlus, Eye, EyeOff, AlertTriangle } from 'lucide-react'; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { update_user_profile } from '@/services/user_profile';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

/**
 * @fileOverview Signup page component.
 * @module SignupPage
 * @description Allows new users to register with their name, email, and password. Includes password visibility toggle.
 */

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

type SignupFormInputs = z.infer<typeof signupSchema>;

/**
 * SignupPage component.
 * @returns {JSX.Element} The rendered signup page.
 */
export default function SignupPage(): JSX.Element {
  const t = useTranslations('Auth');
  const { toast } = useToast();
  const router = useRouter();
  const { isFirebaseConfigured } = useAuth(); 

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false); 

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormInputs>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit: SubmitHandler<SignupFormInputs> = async (data) => {
    if (!isFirebaseConfigured) {
        setError(t('firebaseConfigError'));
        toast({
            variant: 'destructive',
            title: t('signupErrorTitle'),
            description: t('firebaseConfigErrorUserFriendly'),
        });
        return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(userCredential.user, { displayName: data.name });

      // Create a basic profile in Firestore
      await update_user_profile(userCredential.user.uid, {
        id: userCredential.user.uid,
        name: data.name,
        email: data.email,
        profilePicture: `https://picsum.photos/seed/${userCredential.user.uid}/200`,
        dataAiHint: "person placeholder",
        bio: "",
        interests: [],
        rewards: [],
        points: 0,
        privacySettings: { showLocation: true, showOnlineStatus: true },
      });

      toast({
        title: t('signupSuccessTitle'),
        description: t('signupSuccessDesc'),
      });
      router.push('/'); 
    } catch (err: any) {
      console.error('Signup error:', err.code, err.message);
      let errorMessage = t('signupErrorDefault');
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = t('signupErrorEmailInUse');
      } else if (err.code === 'auth/invalid-api-key' || err.code === 'auth/api-key-not-valid.' || err.message?.includes('API key not valid')) {
        errorMessage = t('firebaseApiKeyErrorDetailed');
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = t('networkError');
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = t('signupErrorInvalidEmail');
      } else if (err.code === 'auth/weak-password') {
        errorMessage = t('signupErrorWeakPassword');
      }
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: t('signupErrorTitle'),
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Toggles the visibility of the password input field.
   */
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <UserPlus className="h-6 w-6 text-primary" />
            {t('signupTitle')}
          </CardTitle>
          <CardDescription>{t('signupDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
           {!isFirebaseConfigured && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t('configErrorTitle')}</AlertTitle>
              <AlertDescription>{t('firebaseConfigErrorUserFriendly')}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t('signupErrorTitle')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name">{t('nameLabel')}</Label>
              <Input
                id="name"
                type="text"
                {...register('name')}
                placeholder={t('namePlaceholder')}
                disabled={isLoading || !isFirebaseConfigured}
                aria-invalid={errors.name ? "true" : "false"}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">{t('emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="name@example.com"
                disabled={isLoading || !isFirebaseConfigured}
                aria-invalid={errors.email ? "true" : "false"}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">{t('passwordLabel')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••"
                  disabled={isLoading || !isFirebaseConfigured}
                  aria-invalid={errors.password ? "true" : "false"}
                  className="pr-10" 
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                  disabled={!isFirebaseConfigured}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !isFirebaseConfigured}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('signupButton')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {t('alreadyAccountPrompt')}{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              {t('loginLink')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
