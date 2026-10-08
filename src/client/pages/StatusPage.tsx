import NowPlaying from '../components/NowPlaying';
import ScrobbleHistory from '../components/ScrobbleHistory';

export default function StatusPage() {
  return (
    <div className="space-y-6">
      <NowPlaying />
      <ScrobbleHistory />
    </div>
  );
}
