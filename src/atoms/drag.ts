import { atom } from "jotai";

import { modeAtom, offsetAtom, zoomAtom } from "./canvas";
import { addDotAtom, commitDotsAtom } from "./dots";
import {
  ShapeAtom,
  selectedAtom,
  clearSelectionAtom,
  deleteShapeAtom,
} from "./shapes";

const pressingShapeAtom = atom<ShapeAtom | null>(null);
export const setPressingShapeAtom = atom(
  null,
  (_get, set, shapeAtom: ShapeAtom | null) => {
    set(pressingShapeAtom, shapeAtom);
  }
);

type ShapeMap = Map<object, { x: number; y: number }>;

const dragCanvasStartAtom = atom<{
  canvas?: { x: number; y: number };
  shapeMap?: ShapeMap;
  dragged?: boolean;
  hasPressingShape?: boolean;
} | null>(null);

export const dragCanvasAtom = atom(
  null,
  (get, set, pos: readonly [number, number] | "end") => {
    const mode = get(modeAtom);

    // pen mode
    if (mode === "pen") {
      if (pos === "end") {
        set(commitDotsAtom, null);
      } else {
        set(addDotAtom, pos);
      }
      return;
    }

    const zoom = get(zoomAtom);
    const selected = get(selectedAtom);
    const dragStart = get(dragCanvasStartAtom);

    // hand mode with selection
    if (mode === "hand" && selected.size) {
      if (pos === "end") {
        if (dragStart && !dragStart.dragged && !dragStart.hasPressingShape) {
          set(clearSelectionAtom, null);
        }
        set(dragCanvasStartAtom, null);
      } else if (dragStart) {
        selected.forEach((shapeAtom) => {
          const item = dragStart.shapeMap?.get(shapeAtom);
          if (item) {
            set(shapeAtom, (prev) => ({
              ...prev,
              x: item.x + pos[0] / zoom,
              y: item.y + pos[1] / zoom,
            }));
          }
        });
        set(dragCanvasStartAtom, {
          ...dragStart,
          dragged: true,
        });
      } else {
        const shapeMap: ShapeMap = new Map();
        selected.forEach((shapeAtom) => {
          const shape = get(shapeAtom);
          shapeMap.set(shapeAtom, {
            x: shape.x - pos[0] / zoom,
            y: shape.y - pos[1] / zoom,
          });
        });
        set(dragCanvasStartAtom, {
          shapeMap,
          hasPressingShape: !!get(pressingShapeAtom),
        });
      }
      return;
    }

    // hand mode without selection
    if (mode === "hand" && !selected.size) {
      const offset = get(offsetAtom);
      if (pos === "end") {
        set(dragCanvasStartAtom, null);
      } else if (dragStart) {
        const { canvas } = dragStart;
        if (canvas) {
          set(offsetAtom, {
            x: canvas.x - pos[0] / zoom,
            y: canvas.y - pos[1] / zoom,
          });
        }
      } else {
        set(dragCanvasStartAtom, {
          canvas: {
            x: offset.x + pos[0] / zoom,
            y: offset.y + pos[1] / zoom,
          },
        });
      }
      return;
    }
  }
);

export const dragShapeAtom = atom(null, (get, set, shapeAtom: ShapeAtom) => {
  const mode = get(modeAtom);

  // erase mode
  if (mode === "erase") {
    set(deleteShapeAtom, shapeAtom);
    return;
  }
});
