'use client';

import { useSyncExternalStore } from 'react';

// "Distract mode": when on, the capybara and the parrot roam around the page.
// When off, they park in place. Shared between the sidebar switch and the
// sprites (which live in different trees), and remembered per visitor.

const KEY = 'distract-mode';
const listeners = new Set<() => void>();
let enabled = true;
let loaded = false;

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const v = localStorage.getItem(KEY);
    if (v !== null) enabled = v !== 'off';
  } catch {}
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

export function setDistractMode(on: boolean) {
  enabled = on;
  try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch {}
  listeners.forEach((l) => l());
}

// ---- Parked layout (distract mode off) ----
// The capy naps on the croc flush with the right edge; the croc scene is a
// 120x60 sprite at 2.5x (see CapyWalker). The parrot sits on the capy's back:
// its 80x60 sprite sits 32 px right / 18 px above the scene's origin (sprite px).
const PARK_SCALE   = 2.5;
const PARK_SCENE_W = 120 * PARK_SCALE;
const PARK_CROC_PAD = 1 * PARK_SCALE;   // transparent rows under the croc's feet

/** Screen position (left, bottom in px) of the perched parrot's 200x150 box. */
export function parkedParrotPerch(viewportW: number) {
  return {
    left:   viewportW - PARK_SCENE_W + 32 * PARK_SCALE,
    bottom: -PARK_CROC_PAD + 18 * PARK_SCALE,
  };
}

export function useDistractMode() {
  return useSyncExternalStore(
    subscribe,
    () => { load(); return enabled; },
    () => true, // server render: default on
  );
}
