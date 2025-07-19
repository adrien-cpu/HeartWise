"use client";

import type { SubmitHandler } from 'react-hook-form';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { Link } from 'next-intl'; // Corrected import
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogIn, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AuthLayout from '@/components/layouts/AuthLayout';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export default function LoginPage(): JSX.Element | null {
  const t = useTranslations('Auth');
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, loading: authLoading } = useAuth();

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

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      const from = searchParams.get('from');
      router.replace(from || '/');
    }
  }, [user, router, searchParams]);
  
  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(data.email, data.password);
      toast({
        title: t('loginSuccessTitle'),
        description: t('loginSuccessDesc'),
      });
      // The useEffect hook will handle the redirection.
    } catch (err: any) {
      let errorMessage = t('loginErrorDefault');
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = t('loginErrorInvalidCredentials');
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = t('loginErrorTooManyRequests');
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  // Render a loading state or nothing while checking auth status
  if (authLoading || user) {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <AuthLayout>
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <LogIn className="h-6 w-6 text-primary" />
            {t('loginTitle')}
          </CardTitle>
          <CardDescription>{t('loginDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
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
                disabled={isLoading}
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
                  disabled={isLoading}
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
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <div className="text-right text-sm">
                <Link href="/forgot-password" passHref className="text-primary hover:underline">
                    {t('forgotPasswordLink')}
                </Link>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
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
    </AuthLayout>
  );
}
