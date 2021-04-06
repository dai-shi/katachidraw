import getPath from "perfect-freehand";
import { assign, createMachine, spawn } from "xstate";
import { pure, send } from "xstate/lib/actions";
import { PrintCanvas } from "../components/PrintCanvas";
import { FileSystem } from "../modules/file-system/FileSystem";
import { serialize } from "../utils/serialize";
import { adjustSvgPath } from "../utils/svgpath";
import { v4 as uuid } from "uuid";
import ImageMachine from "./ImageMachine";
import ShapeMachine from "./ShapeMachine";

type CanvasEvent =
  | { type: "START_DRAG"; pos: [number, number] }
  | { type: "END_DRAG" }
  | { type: "DRAG"; pos: [number, number] }
  | { type: "SELECT_COLOR" }
  | { type: "SELECT_PAN" }
  | { type: "SELECT_DRAW" }
  | { type: "SELECT_MOVE" }
  | { type: "SELECT_ERASE" }
  | { type: "POINT_IS_IN_SHAPE"; id: string }
  | { type: "ZOOM_IN" }
  | { type: "ZOOM_OUT" }
  | { type: "BIGGER" }
  | { type: "SMALLER" }
  | { type: "SHAPE_SELECTED"; id: string }
  | { type: "SHAPE_DESELECTED"; id: string }
  | { type: "DESELECT_SHAPE" }
  | { type: "UPLOAD_IMAGE" }
  | { type: "SELECT_SAVE" }
  | { type: "SET_DIMENSIONS"; width: number; height: number }
  | { type: "SET_COLOR"; color: string }
  | { type: "SHAPE_UPDATED"; id: string; shapeData: any }
  | { type: "REGISTER_IS_POINT_IN_SHAPE"; id: string; isPointInShape: any }
  | { type: "done.invoke.fetchData" }
  | { type: "done.invoke.imageUpload"; data: any };

