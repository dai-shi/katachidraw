import { assign, createMachine } from "xstate";
import { pure, sendParent } from "xstate/lib/actions";

type ShapeEvent =
  | { type: "BIGGER"; top: number; left: number }
  | { type: "SMALLER"; top: number; left: number }
  | { type: "SELECT_SHAPE" }
  | { type: "DESELECT_SHAPE" }
  | { type: "REGISTER_IS_POINT_IN_SHAPE"; isPointInShape: any }
  | { type: "MOVE"; deltaX: number; deltaY: number };

interface ImageContext {
  x: number;
  y: number;
  scale: number;
  id: string;
  image: string;
  width: number;
  height: number;
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

const ImageMachine = createMachine<ImageContext, ShapeEvent>(
  {
    key: "shape",
    initial: "unselected",
    context: {
      x: 0,
      y: 0,
      scale: 1,
      id: "",
      image: "",
      width: 0,
      height: 0,
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
      notifyParentShapeUpdated: sendParent((ctx) => ({
        type: "SHAPE_UPDATED",
        id: ctx.id,
        shapeData: {
          x: 0,
          y: ctx.y,
          image: ctx.image,
          width: ctx.width,
          height: ctx.height,
          scale: ctx.scale,
          id: ctx.id,
        },
      })),
      movePosition: assign((ctx, event) => {
        if (event.type !== "MOVE") return ctx;
        console.log("MOVE", event);
        const newX = ctx.x + event.deltaX;
        const newY = ctx.y + event.deltaY;
        return { ...ctx, x: newX, y: newY };
      }),
    },
  }
);

export default ImageMachine;
