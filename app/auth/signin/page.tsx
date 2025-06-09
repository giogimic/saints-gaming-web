'use client';

import { Button } from '@/components/ui/button';
import { signIn, useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignIn() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome to SaintsGaming
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to access the community features
          </p>
        </div>
        <div className="grid gap-4">
          <Button
            variant="outline"
            onClick={() => signIn('steam')}
            className="flex items-center justify-center gap-2"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm0 1.8c5.6 0 10.2 4.6 10.2 10.2 0 5.6-4.6 10.2-10.2 10.2-5.6 0-10.2-4.6-10.2-10.2 0-5.6 4.6-10.2 10.2-10.2zm0 2.4c-4.3 0-7.8 3.5-7.8 7.8s3.5 7.8 7.8 7.8 7.8-3.5 7.8-7.8-3.5-7.8-7.8-7.8zm0 2.4c3 0 5.4 2.4 5.4 5.4s-2.4 5.4-5.4 5.4-5.4-2.4-5.4-5.4 2.4-5.4 5.4-5.4z" />
            </svg>
            Sign in with Steam
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            <p>Or visit our forums:</p>
            <Link href="/community" className="text-primary hover:underline">
              Browse Forums
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 