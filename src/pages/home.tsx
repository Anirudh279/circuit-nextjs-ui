import { JourneyList } from '@/components/journey/journey-list';

export default function HomePage() {
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