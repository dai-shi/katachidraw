import { atom } from "jotai";

import { selectedAtom } from "./shapes";

export const setColorAtom = atom(null, (get, set, color: string) => {
  const selected = get(selectedAtom);
  selected.forEach((shapeAtom) => {
    set(shapeAtom, (prev) => ({ ...prev, color }));
  });
});
