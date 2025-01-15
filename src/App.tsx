import { Routes, Route } from 'react-router-dom';
import { JourneySidebar } from '@/components/journey/journey-sidebar';
import JourneyLayout from '@/components/journey/journey-layout';
import HomePage from './pages/home';
import FlowchartPage from './pages/journey/[id]/flowchart';
import DocsPage from './pages/journey/[id]/docs';
import ReplayPage from './pages/journey/[id]/replay';

function App() {
  return (
    <div className="flex h-screen">
      <JourneySidebar />
      <main className="flex-1 overflow-y-auto pl-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/journey/:id" element={<JourneyLayout />}>
            <Route path="flowchart" element={<FlowchartPage />} />
            <Route path="docs" element={<DocsPage />} />
            <Route path="replay" element={<ReplayPage />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;