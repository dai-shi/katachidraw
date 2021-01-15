import { atom } from "jotai";

import { modeAtom, offsetAtom, zoomAtom, dimensionAtom } from "./canvas";
import { shapeAtomListAtom, selectedAtom, selectAtom } from "./shapes";

export const toolbarAtom = atom(
  (get) => {
    const mode = get(modeAtom);
    const selected = get(selectedAtom);
    return [
      {
        id: "pen",
        active: mode === "pen",
      },
      {
        id: "select",
        active: mode === "select",
      },
      {
        id: "zoomIn",
      },
      {
        id: "zoomOut",
      },
      ...(selected ? [{ id: "palette" }, { id: "delete" }] : []),
    ];
  },
  (get, set, id) => {
    if (id === "pen" || id === "select") {
      set(modeAtom, id);
      set(selectAtom, null);
    } else if (id === "zoomIn" || id === "zoomOut") {
      const dimension = get(dimensionAtom);
      const zoom = get(zoomAtom);
      const nextZoom = id === "zoomIn" ? zoom * 1.2 : zoom / 1.2;
      set(zoomAtom, nextZoom);
      set(offsetAtom, (prev) => ({
        x: prev.x + (dimension.width * (1 / zoom - 1 / nextZoom)) / 2,
        y: prev.y + (dimension.height * (1 / zoom - 1 / nextZoom)) / 2,
      }));
    } else if (id === "palette") {
      const selected = get(selectedAtom);
      if (selected) {
        set(selected, (prev) => ({
          ...prev,
          color:
            prev.color === "black"
              ? "green"
              : prev.color === "green"
              ? "blue"
              : prev.color === "blue"
              ? "red"
              : "black",
        }));
      }
    } else if (id === "delete") {
      const selected = get(selectedAtom);
      set(selectAtom, null);
      set(shapeAtomListAtom, (prev) =>
        prev.filter((item) => item !== selected)
      );
    }
  }
);
