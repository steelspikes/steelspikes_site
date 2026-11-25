'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useDistractMode, parkedParrotPerch } from '@/app/components/distractMode';

// Sprites are 80x60 px, facing left.
const FLY   = [1, 2, 3, 4].map((n) => `/parrot/fly${n}.png`);
const TIRED = [1, 2, 3, 4].map((n) => `/parrot/tired${n}.png`);
const STAND = '/parrot/parrot1.png';
const BLINK = '/parrot/parrot6.png';
const PERCH = '/parrot/perch.png';   // sitting, legs tucked (distract mode off)

const SIZE       = 200;                         // display width in px
const SCALE      = SIZE / 80;
const HEIGHT     = Math.round(60 * SCALE);
const BOTTOM_PAD = Math.round(2 * SCALE);       // transparent rows under the feet
// The flying body sits 8 sprite px higher than the standing one; flying frames
// at this altitude line up with the standing frame, so landing doesn't "jump".
const FLY_GROUND = Math.round(8 * SCALE);
const TICK_MS    = 16;

type Mode =
  | 'cruise'   // normal flight at cruising altitude
  | 'tired'    // slow flaps, losing altitude
  | 'climb'    // regaining altitude (after resting or recovering)
  | 'ground';  // resting on the floor

type State = {
  mode: Mode;
  x: number;
  alt: number;          // px above the floor
  dir: 1 | -1;
  cruiseAlt: number;
  floor: number;        // altitude where a tired descent ends
  willLand: boolean;
  timer: number;        // ms left in the current mode (cruise / ground)
  anim: number;         // ms accumulator for frame swaps
  frame: number;
  t: number;            // total elapsed ms
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pickCruiseAlt = () => rand(140, Math.max(180, window.innerHeight * 0.55));

export default function ParrotFlyer() {
  const s = useRef<State | null>(null);
  const distract  = useDistractMode();
  const activeRef = useRef(true);    // false while distract mode is off (frozen)
  const parkedRef = useRef(false);
  const [view, setView] = useState({ x: -9999, alt: 0, src: FLY[0], flip: false, tilt: 0 });

  useEffect(() => {
    // Preload every frame so swaps don't flicker.
    [...FLY, ...TIRED, STAND, BLINK, PERCH].forEach((src) => { const i = new window.Image(); i.src = src; });

    const cruiseAlt = pickCruiseAlt();
    s.current = {
      mode: 'cruise', x: window.innerWidth, alt: cruiseAlt, dir: -1, cruiseAlt,
      floor: 0, willLand: false, timer: rand(5000, 10000), anim: 0, frame: 0, t: 0,
    };

    const id = setInterval(() => {
      if (!activeRef.current) return;
      const st = s.current!;
      const w = window.innerWidth;
      st.t += TICK_MS;

      let speed = 0, fps = 12, frames = FLY, tilt = 0;

      switch (st.mode) {
        case 'cruise': {
          speed = 2.4;
          // gentle up-and-down drift around the cruising altitude
          const target = st.cruiseAlt + Math.sin(st.t / 450) * 10;
          st.alt += (target - st.alt) * 0.05;
          st.timer -= TICK_MS;
          if (st.timer <= 0) {
            // Gets tired: sometimes lands, sometimes recovers mid-air.
            st.mode = 'tired';
            st.willLand = Math.random() < 0.6;
            st.floor = st.willLand
              ? FLY_GROUND
              : rand(FLY_GROUND + 60, Math.max(FLY_GROUND + 80, st.cruiseAlt * 0.6));
          }
          break;
        }
        case 'tired': {
          speed = 1.1; fps = 5; frames = TIRED; tilt = -6;
          // weak flaps: small lift each beat but net descent
          st.alt += Math.sin(st.t / 160) * 0.9 - 0.6;
          if (st.alt <= st.floor) {
            const onScreen = st.x > -SIZE * 0.5 && st.x < w - SIZE * 0.5;
            if (st.willLand && onScreen) {
              st.mode = 'ground';
              st.alt = 0;
              st.timer = rand(2500, 5000);
            } else {
              st.mode = 'climb';
              st.cruiseAlt = pickCruiseAlt();
            }
          }
          break;
        }
        case 'climb': {
          speed = 2.0; fps = 14; tilt = 8;
          st.alt += 1.8;
          if (st.alt >= st.cruiseAlt) {
            st.mode = 'cruise';
            st.timer = rand(5000, 10000);
          }
          break;
        }
        case 'ground': {
          st.timer -= TICK_MS;
          if (st.timer <= 0) {
            st.mode = 'climb';
            st.alt = FLY_GROUND;
            st.cruiseAlt = pickCruiseAlt();
          }
          break;
        }
      }

      st.x += speed * st.dir;
      if (st.x >= w + 10)          st.dir = -1;
      else if (st.x <= -SIZE - 10) st.dir = 1;

      // Advance the animation frame
      st.anim += TICK_MS;
      if (st.anim >= 1000 / fps) {
        st.anim = 0;
        st.frame = (st.frame + 1) % frames.length;
      }

      let src: string;
      if (st.mode === 'ground') {
        // stand still, blinking now and then
        src = st.t % 2600 < 160 ? BLINK : STAND;
      } else {
        src = frames[st.frame % frames.length];
      }

      setView({
        x: st.x,
        alt: st.mode === 'ground' ? 0 : st.alt,
        src,
        flip: st.dir === 1,   // sprites face left; mirror when flying right
        tilt,
      });
    }, TICK_MS);

    return () => clearInterval(id);
  }, []);

  // Distract mode off: stand still on the floor at the left edge of the content,
  // facing the centre. Back on: take off again.
  useEffect(() => {
    activeRef.current = distract;
    const st = s.current;
    if (!st) return;
    if (distract) {
      if (parkedRef.current) {
        // Wake up and take off from the capy's back
        parkedRef.current = false;
        st.mode = 'climb';
        st.dir = -1;
        st.cruiseAlt = pickCruiseAlt();
      }
      return;
    }
    parkedRef.current = true;
    const park = () => {
      // Sitting on the back of the capybara (which naps on the croc at the right edge).
      const perch = parkedParrotPerch(window.innerWidth);
      st.mode = 'ground';
      st.alt = perch.bottom + BOTTOM_PAD;
      st.dir = -1;
      st.x = perch.left;
      setView({ x: st.x, alt: st.alt, src: PERCH, flip: false, tilt: 0 });
    };
    park();
    window.addEventListener('resize', park);
    return () => window.removeEventListener('resize', park);
  }, [distract]);

  return (
    <div
      aria-hidden="true"
      className="fixed z-[10000] pointer-events-none select-none"
      style={{
        left:      view.x,
        bottom:    view.alt - BOTTOM_PAD,
        width:     SIZE,
        height:    HEIGHT,
        transform: `scaleX(${view.flip ? -1 : 1}) rotate(${view.tilt}deg)`,
        transition: 'transform 300ms ease-out',
      }}
    >
      <Image
        src={view.src}
        alt=""
        width={SIZE}
        height={HEIGHT}
        style={{ display: 'block', width: SIZE, height: HEIGHT, imageRendering: 'pixelated' }}
        draggable={false}
        unoptimized
      />
    </div>
  );
}
