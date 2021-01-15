import { atom, PrimitiveAtom } from "jotai";

import { modeAtom } from "./canvas";

export type ShapeAtom = PrimitiveAtom<{
  path: string;
  color: string;
  x: number;
  y: number;
  selected?: boolean;
}>;

export const createShapeAtom = (path: string): ShapeAtom => {
  const shapeAtom = atom({ path, color: "black", x: 0, y: 0 });
  return shapeAtom;
};

const shapeAtomSelectedAtom = atom<ShapeAtom | null>(null);

export const selectedAtom = atom((get) => get(shapeAtomSelectedAtom));

export const selectAtom = atom(
  null,
  (get, set, shapeAtom: ShapeAtom | null) => {
    const mode = get(modeAtom);
    const selectedAtom = get(shapeAtomSelectedAtom);
    if (shapeAtom === null) {
      if (selectedAtom) {
        set(selectedAtom, (prev) => ({ ...prev, selected: false }));
        set(shapeAtomSelectedAtom, null);
      }
    } else if (mode === "select") {
      if (selectedAtom !== shapeAtom) {
        if (selectedAtom) {
          set(selectedAtom, (prev) => ({ ...prev, selected: false }));
        }
        set(shapeAtom, (prev) => ({ ...prev, selected: true }));
        set(shapeAtomSelectedAtom, shapeAtom);
      }
    }
  }
);

export const shapeAtomListAtom = atom<ShapeAtom[]>([]);
