"use client";

import type { SubmitHandler } from 'react-hook-form';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { Link } from 'next-intl'; // Corrected import
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import AuthLayout from '@/components/layouts/AuthLayout';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
});

type ForgotPasswordFormInputs = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage(): JSX.Element {
  const t = useTranslations('Auth');
  const { toast } = useToast();
  const { sendPasswordReset } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormInputs>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  
  const onSubmit: SubmitHandler<ForgotPasswordFormInputs> = async (data) => {
    setIsLoading(true);
    setError(null);
    setIsSuccess(false);
    try {
      await sendPasswordReset(data.email);
      setIsSuccess(true);
      toast({
        title: t('passwordResetSuccessTitle'),
        description: t('passwordResetSuccessDesc'),
      });
    } catch (err: any) {
      let errorMessage = t('passwordResetErrorDefault');
       if (err.code === 'auth/user-not-found') {
        // To prevent user enumeration, we can show a generic success message.
        // Or a specific error, depending on security policy.
        // For this case, we'll show a generic success message.
        setIsSuccess(true); 
      } else {
        setError(errorMessage);
        toast({
          variant: 'destructive',
          title: t('passwordResetErrorTitle'),
          description: errorMessage,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            {t('forgotPasswordTitle')}
          </CardTitle>
          <CardDescription>{t('forgotPasswordDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t('errorTitle')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {isSuccess ? (
             <Alert variant="default" className="mb-4 bg-green-100 border-green-400 text-green-700">
              <Mail className="h-4 w-4" />
              <AlertTitle>{t('passwordResetSuccessTitle')}</AlertTitle>
              <AlertDescription>{t('passwordResetSuccessDesc')}</AlertDescription>
            </Alert>
          ) : (
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
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('sendResetEmailButton')}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="text-sm text-muted-foreground">
            <Link href="/login" className="font-medium text-primary hover:underline">
              {t('backToLoginLink')}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
