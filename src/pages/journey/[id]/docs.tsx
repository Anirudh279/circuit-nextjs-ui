import { useParams, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AnalyticsEvent } from '@/types';

export default function DocsPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('event');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<AnalyticsEvent | null>(null);

  useEffect(() => {
    async function fetchEventDetails() {
      if (!eventId) {
        setIsLoading(false);
        return;
      }

      try {
        setError(null);
        setIsLoading(true);

        const response = await fetch('https://circuit-webapp-backend-ggcjf7emdtd2dfdw.northcentralus-01.azurewebsites.net/get-event-details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            journey_id: id,
            event_id: eventId
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success && data.event) {
          setEvent(data.event);
        } else {
          throw new Error(data.message || 'Failed to load event details');
        }
      } catch (error) {
        console.error('Failed to fetch event details:', error);
        setError('Unable to load event documentation. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchEventDetails();
  }, [id, eventId]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-muted-foreground">Loading documentation...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="border-b pb-4 mb-8">
          <h1 className="text-2xl font-bold">Event Documentation</h1>
          <p className="text-muted-foreground mt-2">
            View detailed event documentation and parameters
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground max-w-md mb-4">{error}</p>
          <Button 
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!eventId) {
    return (
      <div className="container py-8">
        <div className="border-b pb-4 mb-8">
          <h1 className="text-2xl font-bold">Event Documentation</h1>
          <p className="text-muted-foreground mt-2">
            Select an event from the flowchart to view its documentation
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No event selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="border-b pb-4 mb-8">
        <h1 className="text-2xl font-bold">Event Documentation</h1>
        <p className="text-muted-foreground mt-2">
          View detailed event documentation and parameters
        </p>
      </div>

      {event && (
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">{event.name}</h2>
                <p className="text-muted-foreground mt-1">{event.description}</p>
              </div>
              <Badge variant="secondary">{event.status}</Badge>
            </div>
          </div>

          {event.properties && event.properties.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Parameters</h3>
              <div className="grid gap-4">
                {event.properties.map((propertyGroup) => (
                  <div key={propertyGroup.name} className="space-y-4">
                    {propertyGroup.properties.map((param) => (
                      <div
                        key={param.name}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{param.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {param.description}
                            </p>
                          </div>
                          <Badge variant="outline" className="font-mono">
                            {param.type}
                          </Badge>
                        </div>
                        {param.value && (
                          <div className="pt-2 border-t">
                            <p className="text-sm font-medium">Example Value:</p>
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {param.value}
                            </code>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}