'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AdminPrompt from '@/app/components/AdminPrompt';
import { useDistractMode } from '@/app/components/distractMode';

const FRAMES = [
  '/capy/capy1.png',
  '/capy/capy2.png',
  '/capy/capy3.png',
  '/capy/capy4.png',
];
// Croc scene: two 120x60 layers sharing the same origin (capy lies on the croc's back).
const CROC_FRAMES  = [1, 2, 3, 4].map((n) => `/croc/croc${n}.png`);
const LYING_FRAMES = [1, 2, 3, 4].map((n) => `/capy/lying${n}.png`);

const SPEED   = 2.0;   // px per movement tick (~60fps)
const FPS     = 8;     // animation frame swaps per second
const SCENE_FPS = 3;   // croc scene frame swaps per second
const SIZE    = 200;   // display width in px
const SCALE   = SIZE / 80;
// Sprites are 80x60 px, with ~3 transparent rows under the paws.
const HEIGHT     = Math.round(SIZE * 60 / 80);     // keep the 4:3 aspect ratio
const BOTTOM_PAD = Math.round(3 * SCALE);          // transparent padding, scaled
// Croc scene layers (120x60 px)
const SCENE_W    = 120 * SCALE;
const SCENE_H    = 60 * SCALE;
const CROC_PAD   = 1 * SCALE;      // rows under the croc's feet
const LYING_PAD  = 13 * SCALE;     // rows under the lying capy (without croc)
const CROC_HIDDEN = -50;           // rise (px) at which the croc is fully below the floor
const RISE_SPEED  = 1.2;           // px per tick while the croc emerges / sinks
const RIDE_MS     = 4000;          // how long the capy rides the croc
const WALK_MS     = 5000;          // walking time between croc appearances
// Horizontal centre of each capy inside its sprite box (px), to line up the swap.
const WALK_CX  = 41 * SCALE;
const LYING_CX = 60 * SCALE;

const TICK_MS = 16;    // movement interval (~60fps)
const CLICKS_NEEDED = 5;     // clicks on the capybara to open the admin prompt
const CLICK_GAP_MS  = 2000;  // max pause between clicks before the count resets

type Phase = 'walk' | 'rise' | 'ride' | 'sink';

