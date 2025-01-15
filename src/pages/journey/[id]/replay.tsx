import { useParams, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, Play, Pause, RotateCcw, Video } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SessionRecording } from '@/types';

export default function ReplayPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('event');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recording, setRecording] = useState<SessionRecording | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    async function fetchRecording() {
      if (!eventId) {
        setIsLoading(false);
        return;
      }

      try {
        setError(null);
        setIsLoading(true);

        const response = await fetch('https://circuit-webapp-backend-ggcjf7emdtd2dfdw.northcentralus-01.azurewebsites.net/get-session-recording', {
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
        
        if (data.success && data.recording) {
          setRecording(data.recording);
        } else if (data.message === 'No recording found') {
          setError('No recording is available for this event.');
        } else {
          throw new Error(data.message || 'Failed to load recording');
        }
      } catch (error) {
        console.error('Failed to fetch recording:', error);
        if (error instanceof Error && error.message === 'No recording found') {
          setError('No recording is available for this event.');
        } else {
          setError('Unable to load the session recording. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecording();
  }, [id, eventId]);

  useEffect(() => {
    let interval: number | undefined;

    if (isPlaying && recording) {
      interval = window.setInterval(() => {
        setCurrentTime((time) => {
          const newTime = time + 100;
          if (newTime >= recording.duration) {
            setIsPlaying(false);
            return recording.duration;
          }
          return newTime;
        });
      }, 100);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, recording]);

  const handlePlayPause = () => {
    if (currentTime >= (recording?.duration || 0)) {
      setCurrentTime(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentTime(0);
    setIsPlaying(false);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-muted-foreground">Loading recording...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="border-b pb-4 mb-8">
          <h1 className="text-2xl font-bold">Session Recording</h1>
          <p className="text-muted-foreground mt-2">
            View session recording details and timeline
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {error === 'No recording is available for this event.' ? 'No Recording Available' : 'Something went wrong'}
          </h2>
          <p className="text-muted-foreground max-w-md mb-4">{error}</p>
          {error !== 'No recording is available for this event.' && (
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!eventId) {
    return (
      <div className="container py-8">
        <div className="border-b pb-4 mb-8">
          <h1 className="text-2xl font-bold">Session Recording</h1>
          <p className="text-muted-foreground mt-2">
            Select an event from the flowchart to view its recording
          </p>
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Video className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No event selected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="border-b pb-4 mb-8">
        <h1 className="text-2xl font-bold">Session Recording</h1>
        <p className="text-muted-foreground mt-2">
          View session recording details and timeline
        </p>
      </div>

      {recording && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">
                Recording from {new Date(recording.startTime).toLocaleString()}
              </h2>
              <p className="text-muted-foreground">
                Duration: {(recording.duration / 1000).toFixed(1)}s
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleReset}
                disabled={currentTime === 0}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button onClick={handlePlayPause}>
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-100"
                style={{
                  width: `${(currentTime / recording.duration) * 100}%`,
                }}
              />
            </div>

            <div className="space-y-4">
              {recording.events.map((event) => {
                const eventTime = event.timestamp - recording.startTime.getTime();
                const isActive = currentTime >= eventTime;
                
                return (
                  <div
                    key={event.eventId}
                    className={`border rounded-lg p-4 transition-colors ${
                      isActive ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{event.eventId}</h3>
                      <Badge variant="secondary">
                        {(eventTime / 1000).toFixed(2)}s
                      </Badge>
                    </div>
                    {event.parameters && Object.entries(event.parameters).length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Parameters:</p>
                        <div className="grid gap-2">
                          {Object.entries(event.parameters).map(([key, value]) => (
                            <div
                              key={key}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="text-muted-foreground">{key}:</span>
                              <code className="bg-muted px-2 py-0.5 rounded">
                                {JSON.stringify(value)}
                              </code>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}