'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { saveCookieConsent } from '@/lib/storage';

export function AgeVerification() {
  const [showModal, setShowModal] = useState(false);
  const [age, setAge] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const verified = localStorage.getItem('age-verified');
    if (!verified) {
      setShowModal(true);
    }
  }, []);

  const handleVerify = () => {
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 13) {
      setError('You must be at least 13 years old to use this site.');
      return;
    }

    localStorage.setItem('age-verified', 'true');
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2 className="text-2xl font-semibold">Age Verification</h2>
          <p className="text-sm text-muted-foreground">
            This website contains content that may not be suitable for children under 13.
            Please verify your age to continue.
          </p>
        </div>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="age">Enter your age</Label>
            <Input
              id="age"
              type="number"
              value={age}
              onChange={(e) => {
                setAge(e.target.value);
                setError('');
              }}
              placeholder="Enter your age"
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Button
            variant="outline"
            onClick={() => window.location.href = 'https://www.google.com'}
          >
            Leave Site
          </Button>
          <Button onClick={handleVerify}>
            Verify Age
          </Button>
        </div>
      </div>
    </div>
  );
} 