import { atom } from "jotai";
import getPath from "perfect-freehand";

import { offsetAtom, zoomAtom } from "./canvas";
import { addShapePathAtom } from "./shapes";
import { saveHistoryAtom } from "./history";

export const dotsAtom = atom<[number, number][]>([]);

export const addDotAtom = atom(
  null,
  (get, set, [x, y]: readonly [number, number]) => {
    const offset = get(offsetAtom);
    const zoom = get(zoomAtom);
    const dots = get(dotsAtom);
    set(dotsAtom, [...dots, [x / zoom + offset.x, y / zoom + offset.y]]);
  }
);

export const commitDotsAtom = atom(null, (get, set) => {
  const dots = get(dotsAtom);
  if (dots.length > 2) {
    const path = getPath(dots);
    set(addShapePathAtom, path);
    set(saveHistoryAtom, null);
  }
  set(dotsAtom, []);
});
