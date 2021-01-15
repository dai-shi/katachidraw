import { atom } from "jotai";

import { modeAtom, offsetAtom, zoomAtom } from "./canvas";
import { addDotAtom, commitDotsAtom } from "./dots";
import { selectedAtom, selectAtom } from "./shapes";

const dragStartAtom = atom<{
  x: number;
  y: number;
  dragged?: boolean;
} | null>(null);

export const dragAtom = atom(
  null,
  (get, set, pos: readonly [number, number] | "end") => {
    const mode = get(modeAtom);
    if (mode === "pen") {
      if (pos === "end") {
        set(commitDotsAtom, null);
      } else {
        set(addDotAtom, pos);
      }
    } else if (mode === "select") {
      const selected = get(selectedAtom);
      const zoom = get(zoomAtom);
      const dragStart = get(dragStartAtom);
      if (selected) {
        const { x, y } = get(selected);
        if (pos === "end") {
          if (!dragStart?.dragged) {
            set(selectAtom, null);
          }
          set(dragStartAtom, null);
        } else if (dragStart) {
          set(selected, (prev) => ({
            ...prev,
            x: dragStart.x + pos[0] / zoom,
            y: dragStart.y + pos[1] / zoom,
          }));
          set(dragStartAtom, {
            ...dragStart,
            dragged: true,
          });
        } else {
          set(dragStartAtom, {
            x: x - pos[0] / zoom,
            y: y - pos[1] / zoom,
          });
        }
      } else {
        const offset = get(offsetAtom);
        if (pos === "end") {
          set(dragStartAtom, null);
        } else if (dragStart) {
          set(offsetAtom, {
            x: dragStart.x - pos[0] / zoom,
            y: dragStart.y - pos[1] / zoom,
          });
        } else {
          set(dragStartAtom, {
            x: offset.x + pos[0] / zoom,
            y: offset.y + pos[1] / zoom,
          });
        }
      }
    }
  }
);
