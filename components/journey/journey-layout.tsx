import { useParams, Outlet } from 'react-router-dom';
import { JourneyNav } from './journey-nav';

export default function JourneyLayout() {
  const { id } = useParams();

  return (
    <>
      <JourneyNav journeyId={id!} />
      <Outlet />
    </>
  );
}