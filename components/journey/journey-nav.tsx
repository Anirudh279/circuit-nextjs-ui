import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Network, FileText, Video, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Journey {
  id: string;
  name: string;
}

const DEFAULT_ORG_ID = 'cd194f08-d52a-4ad2-a97a-0efaaebbb3ed';

export function JourneyNav({ journeyId }: { journeyId: string }) {
  const location = useLocation();
  const [currentJourney, setCurrentJourney] = useState<Journey | null>(null);
  const [prevJourney, setPrevJourney] = useState<Journey | null>(null);
  const [nextJourney, setNextJourney] = useState<Journey | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchJourneys() {
      try {
        setError(null);
        const orgId = localStorage.getItem('org_id') || DEFAULT_ORG_ID;
        localStorage.setItem('org_id', orgId);

        const response = await fetch('https://circuit-webapp-backend-ggcjf7emdtd2dfdw.northcentralus-01.azurewebsites.net/get-org-journeys', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            org_id: orgId
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch journeys');
        }

        const data = await response.json();
        
        if (data.success && isMounted) {
          const journeys = data.journeys;
          const currentIndex = journeys.findIndex((j: any) => j.id === journeyId);
          
          if (currentIndex !== -1) {
            setCurrentJourney({
              id: journeys[currentIndex].id,
              name: journeys[currentIndex].name
            });

            if (currentIndex > 0) {
              setPrevJourney({
                id: journeys[currentIndex - 1].id,
                name: journeys[currentIndex - 1].name
              });
            }

            if (currentIndex < journeys.length - 1) {
              setNextJourney({
                id: journeys[currentIndex + 1].id,
                name: journeys[currentIndex + 1].name
              });
            }
          }
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        if (isMounted) {
          setError('Failed to load journey navigation');
          console.error('Failed to fetch journeys:', error);
        }
      }
    }

    fetchJourneys();

    return () => {
      isMounted = false;
    };
  }, [journeyId]);

  const isActive = (path: string) => location.pathname.includes(path);

  if (error) {
    return (
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-muted-foreground">{error}</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            asChild
            disabled={!prevJourney}
          >
            <Link to={prevJourney ? `/journey/${prevJourney.id}/flowchart` : '#'}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <span className="text-sm font-medium">
            {currentJourney?.name || 'Loading...'}
          </span>
          <Button
            variant="ghost"
            size="icon"
            asChild
            disabled={!nextJourney}
          >
            <Link to={nextJourney ? `/journey/${nextJourney.id}/flowchart` : '#'}>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <nav className="flex items-center gap-2">
          <Button
            variant={isActive('flowchart') ? 'secondary' : 'ghost'}
            size="sm"
            className="gap-2"
            asChild
          >
            <Link to={`/journey/${journeyId}/flowchart`}>
              <Network className="h-4 w-4" />
              Flowchart
            </Link>
          </Button>
          <Button
            variant={isActive('docs') ? 'secondary' : 'ghost'}
            size="sm"
            className="gap-2"
            asChild
          >
            <Link to={`/journey/${journeyId}/docs`}>
              <FileText className="h-4 w-4" />
              Documentation
            </Link>
          </Button>
          <Button
            variant={isActive('replay') ? 'secondary' : 'ghost'}
            size="sm"
            className="gap-2"
            asChild
          >
            <Link to={`/journey/${journeyId}/replay`}>
              <Video className="h-4 w-4" />
              Replay
            </Link>
          </Button>
        </nav>
      </div>
    </div>
  );
}