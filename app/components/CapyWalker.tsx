'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AdminPrompt from '@/app/components/AdminPrompt';

const FRAMES = [
  '/capy/capy1.png',
  '/capy/capy2.png',
  '/capy/capy3.png',
  '/capy/capy4.png',
];

const SPEED   = 2.0;   // px per movement tick (~60fps)
const FPS     = 8;     // animation frame swaps per second
const SIZE    = 200;   // display size in px
const TICK_MS = 16;    // movement interval (~60fps)
const CLICKS_NEEDED = 5;     // clicks on the capybara to open the admin prompt
const CLICK_GAP_MS  = 2000;  // max pause between clicks before the count resets

export default function CapyWalker() {
  const [frame, setFrame] = useState(0);
  const [posX,  setPosX]  = useState(-SIZE);
  const [flipX, setFlipX] = useState(false);
  const dirRef             = useRef<1 | -1>(1);
  const xRef               = useRef(-SIZE);
  const moveTimer          = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameTimer         = useRef<ReturnType<typeof setInterval> | null>(null);
  const pausedRef          = useRef(false); // true while the pointer is over the capybara
  const router             = useRouter();
  const clicks             = useRef({ count: 0, last: 0 });
  const [prompt, setPrompt] = useState(false);

  const handleClick = async () => {
    const now = Date.now();
    const c = clicks.current;
    c.count = now - c.last > CLICK_GAP_MS ? 1 : c.count + 1;
    c.last = now;
    if (c.count < CLICKS_NEEDED) return;
    c.count = 0;
    // Already logged in? Go straight to the dashboard.
    try {
      const res = await fetch('/api/auth/session', { cache: 'no-store' });
      if (res.ok && (await res.json()).authenticated) {
        router.push('/admin');
        return;
      }
    } catch {}
    setPrompt(true);
  };

  // Movement loop — starts immediately on mount
  useEffect(() => {
    moveTimer.current = setInterval(() => {
      if (pausedRef.current) return;
      const w = window.innerWidth;
      xRef.current += SPEED * dirRef.current;

      if (xRef.current >= w + 10) {
        dirRef.current = -1;
        setFlipX(true);
      } else if (xRef.current <= -SIZE - 10) {
        dirRef.current = 1;
        setFlipX(false);
      }

      setPosX(xRef.current);
    }, TICK_MS);

    return () => { if (moveTimer.current) clearInterval(moveTimer.current); };
  }, []);

  // Frame cycle — independent of position
  useEffect(() => {
    frameTimer.current = setInterval(() => {
      setFrame((f) => (f + 1) % FRAMES.length);
    }, 1000 / FPS);

    return () => { if (frameTimer.current) clearInterval(frameTimer.current); };
  }, []);

  return (
    <>
    <div
      aria-hidden="true"
      className="fixed z-[9999] pointer-events-none select-none"
      style={{
        left:      posX,
        bottom:    -18,    // offset transparent padding so paws touch the floor
        width:     SIZE,
        height:    SIZE,
        transform: flipX ? 'scaleX(-1)' : 'scaleX(1)',
      }}
    >
      <Image
        src={FRAMES[frame]}
        alt=""
        width={SIZE}
        height={SIZE}
        style={{ imageRendering: 'pixelated', pointerEvents: 'auto', cursor: 'pointer' }}
        onPointerEnter={() => { pausedRef.current = true; }}
        onPointerLeave={() => { pausedRef.current = false; }}
        onClick={handleClick}
        draggable={false}
        priority
        unoptimized
      />
    </div>
    {prompt && <AdminPrompt onClose={() => setPrompt(false)} />}
    </>
  );
}
