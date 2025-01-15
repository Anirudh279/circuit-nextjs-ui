"use client";

import { JourneyNav } from "@/components/journey/journey-nav";

export default function JourneyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  return (
    <>
      <JourneyNav journeyId={params.id} />
      <main>{children}</main>
    </>
  );
}
