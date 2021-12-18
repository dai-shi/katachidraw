import { atom } from "jotai";

import {
  sendAtom,
  modeAtom,
  selectedAtom,
  hasSelectionAtom,
  hasImageOnlySelectionAtom,
} from "./modeMachine";
import { offsetAtom, zoomAtom, dimensionAtom } from "./canvas";
import { allShapesAtom, addShapeImageAtom } from "./shapes";
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
      ...(mode === "pan" ? [{ id: "pan", active: true }] : []),
      ...(mode === "move" ? [{ id: "move", active: true }] : []),
      ...(mode !== "pan" && mode !== "move"
        ? [{ id: "draw", active: mode === "draw" }]
        : []),
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
    if (id === "pan") {
      set(sendAtom, { type: "SELECT_PAN_MODE" });
    } else if (id === "move") {
      set(sendAtom, { type: "SELECT_MOVE_MODE" });
    } else if (id === "draw") {
      set(sendAtom, { type: "SELECT_DRAW_MODE" });
    } else if (id === "erase") {
      set(sendAtom, { type: "SELECT_ERASE_MODE" });
    } else if (id === "color") {
      set(sendAtom, { type: "SELECT_COLOR_MODE" });
    }

    if (id === "bigger" || id === "smaller") {
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
      if (get(modeAtom) !== "color") {
        if (get(hasImageOnlySelectionAtom)) {
          set(sendAtom, { type: "CLEAR_SELECTION" });
        }
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
