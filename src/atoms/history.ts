import { atom } from "jotai/vanilla";
import type { Getter, Setter } from "jotai/vanilla";

import { sendAtom } from "./modeMachine";
import type { TShape } from "./shapes";
import { allShapesAtom } from "./shapes";

type HistoryItem = {
  shapes: TShape[];
};

const initialHistoryItem: HistoryItem = {
  shapes: [],
};

export const historyAtom = atom([initialHistoryItem]);

export const historyIndexAtom = atom<number>(0);

export const historyPositionAtom = atom((get) => {
  const len = get(historyAtom).length;
  const index = get(historyIndexAtom);
  return 1.0 - (len > 1 ? index / (len - 1) : 0);
});

export const saveHistoryAtom = atom(null, (get, set, _arg) => {
  let history = get(historyAtom);
  const index = get(historyIndexAtom);
  // remove uncommitted
  history = history.slice(index); // copy array immutably
  // add current shapes
  const shapes: TShape[] = get(allShapesAtom).map((shapeAtom) => {
    const shape = get(shapeAtom);
    return shape;
  });
  history.unshift({ shapes }); // mutate array
  set(historyAtom, history);
  set(historyIndexAtom, 0);
});

const restoreHistory = (get: Getter, set: Setter) => {
  const index = get(historyIndexAtom);
  const item = get(historyAtom)[index];
  const shapeAtomList = item.shapes.map((shape) => atom(shape));
  set(allShapesAtom, shapeAtomList);
};

export const hisotryBackAtom = atom(null, (get, set, _arg) => {
  const len = get(historyAtom).length;
  let index = get(historyIndexAtom);
  if (index + 1 < len) {
    index += 1;
    set(historyIndexAtom, index);
    restoreHistory(get, set);
    set(sendAtom, { type: "CLEAR_SELECTION" });
  }
});

export const hisotryForwardAtom = atom(null, (get, set, _arg) => {
  let index = get(historyIndexAtom);
  if (index > 0) {
    index -= 1;
    set(historyIndexAtom, index);
    restoreHistory(get, set);
    set(sendAtom, { type: "CLEAR_SELECTION" });
  }
});
