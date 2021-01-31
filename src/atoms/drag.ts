import { atom } from "jotai";

import { modeAtom, offsetAtom, zoomAtom } from "./canvas";
import { addDotAtom, commitDotsAtom } from "./dots";
import {
  ShapeAtom,
  selectedAtom,
  allShapesAtom,
  clearSelectionAtom,
  deleteShapeAtom,
  resetModeBasedOnSelection,
} from "./shapes";

type ShapeMap = Map<object, { x: number; y: number }>;

const dragCanvasStartAtom = atom<{
  canvas?: { x: number; y: number };
  shapeMap?: ShapeMap;
  dragged?: boolean;
  startTime?: number;
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
    const dragStart = get(dragCanvasStartAtom);

    // pen mode
    if (mode === "pen") {
      if (action.type === "start" && !dragStart) {
        set(dragCanvasStartAtom, {});
        set(addDotAtom, action.pos);
      } else if (action.type === "move" && dragStart) {
        set(addDotAtom, action.pos);
      } else if (action.type === "end") {
        set(dragCanvasStartAtom, null);
        set(commitDotsAtom, null);
      }
      return;
    }

    const offset = get(offsetAtom);
    const zoom = get(zoomAtom);
    const selected = get(selectedAtom);

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
          startTime: performance.now(),
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
        if (
          !dragStart.dragged ||
          performance.now() - (get(dragCanvasStartAtom)?.startTime ?? 0) < 150
        ) {
          set(clearSelectionAtom, null);
        }
        set(dragCanvasStartAtom, null);
        set(dragCanvasEndAtom, { endTime: performance.now() });
      }
      return;
    }

    // hand mode without selection
    if (mode === "hand" && !selected.size) {
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
      } else if (action.type === "move" && dragStart) {
        const isPointInShapeMap = get(isPointInShapeMapAtom);
        get(allShapesAtom).forEach((shapeAtom) => {
          const isPointInShape = isPointInShapeMap.get(shapeAtom);
          if (isPointInShape && isPointInShape(action.pos, offset, zoom)) {
            set(deleteShapeAtom, shapeAtom);
          }
        });
      } else if (action.type === "end" && dragStart) {
        set(dragCanvasStartAtom, null);
      }
      return;
    }

    // color mode
    if (mode === "color") {
      if (action.type === "start" && !dragStart) {
        set(dragCanvasStartAtom, {});
      } else if (action.type === "end" && dragStart) {
        if (action.type === "end") {
          set(resetModeBasedOnSelection, null);
        }
      }
      return;
    }
  }
);

export type IsPointInShape = (
  point: readonly [number, number],
  offset: { x: number; y: number },
  zoom: number
) => boolean;

export const isPointInShapeMapAtom = atom(
  () => new WeakMap<ShapeAtom, IsPointInShape>()
);

export const registerIsPointInShapeAtom = atom(
  (get) => get(isPointInShapeMapAtom), // XXX needs this for avoid uninitialized error
  (
    get,
    _set,
    {
      shapeAtom,
      isPointInShape,
    }: {
      shapeAtom: ShapeAtom;
      isPointInShape: IsPointInShape;
    }
  ) => {
    const isPointInShapeMap = get(isPointInShapeMapAtom);
    isPointInShapeMap.set(shapeAtom, isPointInShape);
  }
);
