import { atom } from "jotai";

import { offsetAtom, zoomAtom } from "./canvas";

const pinchCanvasStartAtom = atom<{
  center: { x: number; y: number };
  width: number;
} | null>(null);

export const pinchCanvasAtom = atom(
  null,
  (
    get,
    set,
    action:
      | {
          type: "start" | "move";
          pos1: readonly [number, number];
          pos2: readonly [number, number];
        }
      | {
          type: "end";
        }
  ) => {
    const pinchStart = get(pinchCanvasStartAtom);
    const offset = get(offsetAtom);
    const zoom = get(zoomAtom);

    if (action.type === "start" && !pinchStart) {
      const center = {
        x: (action.pos1[0] + action.pos2[0]) / 2,
        y: (action.pos1[1] + action.pos2[1]) / 2,
      };
      const width = Math.hypot(
        action.pos1[0] - action.pos2[0],
        action.pos1[1] - action.pos2[1]
      );
      set(pinchCanvasStartAtom, { center, width });
    } else if (action.type === "move" && pinchStart) {
      const { center: prevCenter, width: prevWidth } = pinchStart;
      const center = {
        x: (action.pos1[0] + action.pos2[0]) / 2,
        y: (action.pos1[1] + action.pos2[1]) / 2,
      };
      const width = Math.hypot(
        action.pos1[0] - action.pos2[0],
        action.pos1[1] - action.pos2[1]
      );
      const nextOffset = {
        x: offset.x + (prevCenter.x - center.x) / zoom,
        y: offset.y + (prevCenter.y - center.y) / zoom,
      };
      const nextZoom = zoom * (width / prevWidth);
      nextOffset.x += center.x * (1 / zoom - 1 / nextZoom);
      nextOffset.y += center.y * (1 / zoom - 1 / nextZoom);
      set(zoomAtom, nextZoom);
      set(offsetAtom, nextOffset);
      set(pinchCanvasStartAtom, { center, width });
    } else if (action.type === "end" && pinchStart) {
      set(pinchCanvasStartAtom, null);
    }
  }
);
