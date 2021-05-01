import { atom } from "jotai";

import { modeAtom, offsetAtom, zoomAtom, dimensionAtom } from "./canvas";
import {
  selectedAtom,
  hasSelectionAtom,
  hasImageOnlySelectionAtom,
  clearSelectionAtom,
  resetModeBasedOnSelection,
  allShapesAtom,
  addShapeImageAtom,
} from "./shapes";
import { saveHistoryAtom } from "./history";
import { FileSystemModule } from "../modules/file-system/FileSystemModule";
import { serialize } from "../utils/serialize";
import { PrintCanvas } from "../components/PrintCanvas";

export const toolbarAtom = atom(
  (get) => {
    const mode = get(modeAtom);
    const hasSelection = get(hasSelectionAtom);
    const hasImageOnlySelection = get(hasImageOnlySelectionAtom);
    return [
      hasSelection
        ? { id: "move", active: mode === "move" }
        : { id: "pan", active: mode === "pan" },
      { id: "draw", active: mode === "draw" },
      { id: "erase", active: mode === "erase" },
      { id: "color", active: mode === "color" },
      hasSelection ? { id: "bigger" } : { id: "zoomIn" },
      hasSelection ? { id: "smaller" } : { id: "zoomOut" },
      ...(hasImageOnlySelection
        ? [{ id: "rotateLeft" }, { id: "rotateRight" }]
        : []),
      { id: "image" },
      { id: "save" },
    ];
  },
  (
    get,
    set,
    { id, fileSystemModule }: { id: string; fileSystemModule: FileSystemModule }
  ) => {
    if (id === "pan" || id === "draw" || id === "erase") {
      set(modeAtom, id);
      set(clearSelectionAtom, null);
    } else if (id === "move") {
      set(modeAtom, id);
    } else if (id === "bigger" || id === "smaller") {
      const selected = get(selectedAtom);
      let left = Infinity;
      let top = Infinity;
      selected.forEach((shapeAtom) => {
        const shape = get(shapeAtom);
        left = Math.min(left, shape.x);
        top = Math.min(top, shape.y);
      });
      selected.forEach((shapeAtom) => {
        set(shapeAtom, (prev) => {
          const { scale } = prev;
          const nextScale = id === "bigger" ? scale * 1.2 : scale / 1.2;
          return {
            ...prev,
            x: left + (prev.x - left) * (nextScale / scale),
            y: top + (prev.y - top) * (nextScale / scale),
            scale: nextScale,
          };
        });
      });
      set(saveHistoryAtom, null);
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
    } else if (id === "rotateLeft" || id === "rotateRight") {
      const selected = get(selectedAtom);
      selected.forEach((shapeAtom) => {
        const prev = get(shapeAtom);
        if ("image" in prev) {
          const { rotate } = prev;
          const nextRotate =
            (356 + rotate + 15 * (id === "rotateLeft" ? -1 : 1)) % 360;
          set(shapeAtom, {
            ...prev,
            rotate: nextRotate,
          });
        }
      });
    } else if (id === "color") {
      if (get(modeAtom) === "color") {
        set(resetModeBasedOnSelection, null);
      } else {
        if (get(hasImageOnlySelectionAtom)) {
          set(clearSelectionAtom, null);
        }
        set(modeAtom, "color");
      }
    } else if (id === "image") {
      fileSystemModule.loadImageFile().then((image) => {
        set(addShapeImageAtom, image);
        set(saveHistoryAtom, null);
      });
    } else if (id === "save") {
      const shapes = get(allShapesAtom).map((shapeAtom) => get(shapeAtom));
      const svgString = serialize(PrintCanvas({ shapes }));
      fileSystemModule.saveSvgFile(svgString);
    }
  }
);
