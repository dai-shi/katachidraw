import * as React from "react"; // for expo
import { FC, ReactElement, useEffect } from "react";
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

  return (
    <Svg
      viewBox={`${offset.x} ${offset.y} ${width / zoom} ${height / zoom}`}
      onStartShouldSetResponder={() => true}
      onResponderGrant={(e) => {
        const { locationX, locationY } = e.nativeEvent;
        drag({
          type: "start",
          pos: [locationX, locationY],
        });
      }}
      onResponderMove={(e) => {
        const { locationX, locationY } = e.nativeEvent;
        drag({
          type: "move",
          pos: [locationX, locationY],
        });
      }}
      onResponderEnd={() => {
        drag({ type: "end" });
      }}
      ref={hackTouchableNode}
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
          e.stopPropagation();
        }}
        ref={hackTouchableNode}
      >
        {ToolbarElement}
      </G>
    </Svg>
  );
};

export default Canvas;
