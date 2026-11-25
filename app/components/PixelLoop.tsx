'use client';

import { useEffect, useState } from 'react';
import { useDistractMode } from '@/app/components/distractMode';

type Props = {
  /** Frame image paths, played in a loop. */
  frames: string[];
  /** Source sprite size in px (rendered at 2x, pixelated). */
  width: number;
  height: number;
  fps?: number;
};

const SCALE = 2;

/** Small looping pixel-art animation. Freezes on the first frame when distract mode is off. */
export default function PixelLoop({ frames, width, height, fps = 5 }: Props) {
  const [frame, setFrame] = useState(0);
  const distract = useDistractMode();

  useEffect(() => {
    frames.forEach((src) => { const i = new window.Image(); i.src = src; });
  }, [frames]);

  useEffect(() => {
    if (!distract) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % frames.length), 1000 / fps);
    return () => clearInterval(id);
  }, [distract, frames.length, fps]);

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={frames[distract ? frame % frames.length : 0]}
      alt=""
      aria-hidden="true"
      width={width * SCALE}
      height={height * SCALE}
      draggable={false}
      className="block select-none"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
