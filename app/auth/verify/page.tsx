'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { updateUserVerification } from '@/lib/storage';
import { useToast } from '@/components/ui/use-toast';

export default function VerifyEmailPage() {
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      if (!token) {
        setError('No verification token provided');
        setIsVerifying(false);
        return;
      }

      try {
        const user = await updateUserVerification(token, true);
        if (!user) {
          setError('Invalid verification token');
          return;
        }

        toast({
          title: 'Email Verified',
          description: 'Your email has been verified successfully.',
        });

        // Redirect to sign in page after 2 seconds
        setTimeout(() => {
          router.push('/auth/signin');
        }, 2000);
      } catch (error) {
        setError('Failed to verify email');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, router, toast]);

  if (isVerifying) {
    return (
      <div className="container mx-auto max-w-md py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Verifying your email...</h1>
          <p className="text-muted-foreground">Please wait while we verify your email address.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-md py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-500">Verification Failed</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => router.push('/auth/signin')}
            className="text-primary hover:underline"
          >
            Return to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md py-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-green-500">Email Verified!</h1>
        <p className="text-muted-foreground">
          Your email has been verified successfully. You will be redirected to the sign in page shortly.
        </p>
      </div>
    </div>
  );
} 