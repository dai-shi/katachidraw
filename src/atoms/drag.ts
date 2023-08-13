import { atom } from "jotai/vanilla";

import { sendAtom, modeAtom, selectedAtom } from "./modeMachine";
import { zoomAtom } from "./canvas";
import { addDotAtom, commitDotsAtom } from "./dots";
import { saveHistoryAtom } from "./history";

type ShapeMap = Map<object, { x: number; y: number }>;

const dragCanvasStartAtom = atom<{
  canvas?: { x: number; y: number };
  shapeMap?: ShapeMap;
  moveCount?: number;
  erased?: boolean;
  startPos?: readonly [number, number];
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

    // draw mode
    if (mode === "draw") {
      if (action.type === "start" && !dragStart) {
        set(dragCanvasStartAtom, { startPos: action.pos });
      } else if (action.type === "move" && dragStart) {
        if (dragStart.startPos) {
          const { startPos, ...rest } = dragStart;
          if (startPos[0] === action.pos[0] && startPos[1] === action.pos[1]) {
            // no move
            return;
          }
          set(addDotAtom, dragStart.startPos);
          set(dragCanvasStartAtom, rest);
        }
        set(addDotAtom, action.pos);
      } else if (action.type === "end") {
        set(dragCanvasStartAtom, null);
        set(commitDotsAtom);
      }
      return;
    }

    const zoom = get(zoomAtom);
    const selected = get(selectedAtom);

    // move mode
    if (mode === "move") {
      if (action.type === "start" && !dragStart) {
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
          moveCount: (dragStart.moveCount || 0) + 1,
        });
      } else if (action.type === "end" && dragStart) {
        const dragged = (dragStart.moveCount || 0) > 1;
        if (dragged) {
          set(saveHistoryAtom, null);
        }
        if (!dragged && dragStart.shapeMap?.size === selected.size) {
          set(sendAtom, { type: "CLEAR_SELECTION" });
        }
        set(dragCanvasStartAtom, null);
      }
      return;
    }

    // erase mode
    if (mode === "erase") {
      if (action.type === "start" && !dragStart) {
        set(dragCanvasStartAtom, {});
      } else if (action.type === "end" && dragStart) {
        set(dragCanvasStartAtom, null);
      }
      return;
    }

    if (action.type === "start") {
      set(sendAtom, { type: "CLEAR_SELECTION" });
    }
  }
);
