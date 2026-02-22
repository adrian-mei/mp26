import { Library } from './components/Library';
import { Player } from './components/Player';
import { useAudio } from './hooks/useAudio';

export default function App() {
  // Initialize audio hook globally
  useAudio();

  return (
    <div className="h-screen w-screen overflow-hidden bg-black text-white font-sans selection:bg-emerald-500/30">
      <Library />
      <Player />
    </div>
  );
}
