import { atom, PrimitiveAtom } from "jotai";

import { modeAtom } from "./canvas";

export type ShapeAtom = PrimitiveAtom<{
  path: string;
  color: string;
  x: number;
  y: number;
  selected?: boolean;
}>;

export const colorAtom = atom("black");

export const allShapesAtom = atom<ShapeAtom[]>([]);

export const addShapeAtom = atom(null, (get, set, path: string) => {
  const color = get(colorAtom);
  const shapeAtom = atom({ path, color, x: 0, y: 0 });
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
  if (selected.has(shapeAtom)) {
    if (mode === "erase") {
      set(deleteShapeAtom, shapeAtom);
    } else {
      set(unselectAtom, shapeAtom);
    }
  } else {
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

export const deleteShapeAtom = atom(null, (_get, set, shapeAtom: ShapeAtom) => {
  set(unselectAtom, shapeAtom);
  set(allShapesAtom, (prev) => prev.filter((item) => item !== shapeAtom));
});

export const resetModeBasedOnSelection = atom(null, (get, set, _arg) => {
  const selected = get(selectedAtom);
  if (selected.size) {
    set(modeAtom, "hand");
  } else {
    set(modeAtom, "pen");
  }
});
