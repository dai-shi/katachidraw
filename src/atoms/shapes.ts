import { atom, PrimitiveAtom } from "jotai";

import { modeAtom } from "./canvas";
import { adjustSvgPath } from "../utils/svgpath";

type TShapeCommon = {
  x: number;
  y: number;
  scale: number;
  selected?: boolean;
};

export type TShapePath = TShapeCommon & {
  path: string;
  color: string;
};

export type TShapeImage = TShapeCommon & {
  image: string;
  width: number;
  height: number;
  rotate: number;
};

export type TShape = TShapePath | TShapeImage;

export type ShapeAtom = PrimitiveAtom<TShape>;

export const colorAtom = atom("black");

export const allShapesAtom = atom<ShapeAtom[]>([]);

export const addShapePathAtom = atom(null, (get, set, path: string) => {
  const color = get(colorAtom);
  const shape: TShapePath = { ...adjustSvgPath(path), scale: 1, color };
  set(allShapesAtom, [...get(allShapesAtom), atom(shape) as ShapeAtom]);
});

export const addShapeImageAtom = atom(null, (get, set, image: string) => {
  // TODO nicer initial position and width
  const shape: TShapeImage = {
    x: 100,
    y: 100,
    scale: 1,
    image,
    width: 300,
    height: 300,
    rotate: 0,
  };
  set(allShapesAtom, [...get(allShapesAtom), atom(shape) as ShapeAtom]);
});

const selectedShapesAtom = atom(new Set<ShapeAtom>());

export const selectedAtom = atom((get) => get(selectedShapesAtom));

export const selectAtom = atom(null, (get, set, shapeAtom: ShapeAtom) => {
  const mode = get(modeAtom);
  if (mode === "draw") {
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
    if (mode === "pan") {
      set(modeAtom, "move");
    }
  }
});

export const unselectAtom = atom(null, (get, set, shapeAtom: ShapeAtom) => {
  const selected = get(selectedShapesAtom);
  if (selected.has(shapeAtom)) {
    set(shapeAtom, (prev) => ({ ...prev, selected: false }));
    const nextSelected = new Set(selected);
    nextSelected.delete(shapeAtom);
    set(selectedShapesAtom, nextSelected);
    if (!nextSelected.size) {
      const mode = get(modeAtom);
      if (mode === "move") {
        set(modeAtom, "pan");
      }
    }
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
  const mode = get(modeAtom);
  if (mode === "move") {
    set(modeAtom, "pan");
  }
});

export const deleteShapeAtom = atom(null, (_get, set, shapeAtom: ShapeAtom) => {
  set(unselectAtom, shapeAtom);
  set(allShapesAtom, (prev) => prev.filter((item) => item !== shapeAtom));
});

export const resetModeBasedOnSelection = atom(null, (get, set, _arg) => {
  const selected = get(selectedAtom);
  if (selected.size) {
    set(modeAtom, "move");
  } else {
    set(modeAtom, "draw");
  }
});
