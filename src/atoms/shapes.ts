import { atom } from "jotai/vanilla";
import type { PrimitiveAtom } from "jotai/vanilla";

import { sendAtom, modeAtom } from "./modeMachine";
import { adjustSvgPath } from "../utils/svgpath";

type TShapeCommon = {
  x: number;
  y: number;
  scale: number;
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
  const shapeAtom = atom(shape) as ShapeAtom;
  set(allShapesAtom, [...get(allShapesAtom), shapeAtom]);
});

export const deleteShapeAtom = atom(null, (get, set, shapeAtom: ShapeAtom) => {
  const mode = get(modeAtom);
  if (mode === "erase") {
    set(sendAtom, { type: "UNSELECT_SHAPE", shapeAtom });
    set(allShapesAtom, (prev) => prev.filter((item) => item !== shapeAtom));
  }
});