export default function CapyWalker() {
  const [frame, setFrame] = useState(0);
  const [sceneFrame, setSceneFrame] = useState(0);
  // Starts asleep on the croc; posX is set to the screen centre on mount.
  const [posX,  setPosX]  = useState(-9999);
  const [flipX, setFlipX] = useState(false);
  const [phase, setPhase] = useState<Phase>('ride');
  const [rise,  setRise]  = useState(0);   // croc height above its rest position
  const dirRef             = useRef<1 | -1>(1);
  const xRef               = useRef(-9999);
  const phaseRef           = useRef<Phase>('ride');
  const riseRef            = useRef(0);
  const rideLeft           = useRef(RIDE_MS);
  const walkLeft           = useRef(WALK_MS);
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

  const distract  = useDistractMode();
  const activeRef = useRef(true);   // false while distract mode is off (frozen)
  const go = (p: Phase) => { phaseRef.current = p; setPhase(p); };

  // Movement + croc scene loop — starts immediately on mount
  useEffect(() => {
    [...CROC_FRAMES, ...LYING_FRAMES].forEach((src) => { const i = new window.Image(); i.src = src; });

    xRef.current = Math.round(window.innerWidth / 2 - SIZE / 2);
    setPosX(xRef.current);

    // The whole croc scene must be on screen (otherwise the croc's head gets cut).
    const sceneFits = (x: number, w: number) => {
      const flipped = dirRef.current === -1;
      const sx = x + (flipped ? SIZE - WALK_CX : WALK_CX) - (flipped ? SCENE_W - LYING_CX : LYING_CX);
      return sx >= 0 && sx + SCENE_W <= w;
    };

    moveTimer.current = setInterval(() => {
      if (!activeRef.current) return;
      switch (phaseRef.current) {
        case 'walk': {
          if (pausedRef.current) return;
          const w = window.innerWidth;
          xRef.current += SPEED * dirRef.current;
          // Turn around at the screen edges
          if (xRef.current >= w - SIZE) {
            xRef.current = w - SIZE;
            dirRef.current = -1;
            setFlipX(true);
          } else if (xRef.current <= 0) {
            xRef.current = 0;
            dirRef.current = 1;
            setFlipX(false);
          }
          walkLeft.current -= TICK_MS;
          // Every few seconds the croc comes out and the capy naps on it
          // (waits until there's room so the croc isn't cut off by an edge).
          if (walkLeft.current <= 0 && sceneFits(xRef.current, w)) {
            pausedRef.current = false; // the hovered sprite unmounts, so no pointerleave
            riseRef.current = CROC_HIDDEN;
            setRise(CROC_HIDDEN);
            go('rise');
          }
          setPosX(xRef.current);
          break;
        }
        case 'rise': {
          riseRef.current = Math.min(0, riseRef.current + RISE_SPEED);
          setRise(riseRef.current);
          if (riseRef.current >= 0) { rideLeft.current = RIDE_MS; go('ride'); }
          break;
        }
        case 'ride': {
          rideLeft.current -= TICK_MS;
          if (rideLeft.current <= 0) go('sink');
          break;
        }
        case 'sink': {
          riseRef.current = Math.max(CROC_HIDDEN, riseRef.current - RISE_SPEED);
          setRise(riseRef.current);
          if (riseRef.current <= CROC_HIDDEN) {
            // Croc is gone: wake up and keep walking.
            walkLeft.current = WALK_MS;
            go('walk');
          }
          break;
        }
      }
    }, TICK_MS);

    return () => { if (moveTimer.current) clearInterval(moveTimer.current); };
     
  }, []);

  // Distract mode off: park asleep on the croc at the right edge, frozen.
  // Back on: the current nap finishes and the capy starts walking again.
  useEffect(() => {
    activeRef.current = distract;
    if (distract) return;
    const park = () => {
      // Unflipped (facing the centre); place the scene flush with the right edge.
      dirRef.current = 1;
      setFlipX(false);
      xRef.current = window.innerWidth - SCENE_W - WALK_CX + LYING_CX;
      setPosX(xRef.current);
      riseRef.current = 0;
      setRise(0);
      rideLeft.current = RIDE_MS;
      pausedRef.current = false;
      setSceneFrame(0);
      go('ride');
    };
    park();
    window.addEventListener('resize', park);
    return () => window.removeEventListener('resize', park);
     
  }, [distract]);

  // Frame cycle — independent of position
  useEffect(() => {
    frameTimer.current = setInterval(() => {
      if (activeRef.current) setFrame((f) => (f + 1) % FRAMES.length);
    }, 1000 / FPS);
    const sceneTimer = setInterval(() => {
      if (activeRef.current) setSceneFrame((f) => (f + 1) % CROC_FRAMES.length);
    }, 1000 / SCENE_FPS);

    return () => {
      if (frameTimer.current) clearInterval(frameTimer.current);
      clearInterval(sceneTimer);
    };
  }, []);

  // Croc scene geometry: line the lying capy up with where the walking capy stood.
  const walkCx  = flipX ? SIZE - WALK_CX : WALK_CX;
  const lyingCx = flipX ? SCENE_W - LYING_CX : LYING_CX;
  const sceneX  = posX + walkCx - lyingCx;
  const crocBottom  = rise - CROC_PAD;
  // The capy lies on the floor until the croc's back reaches it, then rides up.
  const lyingBottom = Math.max(crocBottom, -LYING_PAD);
  const flip = flipX ? 'scaleX(-1)' : 'scaleX(1)';
  const layer = (bottom: number) => ({
    left: sceneX, bottom, width: SCENE_W, height: SCENE_H, transform: flip,
  });

  return (
    <>
    {phase === 'walk' ? (
      <div
        aria-hidden="true"
        className="fixed z-[9999] pointer-events-none select-none"
        style={{
          left:      posX,
          bottom:    -BOTTOM_PAD, // offset transparent padding so paws touch the floor
          width:     SIZE,
          height:    HEIGHT,
          transform: flip,
        }}
      >
        <Image
          src={FRAMES[frame]}
          alt=""
          width={SIZE}
          height={HEIGHT}
          style={{ display: 'block', width: SIZE, height: HEIGHT, imageRendering: 'pixelated', pointerEvents: 'auto', cursor: 'pointer' }}
          onPointerEnter={() => { pausedRef.current = true; }}
          onPointerLeave={() => { pausedRef.current = false; }}
          onClick={handleClick}
          draggable={false}
          priority
          unoptimized
        />
      </div>
    ) : (
      <>
        <div aria-hidden="true" className="fixed z-[9998] pointer-events-none select-none" style={layer(crocBottom)}>
          <Image src={CROC_FRAMES[sceneFrame]} alt="" width={SCENE_W} height={SCENE_H}
            style={{ display: 'block', width: SCENE_W, height: SCENE_H, imageRendering: 'pixelated' }}
            draggable={false} unoptimized />
        </div>
        <div aria-hidden="true" className="fixed z-[9999] pointer-events-none select-none" style={layer(lyingBottom)}>
          <Image src={LYING_FRAMES[sceneFrame]} alt="" width={SCENE_W} height={SCENE_H}
            style={{ display: 'block', width: SCENE_W, height: SCENE_H, imageRendering: 'pixelated' }}
            draggable={false} unoptimized />
        </div>
      </>
    )}
    {prompt && <AdminPrompt onClose={() => setPrompt(false)} />}
    </>
  );
}
