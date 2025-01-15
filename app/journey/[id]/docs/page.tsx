"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Activity, Video, ChevronDown } from "lucide-react";
import { JourneyStep } from "@/app/types";
import { useSearchParams, useParams } from "next/navigation";
import Link from "next/link";

function EventTable({
  event,
  isHighlighted,
}: {
  event: any;
  isHighlighted: boolean;
}) {
  const params = useParams();
  const [expandedProperties, setExpandedProperties] = useState<string[]>([]);

  if (!event.id) return null;

  // Sort properties by order if available
  const sortedProperties = event.properties?.map((group: any) => ({
    ...group,
    properties: [...group.properties].sort(
      (a: any, b: any) => (a.order || 0) - (b.order || 0)
    ),
  }));

  return (
    <div
      className={`space-y-4 p-4 rounded-lg transition-colors ${
        isHighlighted ? "bg-muted ring-2 ring-primary" : ""
      }`}
    >
      {sortedProperties?.map((propertyGroup: any, index: number) => (
        <div key={propertyGroup.name || index} className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-between p-2 h-auto hover:bg-muted"
            onClick={() => {
              setExpandedProperties((prev) =>
                prev.includes(propertyGroup.name)
                  ? prev.filter((name) => name !== propertyGroup.name)
                  : [...prev, propertyGroup.name]
              );
            }}
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {propertyGroup.name || "Properties"}
              </span>
              <Badge variant="outline" className="text-xs">
                {propertyGroup.properties.length} fields
              </Badge>
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                expandedProperties.includes(propertyGroup.name)
                  ? "transform rotate-180"
                  : ""
              }`}
            />
          </Button>

          {expandedProperties.includes(propertyGroup.name) && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Name</TableHead>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[150px]">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {propertyGroup.properties.map((param: any) => (
                  <TableRow key={param.name}>
                    <TableCell className="font-mono text-sm">
                      {param.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {param.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {param.description}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      <code className="px-1 py-0.5 bg-muted rounded">
                        {param.value || "-"}
                      </code>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      ))}

      {event.video_url && (
        <div className="flex justify-end pt-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/journey/${params.id}/replay?event=${event.id}`}>
              <Video className="h-4 w-4 mr-2" />
              View Recording
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

export default function DocsPage({ params }: { params: { id: string } }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [steps, setSteps] = useState<JourneyStep[]>([]);
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const highlightedEventId = searchParams.get("event");

  useEffect(() => {
    async function fetchSteps() {
      try {
        const response = await fetch(
          "https://circuit-webapp-backend-ggcjf7emdtd2dfdw.northcentralus-01.azurewebsites.net/get-journey-steps",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              journey_id: params.id,
            }),
          }
        );

        const data = await response.json();

        if (data.success) {
          // Sort steps by order
          const sortedSteps = [...data.steps].sort(
            (a: JourneyStep, b: JourneyStep) => (a.order || 0) - (b.order || 0)
          );

          // Sort events within each step by timestamp
          const stepsWithSortedEvents = sortedSteps.map((step) => ({
            ...step,
            events: [...step.events].sort(
              (a, b) => (a.timestamp || 0) - (b.timestamp || 0)
            ),
          }));

          setSteps(stepsWithSortedEvents);

          if (highlightedEventId) {
            const stepWithEvent = stepsWithSortedEvents.find(
              (step: JourneyStep) =>
                step.events.some((event) => event.id === highlightedEventId)
            );
            if (stepWithEvent) {
              setExpandedSteps([stepWithEvent.id]);
              setTimeout(() => {
                const element = document.getElementById(
                  `event-${highlightedEventId}`
                );
                if (element) {
                  element.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }
              }, 100);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch journey steps:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSteps();
  }, [params.id, highlightedEventId]);

  const filteredSteps = steps.filter(
    (step) =>
      step.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      step.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      step.events.some(
        (event) =>
          event.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span className="text-muted-foreground">
            Loading documentation...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Journey Documentation</h1>
          <p className="text-muted-foreground">
            Analytics events and documentation for each step
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search steps and events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Card className="p-6">
          <Accordion
            type="multiple"
            value={expandedSteps}
            onValueChange={setExpandedSteps}
            className="w-full"
          >
            {filteredSteps.map((step) => (
              <AccordionItem key={step.id} value={step.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col items-start">
                      <div className="font-semibold">{step.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {step.description}
                      </div>
                    </div>
                    {step.events.some((event) => event.id) && (
                      <Badge variant="secondary">
                        <Activity className="h-3 w-3 mr-1" />
                        {step.events.filter((event) => event.id).length} Event
                        {step.events.filter((event) => event.id).length !== 1
                          ? "s"
                          : ""}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-4 space-y-6">
                    {step.events.some((event) => event.id) ? (
                      step.events.map(
                        (event) =>
                          event.id && (
                            <div
                              key={event.id}
                              id={`event-${event.id}`}
                              className="space-y-4"
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold">
                                    {event.name}
                                  </h3>
                                  <p className="text-muted-foreground">
                                    {event.description}
                                  </p>
                                  {event.status && (
                                    <Badge variant="outline" className="mt-2">
                                      {event.status}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <EventTable
                                event={event}
                                isHighlighted={event.id === highlightedEventId}
                              />
                            </div>
                          )
                      )
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Activity className="h-8 w-8 mx-auto mb-4 opacity-50" />
                        <p>No analytics events configured for this step</p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </div>
    </div>
  );
}