interface CanvasContext {
  dimensions: { width: number; height: number };
  offset: { x: number; y: number };
  dragCurrentPosition: [number, number];
  dragStartPosition: [number, number];
  zoom: number;
  dots: any;
  shapes: any;
  allShapesData: any;
  selectedShapes: string[];
  color: string;
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

const CanvasMachine = createMachine<CanvasContext, CanvasEvent>(
  {
    key: "canvas",
    initial: "draw",
    type: "parallel",
    context: {
      dimensions: { width: 0, height: 0 },
      offset: { x: 0, y: 0 },
      dragStartPosition: [0, 0],
      dragCurrentPosition: [0, 0],
      zoom: 1,
      shapes: {},
      allShapesData: {},
      dots: [],
      selectedShapes: [],
      color: "black",
    },
    states: {
      selection: {
        initial: "noSelection",
        states: {
          noSelection: {
            on: {
              ZOOM_IN: {
                actions: ["setOffsetFromZoomIn"],
              },
              ZOOM_OUT: {
                actions: ["setOffsetFromZoomOut"],
              },
              SHAPE_SELECTED: {
                target: "shapeSelected",
                actions: ["addSelectedShape"],
              },
            },
          },
          shapeSelected: {
            on: {
              SHAPE_SELECTED: {
                actions: ["addSelectedShape"],
              },
              SHAPE_DESELECTED: [
                {
                  target: "noSelection",
                  actions: ["removeSelectedShape"],
                  cond: "noShapesSelected",
                },
                {
                  actions: ["removeSelectedShape"],
                },
              ],
              SELECT_DRAW: {
                target: "noSelection",
                actions: ["clearSelectedShapes", "notifyShapesShouldDeselect"],
              },
              SELECT_ERASE: {
                target: "noSelection",
                actions: ["clearSelectedShapes", "notifyShapesShouldDeselect"],
              },
              SELECT_PAN: {
                target: "noSelection",
                actions: ["clearSelectedShapes", "notifyShapesShouldDeselect"],
              },
              BIGGER: {
                actions: ["notifySelectedShapesBigger"],
              },
              SMALLER: {
                actions: ["notifySelectedShapesSmaller"],
              },
            },
          },
        },
      },
      mode: {
        initial: "draw",
        states: {
          draw: {
            initial: "idle",
            states: {
              idle: {
                on: {
                  START_DRAG: {
                    target: "dragging",
                    actions: ["addDotPosition"],
                  },
                },
              },
              dragging: {
                on: {
                  DRAG: {
                    actions: ["addDotPosition"],
                  },
                  END_DRAG: {
                    target: "idle",
                    actions: ["commitDots", "clearDots"],
                  },
                },
              },
            },
          },
          pan: {
            initial: "idle",
            states: {
              idle: {
                on: {
                  START_DRAG: {
                    target: "dragging",
                    actions: ["setDragStartPosition", "setDragCurrentPosition"],
                  },
                },
              },
              dragging: {
                on: {
                  DRAG: [
                    {
                      in: "#canvas.selection.shapeSelected",
                      actions: ["notifySelectedShapesMove"],
                    },
                    {
                      actions: [
                        "setOffsetWhilePanning",
                        "setDragCurrentPosition",
                      ],
                    },
                  ],
                  END_DRAG: {
                    target: "idle",
                  },
                },
              },
            },
          },
          erase: {
            initial: "idle",
            states: {
              idle: {
                on: {
                  START_DRAG: {
                    target: "dragging",
                    actions: [],
                  },
                },
              },
              dragging: {
                on: {
                  DRAG: {
                    actions: ["notifyShapesCheckPointInShape"],
                  },
                  END_DRAG: {
                    target: "idle",
                  },
                },
              },
            },
            on: {
              POINT_IS_IN_SHAPE: {
                actions: ["deleteShape"],
              },
            },
          },
          color: {
            on: {
              SET_COLOR: {
                target: "draw",
                actions: ["setColor", "notifySelectedShapesColor"],
              },
              SELECT_COLOR: {
                target: "draw",
              },
            },
          },
        },
        on: {
          SELECT_DRAW: {
            target: "#canvas.mode.draw",
          },
          SELECT_MOVE: {
            // target: "move",
          },
          SELECT_ERASE: {
            target: "#canvas.mode.erase",
          },
          SELECT_PAN: {
            target: "#canvas.mode.pan",
          },
          SELECT_COLOR: [
            {
              target: "#canvas.mode.color",
            },
          ],
          SELECT_SAVE: {
            actions: [
              (ctx) => {
                const svgString = serialize(
                  PrintCanvas({ shapes: Object.values(ctx.allShapesData) })
                );
                FileSystem.saveSvgFile(svgString);
              },
            ],
          },
        },
      },
      imageUpload: {
        initial: "idle",
        states: {
          idle: {
            on: {
              UPLOAD_IMAGE: {
                target: "selecting",
              },
            },
          },
          selecting: {
            invoke: {
              id: "imageUpload",
              src: () => FileSystem.loadImageFile(),
              onDone: {
                target: "idle",
                actions: ["addImage"],
              },
            },
          },
        },
      },
    },
    on: {
      SET_DIMENSIONS: {
        actions: ["setDimensions"],
      },
      REGISTER_IS_POINT_IN_SHAPE: {
        actions: ["registerIsPointInShape"],
      },
      SHAPE_UPDATED: {
        actions: ["updateShapeData"],
      },
    },
  },
  {
    actions: {
      addDotPosition: assign({
        dots: (ctx, event) => {
          if (event.type !== "START_DRAG" && event.type !== "DRAG")
            return ctx.dots;
          const [x, y] = event.pos;
          const { zoom, offset } = ctx;
          return [...ctx.dots, [x / zoom + offset.x, y / zoom + offset.y]];
        },
      }),
      commitDots: assign((ctx) => {
        const id = uuid();
        const path = getPath(ctx.dots);
        const shapeData = {
          ...adjustSvgPath(path),
          scale: 1,
          color: ctx.color,
          id,
        };
        const shape = {
          ref: spawn(
            ShapeMachine.withContext({
              ...shapeData,
              isPointInShape: undefined,
            })
          ),
          type: "path",
          id,
        };
        return {
          ...ctx,
          shapes: { ...ctx.shapes, [id]: shape },
          allShapesData: { ...ctx.allShapesData, [id]: shapeData },
        };
      }),
      clearDots: assign({
        dots: (ctx) => [],
      }),
      addImage: assign((ctx, event) => {
        if (event.type !== "done.invoke.imageUpload") return ctx;
        const id = uuid();
        const shapeData = {
          x: 100,
          y: 100,
          scale: 1,
          image: event.data,
          width: 300,
          height: 300,
          id,
        };
        const shape = {
          ref: spawn(ImageMachine.withContext(shapeData)),
          type: "image",
          id,
        };
        return {
          ...ctx,
          shapes: { ...ctx.shapes, [id]: shape },
          allShapesData: { ...ctx.allShapesData, [id]: shapeData },
        };
      }),
      setColor: assign({
        color: (ctx, event) => {
          if (event.type !== "SET_COLOR") return ctx.color;
          return event.color;
        },
      }),
      setDragStartPosition: assign({
        dragStartPosition: (ctx, event) => {
          if (event.type !== "START_DRAG") return ctx.dragStartPosition;
          return [
            ctx.offset.x + event.pos[0] / ctx.zoom,
            ctx.offset.y + event.pos[1] / ctx.zoom,
          ];
        },
      }),
      setOffsetWhilePanning: assign({
        offset: (ctx, event) => {
          if (event.type !== "DRAG") return ctx.offset;
          let deltaX = event.pos[0] - ctx.dragCurrentPosition[0];
          let deltaY = event.pos[1] - ctx.dragCurrentPosition[1];
          return {
            x: ctx.offset.x - deltaX / ctx.zoom,
            y: ctx.offset.y - deltaY / ctx.zoom,
          };
        },
      }),
      setOffsetFromZoomIn: assign((ctx, event) => {
        if (event.type !== "ZOOM_IN") return ctx;
        const nextZoom = ctx.zoom * 1.2;
        const nextoffset = {
          x:
            ctx.offset.x +
            (ctx.dimensions.width * (1 / ctx.zoom - 1 / nextZoom)) / 2,
          y:
            ctx.offset.y +
            (ctx.dimensions.height * (1 / ctx.zoom - 1 / nextZoom)) / 2,
        };
        return {
          ...ctx,
          zoom: nextZoom,
          offset: nextoffset,
        };
      }),
      setOffsetFromZoomOut: assign((ctx, event) => {
        if (event.type !== "ZOOM_OUT") return ctx;
        const nextZoom = ctx.zoom / 1.2;
        const nextoffset = {
          x:
            ctx.offset.x +
            (ctx.dimensions.width * (1 / ctx.zoom - 1 / nextZoom)) / 2,
          y:
            ctx.offset.y +
            (ctx.dimensions.height * (1 / ctx.zoom - 1 / nextZoom)) / 2,
        };
        return {
          ...ctx,
          zoom: nextZoom,
          offset: nextoffset,
        };
      }),
      setDimensions: assign({
        dimensions: (ctx, event) => {
          if (event.type !== "SET_DIMENSIONS") return ctx.dimensions;
          return {
            width: event.width,
            height: event.height,
          };
        },
      }),
      addSelectedShape: assign({
        selectedShapes: (ctx, event) => {
          if (event.type !== "SHAPE_SELECTED") return ctx.selectedShapes;
          return [...ctx.selectedShapes, event.id];
        },
      }),
      removeSelectedShape: assign({
        selectedShapes: (ctx, event) => {
          if (event.type !== "SHAPE_DESELECTED") return ctx.selectedShapes;
          return ctx.selectedShapes.filter((id) => id !== event.id);
        },
      }),
      clearSelectedShapes: assign({
        selectedShapes: (ctx) => [],
      }),
      registerIsPointInShape: assign({
        shapes: (ctx, event) => {
          if (event.type !== "REGISTER_IS_POINT_IN_SHAPE") return ctx.shapes;
          let updatedShapes = {
            ...ctx.shapes,
            [event.id]: {
              ...ctx.shapes[event.id],
              isPointInShape: event.isPointInShape,
            },
          };

          return updatedShapes;
        },
      }),
      checkShapeInDrag: pure((ctx, event) => {
        if (event.type !== "DRAG") return [] as any;
        const ids: string[] = [];
        Object.keys(ctx.shapes).forEach((id: any) => {
          if (
            ctx.shapes[id].isPointInShape?.(event.pos, ctx.offset, ctx.zoom)
          ) {
            ids.push(id);
          }
        });
        if (ids.length > 0) {
          let newShapes = { ...ctx.shapes };
          ids.forEach((id) => {
            delete newShapes[id];
          });
          return [
            assign({
              shapes: newShapes,
            }),
          ];
        }
        return [];
      }),
      notifyShapesShouldDeselect: pure((ctx) => {
        return Object.values(ctx.shapes).map((shape: any) => {
          return send({ type: "DESELECT_SHAPE" }, { to: shape.ref });
        });
      }),
      notifyShapesCheckPointInShape: pure((ctx, event) => {
        if (event.type !== "DRAG") return [] as any;
        return Object.values(ctx.shapes).map((shape: any) => {
          return send(
            {
              type: "CHECK_POINT_IN_SHAPE",
              pos: event.pos,
              offset: ctx.offset,
              zoom: ctx.zoom,
            },
            { to: shape.ref }
          );
        });
      }),
      notifySelectedShapesColor: pure((ctx, event) => {
        if (event.type !== "SET_COLOR") return [] as any;
        return ctx.selectedShapes.map((id) => {
          const shape = ctx.shapes[id];
          return send(
            {
              type: "SET_COLOR",
              color: event.color,
            },
            { to: shape.ref }
          );
        });
      }),
      notifySelectedShapesBigger: pure((ctx, event) => {
        if (event.type !== "BIGGER") return [] as any;
        let left = Infinity;
        let top = Infinity;
        ctx.selectedShapes.forEach((id) => {
          const shapeData = ctx.allShapesData[id];
          left = Math.min(left, shapeData.x);
          top = Math.min(top, shapeData.y);
        });
        return ctx.selectedShapes.map((id) => {
          const shape = ctx.shapes[id];
          return send(
            {
              type: "BIGGER",
              left,
              top,
            },
            { to: shape.ref }
          );
        });
      }),
      notifySelectedShapesSmaller: pure((ctx, event) => {
        if (event.type !== "SMALLER") return [] as any;
        let left = Infinity;
        let top = Infinity;
        ctx.selectedShapes.forEach((id) => {
          const shapeData = ctx.allShapesData[id];
          left = Math.min(left, shapeData.x);
          top = Math.min(top, shapeData.y);
        });
        return ctx.selectedShapes.map((id) => {
          const shape = ctx.shapes[id];
          return send(
            {
              type: "SMALLER",
              left,
              top,
            },
            { to: shape.ref }
          );
        });
      }),
      notifySelectedShapesMove: pure((ctx, event) => {
        if (event.type !== "DRAG") return [] as any;
        let deltaX = (event.pos[0] - ctx.dragCurrentPosition[0]) / ctx.zoom;
        let deltaY = (event.pos[1] - ctx.dragCurrentPosition[1]) / ctx.zoom;
        const allShapesData = { ...ctx.allShapesData };
        ctx.selectedShapes.forEach((id) => {
          const shapeData = ctx.allShapesData[id];
          const newX = shapeData.x + deltaX;
          const newY = shapeData.y + deltaY;
          allShapesData[id] = { ...shapeData, x: newX, y: newY };
        });

        const actions: any = ctx.selectedShapes.map((id) => {
          const shape = ctx.shapes[id];
          return send(
            {
              type: "MOVE",
              deltaX,
              deltaY,
            },
            { to: shape.ref }
          );
        });
        actions.push(assign({ allShapesData }));

        // this is included here rather than in the event definition because in v4
        // assign actions have priority, but we need to get the prev drag position before overwriting it
        actions.push("setDragCurrentPosition");

        return actions;
      }),
      deleteShape: assign((ctx, event) => {
        if (event.type !== "POINT_IS_IN_SHAPE") return ctx;
        let newShapes = { ...ctx.shapes };
        delete newShapes[event.id];
        let newAllShapesData = { ...ctx.allShapesData };
        delete newAllShapesData[event.id];
        return {
          ...ctx,
          shapes: newShapes,
          allShapesData: newAllShapesData,
        };
      }),
      updateShapeData: assign({
        allShapesData: (ctx, event) => {
          if (event.type !== "SHAPE_UPDATED") return ctx.shapes;
          return { ...ctx.allShapesData, [event.id]: event.shapeData };
        },
      }),
      setDragCurrentPosition: assign({
        dragCurrentPosition: (ctx, event) => {
          if (event.type !== "START_DRAG" && event.type !== "DRAG")
            return ctx.dragCurrentPosition;
          return event.pos;
        },
      }),
    },
    guards: {
      noShapesSelected: (ctx, event) => {
        if (event.type !== "SHAPE_DESELECTED") return false;
        return (
          ctx.selectedShapes.length === 1 && ctx.selectedShapes[0] === event.id
        );
      },
    },
  }
);

export default CanvasMachine;
