import { atom } from "jotai";

export const dimensionAtom = atom({ width: 0, height: 0 });

export const offsetAtom = atom({ x: 0, y: 0 });

export const zoomAtom = atom(1);
