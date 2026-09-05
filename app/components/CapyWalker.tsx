'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

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

export default function CapyWalker() {
  const [frame, setFrame] = useState(0);
  const [posX,  setPosX]  = useState(-SIZE);
  const [flipX, setFlipX] = useState(false);
  const dirRef             = useRef<1 | -1>(1);
  const xRef               = useRef(-SIZE);
  const moveTimer          = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameTimer         = useRef<ReturnType<typeof setInterval> | null>(null);

  // Movement loop — starts immediately on mount
  useEffect(() => {
    moveTimer.current = setInterval(() => {
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
        style={{ imageRendering: 'pixelated' }}
        priority
        unoptimized
      />
    </div>
  );
}
