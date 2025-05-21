
"use client";

import type { SubmitHandler } from 'react-hook-form';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, KeyRound, AlertTriangle } from 'lucide-react'; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

/**
 * @fileOverview Forgot Password page component.
 * @module ForgotPasswordPage
 * @description Allows users to request a password reset email.
 */

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

type ForgotPasswordFormInputs = z.infer<typeof forgotPasswordSchema>;

/**
 * ForgotPasswordPage component.
 * @returns {JSX.Element} The rendered forgot password page.
 */
export default function ForgotPasswordPage(): JSX.Element {
  const t = useTranslations('Auth');
  const { toast } = useToast();
  const { isFirebaseConfigured } = useAuth(); 

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormInputs>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit: SubmitHandler<ForgotPasswordFormInputs> = async (data) => {
    if (!isFirebaseConfigured) {
        setError(t('firebaseConfigError'));
        toast({
            variant: 'destructive',
            title: t('passwordResetErrorTitle'),
            description: t('firebaseConfigErrorUserFriendly'),
        });
        return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await sendPasswordResetEmail(auth, data.email);
      setSuccessMessage(t('passwordResetEmailSentDesc'));
      toast({
        title: t('passwordResetEmailSentTitle'),
        description: t('passwordResetEmailSentDesc'),
      });
    } catch (err: any) {
      console.error('Password reset error:', err.code, err.message);
      let errorMessage = t('passwordResetErrorDefault');
      if (err.code === 'auth/user-not-found') {
        errorMessage = t('passwordResetErrorUserNotFound');
      } else if (err.code === 'auth/invalid-api-key' || err.code === 'auth/api-key-not-valid.' || err.message?.includes('API key not valid')) {
        errorMessage = t('firebaseApiKeyErrorDetailed');
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = t('networkError');
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = t('passwordResetErrorInvalidEmail');
      }
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: t('passwordResetErrorTitle'),
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <KeyRound className="h-6 w-6 text-primary" />
            {t('forgotPasswordTitle')}
          </CardTitle>
          <CardDescription>{t('forgotPasswordDescription')}</CardDescription>
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
              <AlertTitle>{t('passwordResetErrorTitle')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {successMessage && (
            <Alert variant="default" className="mb-4 border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 dark:border-green-500/50 [&>svg]:text-green-500">
              <Mail className="h-4 w-4" />
              <AlertTitle>{t('passwordResetEmailSentTitle')}</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          {!successMessage && (
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
              <Button type="submit" className="w-full" disabled={isLoading || !isFirebaseConfigured}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('sendResetEmailButton')}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {t('rememberPasswordPrompt')}{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              {t('loginLink')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
