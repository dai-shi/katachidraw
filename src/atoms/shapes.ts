import { atom, PrimitiveAtom } from "jotai";

import { modeAtom } from "./canvas";

export type ShapeAtom = PrimitiveAtom<{
  path: string;
  color: string;
  x: number;
  y: number;
  selected?: boolean;
}>;

export const allShapesAtom = atom<ShapeAtom[]>([]);

export const addShapeAtom = atom(null, (get, set, path: string) => {
  const shapeAtom = atom({ path, color: "black", x: 0, y: 0 });
  set(allShapesAtom, [...get(allShapesAtom), shapeAtom]);
});

const selectedShapesAtom = atom(new Set<ShapeAtom>());

export const selectedAtom = atom((get) => get(selectedShapesAtom));

export const selectAtom = atom(null, (get, set, shapeAtom: ShapeAtom) => {
  const mode = get(modeAtom);
  if (mode === "pen") {
    return;
  }
  const selected = get(selectedShapesAtom);
  if (!selected.has(shapeAtom)) {
    set(shapeAtom, (prev) => ({ ...prev, selected: true }));
    set(selectedShapesAtom, new Set(selected).add(shapeAtom));
  }
});

export const unselectAtom = atom(null, (get, set, shapeAtom: ShapeAtom) => {
  const selected = get(selectedShapesAtom);
  if (selected.has(shapeAtom)) {
    set(shapeAtom, (prev) => ({ ...prev, selected: false }));
    const nextSelected = new Set(selected);
    nextSelected.delete(shapeAtom);
    set(selectedShapesAtom, nextSelected);
  }
});

export const clearSelectionAtom = atom(null, (get, set) => {
  const selected = get(selectedShapesAtom);
  selected.forEach((shapeAtom) => {
    if (get(shapeAtom).selected) {
      set(shapeAtom, (prev) => ({ ...prev, selected: false }));
    }
  });
  set(selectedShapesAtom, new Set());
});
