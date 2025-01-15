'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  SkipBack,
  SkipForward,
  Video,
  Loader2
} from 'lucide-react';
import { JourneyStep } from '@/app/types';
import { useSearchParams } from 'next/navigation';

export default function ReplayPage({ params }: { params: { id: string } }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const searchParams = useSearchParams();
  const highlightedEventId = searchParams.get('event');

  useEffect(() => {
    async function fetchSteps() {
      try {
        const response = await fetch('https://circuit-webapp-backend-ggcjf7emdtd2dfdw.northcentralus-01.azurewebsites.net/get-journey-steps', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            journey_id: params.id
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          let foundVideoUrl = null;
          let allEvents: any[] = [];
          let videoStartTime = 0;
          
          // Find video URL and process events
          for (const step of data.steps) {
            for (const event of step.events) {
              if (event.id) {
                // Extract timestamp from video URL if available
                if (event.video_url) {
                  const matches = event.video_url.match(/__(\d+)\.webm$/);
                  if (matches && matches[1]) {
                    videoStartTime = parseInt(matches[1]);
                  }
                }

                allEvents.push({
                  ...event,
                  stepName: step.name,
                  timestamp: videoStartTime ? (parseInt(event.timestamp) - videoStartTime) / 1000 : 0
                });
                
                if (highlightedEventId && event.id === highlightedEventId && event.video_url) {
                  foundVideoUrl = event.video_url;
                } else if (!highlightedEventId && !foundVideoUrl && event.video_url) {
                  foundVideoUrl = event.video_url;
                }
              }
            }
          }

          // Sort events by timestamp
          allEvents.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
          
          setEvents(allEvents);
          setVideoUrl(foundVideoUrl);
        }
      } catch (error) {
        console.error('Failed to fetch journey steps:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSteps();
  }, [params.id, highlightedEventId]);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleEventClick = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      setCurrentTime(timestamp);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-muted-foreground">Loading recording...</span>
        </div>
      </div>
    );
  }

  if (!videoUrl) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">No Recording Available</h2>
          <p className="text-muted-foreground">
            There is no recording available for this journey.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Session Replay</h1>
        <p className="text-muted-foreground">
          Watch user interactions and analytics events
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6">
          <div className="aspect-video bg-muted rounded-lg mb-6 overflow-hidden">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain"
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {formatTime(currentTime)}
              </span>
              <span className="text-sm text-muted-foreground">
                {formatTime(duration)}
              </span>
            </div>

            <Slider
              value={[currentTime]}
              max={duration}
              step={0.1}
              onValueChange={handleSeek}
            />

            <div className="flex items-center justify-center gap-4">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = Math.max(0, currentTime - 10);
                  }
                }}
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = Math.min(duration, currentTime + 10);
                  }
                }}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Event Timeline</h2>
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                id={`event-${event.id}`}
                className={`flex items-center gap-4 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors ${
                  event.id === highlightedEventId ? 'bg-muted ring-2 ring-primary' : ''
                }`}
                style={{
                  opacity: currentTime >= (event.timestamp || 0) ? 1 : 0.5,
                }}
                onClick={() => handleEventClick(event.timestamp || 0)}
              >
                <div className="w-20 text-sm text-muted-foreground">
                  {formatTime(event.timestamp || 0)}
                </div>
                <div>
                  <div className="font-medium">{event.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Step: {event.stepName}
                  </div>
                  {event.status && (
                    <div className="text-sm text-muted-foreground">
                      Status: {event.status}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}