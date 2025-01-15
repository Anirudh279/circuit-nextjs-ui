'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JourneyList } from '@/components/journey/journey-list';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  picture: string;
  email: string;
  auth0_id: string;
  org_id: string;
}

const DEFAULT_ORG_ID = 'cd194f08-d52a-4ad2-a97a-0efaaebbb3ed';

export default function Home() {
  const searchParams = useSearchParams();
  const auth0Id = searchParams.get('auth0_id');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initializeApp() {
      if (!auth0Id) {
        localStorage.setItem('org_id', DEFAULT_ORG_ID);
        return;
      }

      try {
        setError(null);
        setIsLoading(true);

        const response = await fetch('https://circuit-webapp-backend-ggcjf7emdtd2dfdw.northcentralus-01.azurewebsites.net/get-user', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            auth0_id: auth0Id
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          localStorage.setItem('org_id', data.user.org_id);
        }
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setError('Failed to initialize application');
        localStorage.setItem('org_id', DEFAULT_ORG_ID);
      } finally {
        setIsLoading(false);
      }
    }

    initializeApp();
  }, [auth0Id]);

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8 flex flex-col items-center justify-center min-h-screen">
        <AlertCircle className="h-8 w-8 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button 
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">User Journeys</h1>
        <p className="text-muted-foreground mt-2">
          Manage and visualize your product's user journeys
        </p>
      </div>
      
      <JourneyList />
    </div>
  );
}