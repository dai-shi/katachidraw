import { atomWithMachine } from "jotai/xstate";
import { createMachine } from "xstate";
import { inspect } from "@xstate/inspect";

inspect({ iframe: false });

type ModeContext = {
  // selectedShapeAtoms: ShapeAtom[];
};

type ModeEvent =
  | { type: "SELECT_PAN_MODE" }
  | { type: "SELECT_MOVE_MODE" }
  | { type: "SELECT_DRAW_MODE" }
  | { type: "SELECT_ERASE_MODE" }
  | { type: "SELECT_COLOR_MODE" };

const modeMachine = createMachine<ModeContext, ModeEvent>(
  {
    initial: "draw",
    context: {},
    states: {
      pan: {
        on: {
          SELECT_MOVE_MODE: { target: "move" },
          SELECT_DRAW_MODE: { target: "draw" },
          SELECT_ERASE_MODE: { target: "erase" },
          SELECT_COLOR_MODE: { target: "color" },
        },
      },
      move: {
        on: {
          SELECT_PAN_MODE: { target: "pan" },
          SELECT_DRAW_MODE: { target: "draw" },
          SELECT_ERASE_MODE: { target: "erase" },
          SELECT_COLOR_MODE: { target: "color" },
        },
      },
      draw: {
        on: {
          SELECT_PAN_MODE: { target: "pan" },
          SELECT_MOVE_MODE: { target: "move" },
          SELECT_ERASE_MODE: { target: "erase" },
          SELECT_COLOR_MODE: { target: "color" },
        },
      },
      erase: {
        on: {
          SELECT_PAN_MODE: { target: "pan" },
          SELECT_MOVE_MODE: { target: "move" },
          SELECT_DRAW_MODE: { target: "draw" },
          SELECT_COLOR_MODE: { target: "color" },
        },
      },
      color: {
        on: {
          SELECT_PAN_MODE: { target: "pan" },
          SELECT_MOVE_MODE: { target: "move" },
          SELECT_DRAW_MODE: { target: "draw" },
          SELECT_ERASE_MODE: { target: "erase" },
        },
      },
    },
  },
  {
    actions: {},
  }
);

export const modeMachineAtom = atomWithMachine(modeMachine, {
  devTools: true, // process.env.NODE_ENV !== "production",
});
