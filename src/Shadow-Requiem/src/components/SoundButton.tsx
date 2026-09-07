import React, { useState, useEffect } from 'react';
import { sound } from '../game/audio';
import { Volume2, VolumeX } from 'lucide-react';

interface SoundButtonProps {
  id?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SoundButton: React.FC<SoundButtonProps> = ({
  id = 'sound-toggle-btn',
  showLabel = true,
  size = 'md',
  className = '',
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());

  useEffect(() => {
    // Automatically subscribe to sound engine mute state
    const unsubscribe = sound.subscribeMute((muted) => {
      setIsMuted(muted);
    });
    return unsubscribe;
  }, []);

  const handleToggle = () => {
    sound.toggleMute();
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-3 py-1.5 text-xs gap-2',
    lg: 'px-4 py-2 text-sm gap-2.5',
  }[size];

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }[size];

  return (
    <button
      id={id}
      type="button"
      onClick={handleToggle}
      title={isMuted ? 'Sound is Muted (Click to enable audio)' : 'Sound is Enabled (Click to mute)'}
      aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
      className={`relative inline-flex items-center justify-center font-cinzel font-bold rounded-xl border transition-all duration-200 select-none shadow-sm ${sizeClasses} ${
        isMuted
          ? 'bg-neutral-900/90 hover:bg-neutral-800 border-neutral-700/80 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600'
          : 'bg-emerald-950/40 hover:bg-emerald-900/50 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
      } ${className}`}
    >
      {isMuted ? (
        <>
          <VolumeX className={`${iconSizes} text-rose-400 transition-transform active:scale-90`} />
          {showLabel && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-300">
              Muted
            </span>
          )}
        </>
      ) : (
        <>
          <Volume2 className={`${iconSizes} text-emerald-400 transition-transform active:scale-110`} />
          {showLabel && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
              Sound On
            </span>
          )}
        </>
      )}
    </button>
  );
};
