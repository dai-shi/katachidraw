import { FC, ReactElement, useEffect, useMemo } from "react";
import { PanResponder } from "react-native";
import Svg, { Rect, G } from "react-native-svg";
import { useAtom } from "jotai";

import { dimensionAtom, offsetAtom, zoomAtom } from "../atoms/canvas";
import { dragCanvasAtom } from "../atoms/drag";
import Shapes from "./Shapes";
import Dots from "./Dots";
import Toolbar from "./Toolbar";
import { hackTouchableNode } from "../utils/touchHandlerHack";

type Props = {
  width: number;
  height: number;
  toolbarPosition?: readonly [number, number];
  ShapesElement?: ReactElement;
  DotsElement?: ReactElement;
  ToolbarElement?: ReactElement;
};

export const Canvas: FC<Props> = ({
  width,
  height,
  toolbarPosition = [5, 50],
  ShapesElement = <Shapes />,
  DotsElement = <Dots />,
  ToolbarElement = <Toolbar />,
}) => {
  const [, setDimension] = useAtom(dimensionAtom);
  useEffect(() => {
    setDimension({ width, height });
  }, [setDimension, width, height]);

  const [offset] = useAtom(offsetAtom);
  const [zoom] = useAtom(zoomAtom);
  const [, drag] = useAtom(dragCanvasAtom);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (_evt, _gestureState) => true,
        onStartShouldSetPanResponderCapture: (_evt, _gestureState) => false,
        onMoveShouldSetPanResponder: (_evt, _gestureState) => false,
        onMoveShouldSetPanResponderCapture: (_evt, _gestureState) => false,
        onPanResponderGrant: (_evt, gestureState) => {
          drag({
            type: "start",
            pos: [gestureState.x0, gestureState.y0],
          });
        },
        onPanResponderMove: (_evt, gestureState) => {
          drag({
            type: "move",
            pos: [gestureState.moveX, gestureState.moveY],
          });
        },
        onPanResponderRelease: (_evt, _gestureState) => {
          drag({ type: "end" });
        },
      }),
    [drag]
  );

  return (
    <Svg
      viewBox={`${offset.x} ${offset.y} ${width / zoom} ${height / zoom}`}
      {...panResponder.panHandlers}
      ref={hackTouchableNode({
        onPressIn: (e: any) => {
          const { clientX, clientY } = e.touches ? e.touches[0] : e;
          drag({
            type: "start",
            pos: [clientX, clientY],
          });
        },
        onDrag: (e: any) => {
          const { clientX, clientY } = e.touches ? e.touches[0] : e;
          drag({
            type: "move",
            pos: [clientX, clientY],
          });
        },
        onPressOut: () => {
          drag({ type: "end" });
        },
      })}
    >
      <Rect
        x={offset.x}
        y={offset.y}
        width={width / zoom}
        height={height / zoom}
        opacity="0"
      />
      {ShapesElement}
      {DotsElement}
      <G
        id="toolbar"
        transform={`translate(${offset.x + toolbarPosition[0] / zoom} ${
          offset.y + toolbarPosition[1] / zoom
        }) scale(${1 / zoom})`}
        onPressIn={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        ref={hackTouchableNode({
          onPressIn: (e: any) => {
            e.preventDefault();
            e.stopPropagation();
          },
        })}
      >
        {ToolbarElement}
      </G>
    </Svg>
  );
};

export default Canvas;
