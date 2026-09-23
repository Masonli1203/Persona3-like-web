'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { MuxPlayerRefAttributes } from '@mux/mux-player-react';
import { usePageTransition } from '@/components/page-transition';
import { CreativeVisual } from '@/components/creative/creative-visual';
import type { CreativeCategory } from '@/data/creativeProjects';
import styles from '@/components/creative/creative.module.css';

const MuxPlayer = dynamic(() => import('@mux/mux-player-react'), { ssr: false });
const autoplayQuery =
  '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';
function subscribeAutoplay(callback: () => void) {
  const query = window.matchMedia(autoplayQuery);
  query.addEventListener('change', callback);
  document.addEventListener('visibilitychange', callback);
  return () => {
    query.removeEventListener('change', callback);
    document.removeEventListener('visibilitychange', callback);
  };
}
const canAutoplay = () =>
  window.matchMedia(autoplayQuery).matches && document.visibilityState === 'visible';
const serverAutoplay = () => false;
type Props = {
  playbackId?: string;
  title: string;
  poster?: string;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  className?: string;
  category?: CreativeCategory;
};

export function MuxVideoPlayer({
  playbackId,
  title,
  poster,
  autoplay = false,
  muted = false,
  loop = false,
  controls = true,
  className = '',
  category = 'vfx-film',
}: Props) {
  const frame = useRef<HTMLDivElement>(null);
  const player = useRef<MuxPlayerRefAttributes>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(false);
  const allowed = useSyncExternalStore(subscribeAutoplay, canAutoplay, serverAutoplay);
  const { motionOff } = usePageTransition();
  const shouldAutoplay = autoplay && allowed && !motionOff && visible;

  useEffect(() => {
    if (!frame.current || !playbackId) return;
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting) setMounted(true);
    });
    observer.observe(frame.current);
    return () => observer.disconnect();
  }, [playbackId]);
  useEffect(() => {
    if (autoplay && !shouldAutoplay) player.current?.pause();
  }, [autoplay, shouldAutoplay]);

  return (
    <div ref={frame} className={`${styles.player} ${className}`}>
      <CreativeVisual title={title} category={category} coverImage={poster} />
      {playbackId && mounted && (
        <div inert={!controls} aria-hidden={!controls || undefined}>
          <MuxPlayer
            ref={player}
            key={playbackId}
            playbackId={playbackId}
            title={title}
            poster={poster || undefined}
            streamType="on-demand"
            preload="none"
            autoPlay={shouldAutoplay ? 'muted' : false}
            muted={muted || autoplay}
            loop={loop}
            nohotkeys={!controls}
            metadata={{ video_id: playbackId, video_title: title }}
            accentColor="#164bfa"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              '--controls': controls ? undefined : 'none',
            }}
            onError={() => setError(true)}
            onPlaying={() => setError(false)}
          />
        </div>
      )}
      {(!playbackId || error) && (
        <p className={styles.playerMessage} role={error ? 'status' : undefined}>
          {error ? 'This video is unavailable. Please try again later.' : 'Film coming soon.'}
        </p>
      )}
    </div>
  );
}
