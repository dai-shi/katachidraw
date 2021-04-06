import { assign, createMachine } from "xstate";
import { pure, sendParent } from "xstate/lib/actions";

type ShapeEvent =
  | { type: "BIGGER"; top: number; left: number }
  | { type: "SMALLER"; top: number; left: number }
  | { type: "SELECT_SHAPE" }
  | { type: "DESELECT_SHAPE" }
  | { type: "SET_COLOR"; color: string }
  | { type: "REGISTER_IS_POINT_IN_SHAPE"; isPointInShape: any }
  | { type: "MOVE"; deltaX: number; deltaY: number }
  | {
      type: "CHECK_POINT_IN_SHAPE";
      zoom: number;
      offset: number;
      pos: [number, number];
    };

interface ShapeContext {
  x: number;
  y: number;
  path: string;
  scale: number;
  color: string;
  id: string;
  isPointInShape: any;
}

type TShapeCommon = {
  x: number;
  y: number;
  scale: number;
  selected?: boolean;
};

export type TShapeImage = TShapeCommon & {
  image: string;
  width: number;
  height: number;
};

const ShapeMachine = createMachine<ShapeContext, ShapeEvent>(
  {
    key: "shape",
    initial: "unselected",
    context: {
      x: 0,
      y: 0,
      path: "",
      scale: 1,
      color: "black",
      id: "",
      isPointInShape: undefined,
    },
    states: {
      unselected: {
        on: {
          SELECT_SHAPE: {
            target: "selected",
            actions: ["notifyParentShapeSelected"],
          },
        },
      },
      selected: {
        on: {
          DESELECT_SHAPE: {
            target: "unselected",
            actions: ["notifyParentShapeDeselected"],
          },
        },
      },
    },
    on: {
      REGISTER_IS_POINT_IN_SHAPE: {
        actions: ["registerIsPointInShape"],
      },
      CHECK_POINT_IN_SHAPE: {
        actions: ["checkIsPointInShape"],
      },
      SET_COLOR: {
        actions: ["assignColor", "notifyParentShapeUpdated"],
      },
      BIGGER: {
        actions: ["makeShapeBigger", "notifyParentShapeUpdated"],
      },
      SMALLER: {
        actions: ["makeShapeSmaller", "notifyParentShapeUpdated"],
      },
      MOVE: {
        actions: ["movePosition"],
      },
    },
  },
  {
    actions: {
      notifyParentShapeSelected: sendParent((ctx) => ({
        type: "SHAPE_SELECTED",
        id: ctx.id,
      })),
      notifyParentShapeDeselected: sendParent((ctx) => ({
        type: "SHAPE_DESELECTED",
        id: ctx.id,
      })),
      makeShapeBigger: assign((ctx, event) => {
        if (event.type !== "BIGGER") return ctx;
        const { x, y, scale } = ctx;
        const { top, left } = event;
        const nextScale = scale * 1.2;
        return {
          ...ctx,
          x: left + (x - left) * (nextScale / scale),
          y: top + (y - top) * (nextScale / scale),
          scale: nextScale,
        };
      }),
      makeShapeSmaller: assign((ctx, event) => {
        if (event.type !== "SMALLER") return ctx;
        const { x, y, scale } = ctx;
        const { top, left } = event;
        const nextScale = scale / 1.2;
        return {
          ...ctx,
          x: left + (x - left) * (nextScale / scale),
          y: top + (y - top) * (nextScale / scale),
          scale: nextScale,
        };
      }),
      registerIsPointInShape: assign({
        isPointInShape: (ctx, event) => {
          if (event.type !== "REGISTER_IS_POINT_IN_SHAPE")
            return ctx.isPointInShape;
          return event.isPointInShape;
        },
      }),
      checkIsPointInShape: pure((ctx, event) => {
        if (event.type !== "CHECK_POINT_IN_SHAPE") return [] as any;
        const { pos, offset, zoom } = event;
        if (ctx.isPointInShape?.(pos, offset, zoom)) {
          return sendParent({ type: "POINT_IS_IN_SHAPE", id: ctx.id });
        }
      }),
      assignColor: assign({
        color: (ctx, event) => {
          if (event.type !== "SET_COLOR") return ctx.color;
          return event.color;
        },
      }),
      notifyParentShapeUpdated: sendParent((ctx) => ({
        type: "SHAPE_UPDATED",
        id: ctx.id,
        shapeData: {
          x: ctx.x,
          y: ctx.y,
          path: ctx.path,
          scale: ctx.scale,
          color: ctx.color,
          id: ctx.id,
        },
      })),
      movePosition: assign((ctx, event) => {
        if (event.type !== "MOVE") return ctx;
        const newX = ctx.x + event.deltaX;
        const newY = ctx.y + event.deltaY;
        return { ...ctx, x: newX, y: newY };
      }),
    },
  }
);

export default ShapeMachine;
