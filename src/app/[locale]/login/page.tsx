
"use client";

import type { SubmitHandler } from 'react-hook-form';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, Eye, EyeOff, AlertTriangle } from 'lucide-react'; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

/**
 * @fileOverview Login page component.
 * @module LoginPage
 * @description Allows users to log in using their email and password. Includes password visibility toggle.
 */

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

/**
 * LoginPage component.
 * @returns {JSX.Element} The rendered login page.
 */
export default function LoginPage(): JSX.Element {
  const t = useTranslations('Auth');
  const { toast } = useToast();
  const router = useRouter();
  const { isFirebaseConfigured } = useAuth(); // Get Firebase config status

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    if (!isFirebaseConfigured) {
        setError(t('firebaseConfigError'));
        toast({
            variant: 'destructive',
            title: t('loginErrorTitle'),
            description: t('firebaseConfigError'),
        });
        return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      toast({
        title: t('loginSuccessTitle'),
        description: t('loginSuccessDesc'),
      });
      router.push('/'); 
    } catch (err: any) {
      console.error('Login error:', err);
      let errorMessage = t('loginErrorDefault');
      // More specific error mapping
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMessage = t('loginErrorInvalidCredentials');
      } else if (err.code === 'auth/invalid-api-key' || err.code === 'auth/api-key-not-valid.') {
        errorMessage = t('firebaseApiKeyError');
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = t('networkError');
      }
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: t('loginErrorTitle'),
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
            <LogIn className="h-6 w-6 text-primary" />
            {t('loginTitle')}
          </CardTitle>
          <CardDescription>{t('loginDescription')}</CardDescription>
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
              <AlertTitle>{t('loginErrorTitle')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('passwordLabel')}</Label>
                <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                  {t('forgotPasswordLink')}
                </Link>
              </div>
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
              {t('loginButton')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {t('noAccountPrompt')}{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              {t('signupLink')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

