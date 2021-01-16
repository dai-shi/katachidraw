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

const dragCanvasEndAtom = atom<{
  endTime?: number;
} | null>(null);

export const dragCanvasAtom = atom(
  null,
  (
    get,
    set,
    action:
      | {
          type: "start" | "move";
          pos: readonly [number, number];
        }
      | {
          type: "end";
        }
  ) => {
    const mode = get(modeAtom);

    // pen mode
    if (mode === "pen") {
      if (action.type === "end") {
        set(commitDotsAtom, null);
      } else {
        set(addDotAtom, action.pos);
      }
      return;
    }

    const zoom = get(zoomAtom);
    const selected = get(selectedAtom);
    const dragStart = get(dragCanvasStartAtom);

    // hand mode with selection
    if (mode === "hand" && selected.size) {
      if (
        action.type === "start" &&
        !dragStart &&
        // XXX Mobile Safari accidentally triggers another event very quickly?
        performance.now() - (get(dragCanvasEndAtom)?.endTime ?? 0) > 99
      ) {
        const shapeMap: ShapeMap = new Map();
        selected.forEach((shapeAtom) => {
          const shape = get(shapeAtom);
          shapeMap.set(shapeAtom, {
            x: shape.x - action.pos[0] / zoom,
            y: shape.y - action.pos[1] / zoom,
          });
        });
        set(dragCanvasStartAtom, {
          shapeMap,
          hasPressingShape: !!get(pressingShapeAtom),
        });
      } else if (action.type === "move" && dragStart) {
        selected.forEach((shapeAtom) => {
          const item = dragStart.shapeMap?.get(shapeAtom);
          if (item) {
            set(shapeAtom, (prev) => ({
              ...prev,
              x: item.x + action.pos[0] / zoom,
              y: item.y + action.pos[1] / zoom,
            }));
          }
        });
        set(dragCanvasStartAtom, {
          ...dragStart,
          dragged: true,
        });
      } else if (action.type === "end" && dragStart) {
        if (!dragStart.dragged && !dragStart.hasPressingShape) {
          set(clearSelectionAtom, null);
        }
        set(dragCanvasStartAtom, null);
        set(dragCanvasEndAtom, { endTime: performance.now() });
      }
      return;
    }

    // hand mode without selection
    if (mode === "hand" && !selected.size) {
      const offset = get(offsetAtom);
      if (action.type === "start" && !dragStart) {
        set(dragCanvasStartAtom, {
          canvas: {
            x: offset.x + action.pos[0] / zoom,
            y: offset.y + action.pos[1] / zoom,
          },
        });
      } else if (action.type === "move" && dragStart) {
        const { canvas } = dragStart;
        if (canvas) {
          set(offsetAtom, {
            x: canvas.x - action.pos[0] / zoom,
            y: canvas.y - action.pos[1] / zoom,
          });
        }
      } else if (action.type === "end" && dragStart) {
        set(dragCanvasStartAtom, null);
      }
      return;
    }

    // erase mode without selection
    if (mode === "erase" && !selected.size) {
      if (action.type === "start" && !dragStart) {
        set(dragCanvasStartAtom, {});
      } else if (action.type === "end" && dragStart) {
        set(dragCanvasStartAtom, null);
      }
      return;
    }
  }
);

export const dragShapeAtom = atom(null, (get, set, shapeAtom: ShapeAtom) => {
  const mode = get(modeAtom);

  // erase mode
  if (mode === "erase") {
    const dragStart = get(dragCanvasStartAtom);
    if (dragStart) {
      set(deleteShapeAtom, shapeAtom);
    }
    return;
  }
});
