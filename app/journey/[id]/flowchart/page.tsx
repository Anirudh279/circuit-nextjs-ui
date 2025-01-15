'use client';

import { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  Handle,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Save, Activity, FileText, Video, AlertCircle, Loader2 } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { AnalyticsEvent, JourneyStep } from '@/app/types';
import Link from 'next/link';

function CustomNode({ data, isConnectable }: any) {
  const events = data.events || [];
  
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2 !bg-primary"
      />
      <div className="relative">
        <HoverCard>
          <HoverCardTrigger asChild>
            <div className="relative bg-white dark:bg-gray-800 border-2 border-primary rounded-md px-4 py-2 shadow-sm min-w-[200px]">
              <div className="flex items-center gap-2">
                {data.label}
                {events.length > 0 && events[0].id && (
                  <Badge variant="secondary" className="text-xs">
                    <Activity className="h-3 w-3 mr-1" />
                    {events.length}
                  </Badge>
                )}
              </div>
            </div>
          </HoverCardTrigger>
          <HoverCardContent 
            side="right" 
            align="start" 
            className="w-[400px] p-4"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <h4 className="text-lg font-semibold">{data.label}</h4>
                {events.length > 0 && events[0].id && (
                  <Badge variant="secondary">
                    {events.length} Event{events.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              <div className="space-y-4">
                {events.map((event: AnalyticsEvent) => event.id && (
                  <div key={event.id} className="space-y-3 pb-4 border-b last:border-0 last:pb-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{event.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {event.status}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" asChild className="h-6 w-6">
                          <Link href={`/journey/${data.journeyId}/docs?event=${event.id}`}>
                            <FileText className="h-3 w-3" />
                          </Link>
                        </Button>
                        {event.video_url && (
                          <Button variant="ghost" size="icon" asChild className="h-6 w-6">
                            <Link href={`/journey/${data.journeyId}/replay?event=${event.id}`}>
                              <Video className="h-3 w-3" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>

                    {event.properties && event.properties[0]?.properties && (
                      <div className="flex flex-wrap gap-1.5">
                        {event.properties[0].properties.map((param) => (
                          <Badge 
                            key={param.name}
                            variant="outline" 
                            className="text-xs font-mono"
                          >
                            {param.name}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2 !bg-primary"
      />
    </>
  );
}

const nodeTypes = {
  custom: CustomNode,
};

export default function FlowchartPage({ params }: { params: { id: string } }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSteps() {
      try {
        setError(null);
        setIsLoading(true);

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
          const sortedSteps = [...data.steps].sort((a: JourneyStep, b: JourneyStep) => 
            (a.order || 0) - (b.order || 0)
          );

          const totalSteps = sortedSteps.length;
          const verticalSpacing = Math.min(120, Math.max(80, 800 / totalSteps));

          const newNodes: Node[] = sortedSteps.map((step: JourneyStep, index: number) => ({
            id: step.id,
            type: 'custom',
            data: { 
              label: step.name,
              events: step.events,
              order: step.order,
              journeyId: params.id
            },
            position: { 
              x: 250,
              y: index * verticalSpacing
            },
          }));

          const newEdges: Edge[] = sortedSteps.slice(0, -1).map((step: JourneyStep, index: number) => ({
            id: `e${step.id}-${sortedSteps[index + 1].id}`,
            source: step.id,
            target: sortedSteps[index + 1].id,
            animated: true,
            style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: 'hsl(var(--primary))',
            },
          }));

          setNodes(newNodes);
          setEdges(newEdges);
        }
      } catch (error) {
        console.error('Failed to fetch journey steps:', error);
        setError('Failed to load flowchart');
      } finally {
        setIsLoading(false);
      }
    }

    fetchSteps();
  }, [params.id]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({
        ...connection,
        animated: true,
        style: { stroke: 'hsl(var(--primary))', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: 'hsl(var(--primary))',
        },
      }, eds));
    },
    [setEdges]
  );

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-muted-foreground">Loading flowchart...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900">
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
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      <div className="border-b p-4 flex items-center justify-between bg-white dark:bg-gray-900">
        <div>
          <h1 className="text-2xl font-bold">User Journey Flowchart</h1>
          <p className="text-muted-foreground">
            Visualize and edit the user journey flow
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
      
      <div className="flex-1 w-full bg-white dark:bg-gray-900">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-white dark:bg-gray-900"
        >
          <Background color="#999" gap={16} />
          <Controls className="bg-white dark:bg-gray-800 border shadow-sm" />
          <MiniMap
            className="bg-white dark:bg-gray-800 border shadow-sm"
            nodeColor="#000000"
            maskColor="rgba(0, 0, 0, 0.1)"
          />
        </ReactFlow>
      </div>
    </div>
  );
}