export interface Journey {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface JourneyStep {
  id: string;
  name: string;
  order: number;
  description: string;
  events: AnalyticsEvent[];
}

export interface AnalyticsEvent {
  id: string | null;
  name: string | null;
  description: string | null;
  status: string | null;
  video_url: string | null;
  timestamp: number | null;
  properties: EventProperties[] | null;
}

export interface EventProperties {
  name: string;
  properties: EventParameter[];
}

export interface EventParameter {
  name: string;
  type: string;
  description: string;
  value: string;
}

export interface SessionRecording {
  id: string;
  journeyId: string;
  startTime: Date;
  duration: number;
  events: RecordedEvent[];
}

export interface RecordedEvent {
  eventId: string;
  timestamp: number;
  parameters: Record<string, any>;
}