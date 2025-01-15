import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Journey } from '@/types';
import { ChevronRight, Network, PanelLeftClose, PanelLeft, AlertCircle } from 'lucide-react';

interface APIJourney {
  id: string;
  name: string;
  description: string;
  step_count: string;
  updated_at: string;
}

const DEFAULT_ORG_ID = 'cd194f08-d52a-4ad2-a97a-0efaaebbb3ed';

export function JourneySidebar() {
  const location = useLocation();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
          const transformedJourneys: Journey[] = data.journeys.map((journey: APIJourney) => ({
            id: journey.id,
            name: journey.name,
            description: journey.description,
            createdAt: new Date(),
            updatedAt: new Date(journey.updated_at),
            tags: [`${journey.step_count} steps`],
          }));
          
          setJourneys(transformedJourneys);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        if (isMounted) {
          setError('Failed to load journeys');
          console.error('Failed to fetch journeys:', error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchJourneys();

    return () => {
      isMounted = false;
    };
  }, []);

  const isActive = (id: string) => location.pathname.includes(`/journey/${id}`);

  if (error) {
    return (
      <div className={cn(
        "relative h-screen border-r bg-background transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <div className="flex h-14 items-center px-4 border-b">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold">Journeys</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="p-4 text-center">
          <AlertCircle className="h-6 w-6 text-destructive mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Failed to load journeys</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={() => {
              setIsLoading(true);
              setError(null);
              window.location.reload();
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "relative h-screen border-r bg-background transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-14 items-center px-4 border-b">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold">Journeys</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-3.5rem)]">
        <div className="space-y-1 p-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : (
            journeys.map((journey) => (
              <Button
                key={journey.id}
                variant={isActive(journey.id) ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start gap-3',
                  isCollapsed ? 'px-2' : 'px-3 py-2'
                )}
                asChild
              >
                <Link to={`/journey/${journey.id}/flowchart`}>
                  <Network className="h-4 w-4 shrink-0" />
                  {!isCollapsed && (
                    <div className="flex flex-col items-start min-w-0">
                      <span className="text-sm font-medium truncate w-full">
                        {journey.name}
                      </span>
                      <span className="text-xs text-muted-foreground truncate w-full">
                        {journey.description}
                      </span>
                    </div>
                  )}
                </Link>
              </Button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}