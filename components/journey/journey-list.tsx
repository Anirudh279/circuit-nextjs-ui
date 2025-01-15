'use client';

import { Journey } from '@/app/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, FileText, Video, Network, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface APIJourney {
  id: string;
  name: string;
  description: string;
  step_count: string;
  updated_at: string;
}

const DEFAULT_ORG_ID = 'cd194f08-d52a-4ad2-a97a-0efaaebbb3ed';

export function JourneyList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJourneys = async () => {
    try {
      setError(null);
      setIsLoading(true);
      
      const orgId = localStorage.getItem('org_id') || DEFAULT_ORG_ID;
      localStorage.setItem('org_id', orgId); // Ensure org_id is always set

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
      
      if (data.success) {
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
      setError('Failed to load journeys');
      console.error('Failed to fetch journeys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initFetch = async () => {
      try {
        await fetchJourneys();
      } catch (error) {
        if (isMounted) {
          console.error('Failed to initialize journeys:', error);
        }
      }
    };

    initFetch();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredJourneys = journeys.filter((journey) =>
    journey.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    journey.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-lg font-medium">{error}</p>
        <Button 
          variant="outline"
          onClick={fetchJourneys}
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search journeys..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Steps</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <span className="text-muted-foreground">Loading journeys...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredJourneys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <p className="text-muted-foreground">No journeys found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredJourneys.map((journey) => (
                <TableRow key={journey.id}>
                  <TableCell className="font-medium">{journey.name}</TableCell>
                  <TableCell>{journey.description}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {journey.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {journey.updatedAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/journey/${journey.id}/flowchart`}>
                          <Network className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/journey/${journey.id}/docs`}>
                          <FileText className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/journey/${journey.id}/replay`}>
                          <Video className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}