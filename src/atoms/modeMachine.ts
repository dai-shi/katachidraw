import { atom } from "jotai";
import { atomWithMachine } from "jotai/xstate";
import { createMachine, assign } from "xstate";
import { inspect } from "@xstate/inspect";

import { ShapeAtom } from "./shapes";

inspect({ iframe: false });

type ModeContext = {
  selectedShapeAtoms: Set<ShapeAtom>;
};

type ModeEvent =
  | { type: "SELECT_PAN_MODE" }
  | { type: "SELECT_MOVE_MODE" }
  | { type: "SELECT_DRAW_MODE" }
  | { type: "SELECT_ERASE_MODE" }
  | { type: "SELECT_COLOR_MODE" }
  | { type: "PRESS_SHAPE"; shapeAtom: ShapeAtom }
  | { type: "CLEAR_SELECTION" };

const toggleSelection = assign<ModeContext, ModeEvent>({
  selectedShapeAtoms: (context, event) => {
    if (event.type === "PRESS_SHAPE") {
      const selectedShapeAtoms = new Set(context.selectedShapeAtoms);
      const { shapeAtom } = event;
      if (selectedShapeAtoms.has(shapeAtom)) {
        selectedShapeAtoms.delete(shapeAtom);
      } else {
        selectedShapeAtoms.add(shapeAtom);
      }
      return selectedShapeAtoms;
    }
    return context.selectedShapeAtoms;
  },
});

const clearSelection = assign<ModeContext, ModeEvent>({
  selectedShapeAtoms: (context) =>
    context.selectedShapeAtoms.size ? new Set() : context.selectedShapeAtoms,
});

const hasSelection = (context: ModeContext) =>
  !!context.selectedShapeAtoms.size;

const modeMachine = createMachine<ModeContext, ModeEvent>(
  {
    initial: "draw",
    context: {
      selectedShapeAtoms: new Set(),
    },
    states: {
      pan: {
        on: {
          PRESS_SHAPE: {
            target: "afterPressingShape",
            actions: ["toggleSelection"],
          },
        },
      },
      move: {
        on: {
          PRESS_SHAPE: {
            target: "afterPressingShape",
            actions: ["toggleSelection"],
          },
        },
      },
      draw: {},
      erase: {},
      color: {},
      afterPressingShape: {
        on: {
          "": [
            {
              target: "move",
              cond: "hasSelection",
            },
            {
              target: "pan",
            },
          ],
        },
      },
    },
    on: {
      SELECT_PAN_MODE: { target: "pan" },
      SELECT_MOVE_MODE: { target: "move" },
      SELECT_DRAW_MODE: { target: "draw", actions: ["clearSelection"] },
      SELECT_ERASE_MODE: { target: "erase" },
      SELECT_COLOR_MODE: { target: "color" },
      PRESS_SHAPE: {
        actions: ["toggleSelection"],
      },
      CLEAR_SELECTION: {
        target: "draw",
        actions: ["clearSelection"],
      },
    },
  },
  {
    actions: {
      toggleSelection,
      clearSelection,
    },
    guards: {
      hasSelection,
    },
  }
);

const modeMachineAtom = atomWithMachine(modeMachine, {
  devTools: process.env.NODE_ENV !== "production",
});

export const sendAtom = atom(null, (_get, set, event: ModeEvent) =>
  set(modeMachineAtom, event)
);

export const modeAtom = atom(
  (get) =>
    get(modeMachineAtom).value as "pan" | "move" | "draw" | "erase" | "color"
);

export const selectedAtom = atom(
  (get) => get(modeMachineAtom).context.selectedShapeAtoms
);

export const hasSelectionAtom = atom((get) => !!get(selectedAtom).size);

export const hasImageOnlySelectionAtom = atom((get) => {
  const selected = get(selectedAtom);
  return (
    !!selected.size && [...selected].every((shape) => "image" in get(shape))
  );
});
