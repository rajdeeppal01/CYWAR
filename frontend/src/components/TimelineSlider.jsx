import React, { useState } from 'react';
import { Play, Pause, Clock, SkipBack, SkipForward } from 'lucide-react';

export default function TimelineSlider({ packets, playbackCursor, setPlaybackCursor }) {
  const [isPlaying, setIsPlaying] = useState(true);

  const totalPackets = packets.length;
  // We must call hooks before any early return.
  const currentIdx = playbackCursor === null ? totalPackets - 1 : playbackCursor;

  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (val === totalPackets - 1) {
      setPlaybackCursor(null); // Back to live
      setIsPlaying(true);
    } else {
      setPlaybackCursor(val);
      setIsPlaying(false); // Auto pause when seeking
    }
  };

  const handlePlayPause = () => {
    if (!isPlaying && playbackCursor !== null) {
      // If we are at the end, set to live
      if (playbackCursor >= totalPackets - 1) {
        setPlaybackCursor(null);
      }
    }
    setIsPlaying(!isPlaying);
  };

  // Auto-advance if playing but not live
  React.useEffect(() => {
    let interval;
    if (isPlaying && playbackCursor !== null) {
      interval = setInterval(() => {
        setPlaybackCursor(prev => {
          if (prev >= totalPackets - 2) {
            setIsPlaying(true);
            return null; // snap back to live
          }
          return prev + 1;
        });
      }, 500); // Advance 1 packet every 500ms
    }
    return () => clearInterval(interval);
  }, [isPlaying, playbackCursor, totalPackets, setPlaybackCursor]);

  // If we don't have enough history, don't show the slider yet
  if (totalPackets < 20) return null;

  return (
    <div className="cyber-panel pad-md flex flex-col gap-sm w-full">
      <div className="flex justify-between items-center text-sm font-mono text-slate-300 border-b border-white-trans-5 pb-2">
        <div className="flex items-center gap-2">
          <button onClick={handlePlayPause} className="hover:text-white transition-colors bg-white-trans-5 p-1 rounded">
            {isPlaying && playbackCursor === null ? <Pause size={14} /> : <Play size={14} className="text-[var(--neon-cyan)]" />}
          </button>
          <span>{playbackCursor === null ? 'LIVE' : `HISTORICAL: -${totalPackets - currentIdx} pkts`}</span>
        </div>
        <div className="flex items-center gap-1 text-[var(--neon-cyan)]">
          <Clock size={12} />
          {packets[currentIdx]?.timestamp || '00:00:00'}
        </div>
      </div>
      <input 
        type="range" 
        min="0" 
        max={totalPackets - 1} 
        value={currentIdx} 
        onChange={handleSliderChange}
        className="w-full accent-[var(--neon-cyan)] cursor-pointer h-1 bg-slate-800 rounded appearance-none"
        style={{ WebkitAppearance: 'none' }}
      />
    </div>
  );
}
