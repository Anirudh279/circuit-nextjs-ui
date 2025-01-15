import './globals.css';
import { Inter } from 'next/font/google';
import { JourneySidebar } from '@/components/journey/journey-sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'User Journey Manager',
  description: 'Manage and visualize user journeys',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen">
          <JourneySidebar />
          <main className="flex-1 overflow-y-auto pl-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}