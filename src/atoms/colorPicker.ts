import { atom } from "jotai/vanilla";

import { selectedAtom } from "./modeMachine";
import { colorAtom } from "./shapes";
import { saveHistoryAtom } from "./history";

export const setColorAtom = atom(null, (get, set, color: string) => {
  const selected = get(selectedAtom);
  if (selected.size) {
    selected.forEach((shapeAtom) => {
      set(shapeAtom, (prev) => ({ ...prev, color }));
    });
    set(saveHistoryAtom, null);
  } else {
    set(colorAtom, color);
  }
});
