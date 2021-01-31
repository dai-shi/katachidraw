import { atom } from "jotai";

import { modeAtom, offsetAtom, zoomAtom, dimensionAtom } from "./canvas";
import { clearSelectionAtom, resetModeBasedOnSelection } from "./shapes";

export const toolbarAtom = atom(
  (get) => {
    const mode = get(modeAtom);
    return [
      { id: "hand", active: mode === "hand" },
      { id: "pen", active: mode === "pen" },
      { id: "erase", active: mode === "erase" },
      { id: "color", active: mode === "color" },
      { id: "zoomIn" },
      { id: "zoomOut" },
    ];
  },
  (get, set, id) => {
    if (id === "hand" || id === "pen" || id === "erase") {
      set(modeAtom, id);
      set(clearSelectionAtom, null);
    } else if (id === "zoomIn" || id === "zoomOut") {
      const dimension = get(dimensionAtom);
      const zoom = get(zoomAtom);
      const nextZoom = id === "zoomIn" ? zoom * 1.2 : zoom / 1.2;
      set(zoomAtom, nextZoom);
      set(offsetAtom, (prev) => ({
        x: prev.x + (dimension.width * (1 / zoom - 1 / nextZoom)) / 2,
        y: prev.y + (dimension.height * (1 / zoom - 1 / nextZoom)) / 2,
      }));
      if (get(modeAtom) === "color") {
        set(resetModeBasedOnSelection, null);
      }
    } else if (id === "color") {
      if (get(modeAtom) === "color") {
        set(resetModeBasedOnSelection, null);
      } else {
        set(modeAtom, "color");
      }
    }
  }
);
