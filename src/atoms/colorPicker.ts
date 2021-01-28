import { atom } from "jotai";

import { modeAtom } from "./canvas";
import { selectedAtom, colorAtom } from "./shapes";

export const setColorAtom = atom(null, (get, set, color: string) => {
  const selected = get(selectedAtom);
  if (selected.size) {
    selected.forEach((shapeAtom) => {
      set(shapeAtom, (prev) => ({ ...prev, color }));
    });
  } else {
    set(colorAtom, color);
    set(modeAtom, "pen");
  }
});
