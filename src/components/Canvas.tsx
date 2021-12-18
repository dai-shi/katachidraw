import { ReactElement, useEffect } from "react";
import Svg, { Rect, G } from "react-native-svg";
import { useAtom } from "jotai";

import { dimensionAtom, offsetAtom, zoomAtom } from "../atoms/canvas";
import { dragCanvasAtom } from "../atoms/drag";
import Shapes from "./Shapes";
import Dots from "./Dots";
import Toolbar from "./Toolbar";
import Slider from "./Slider";
import { hackTouchableNode } from "../utils/touchHandlerHack";
import { FileSystem } from "../modules/file-system/FileSystem";

type Props = {
  width: number;
  height: number;
  ShapesElement?: ReactElement;
  DotsElement?: ReactElement;
  toolbarPosition?: readonly [number, number];
  ToolbarElement?: ReactElement;
  sliderPosition?: readonly [number, number];
  SliderElement?: ReactElement;
};

export const Canvas = ({
  width,
  height,
  ShapesElement = <Shapes />,
  DotsElement = <Dots />,
  toolbarPosition = [5, 50],
  ToolbarElement = <Toolbar fileSystemModule={FileSystem} />,
  sliderPosition = [-(width * 0.75) - 10, -40 - 10],
  SliderElement = <Slider width={width * 0.75} />,
}: Props) => {
  const [, setDimension] = useAtom(dimensionAtom);
  useEffect(() => {
    setDimension({ width, height });
  }, [setDimension, width, height]);

  const [offset] = useAtom(offsetAtom);
  const [zoom] = useAtom(zoomAtom);
  const [, drag] = useAtom(dragCanvasAtom);

  return (
    <Svg viewBox={`${offset.x} ${offset.y} ${width / zoom} ${height / zoom}`}>
      <G
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponderCapture={() => true}
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
      </G>
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
      <G
        id="slider"
        transform={`translate(${
          offset.x + (width + sliderPosition[0]) / zoom
        } ${offset.y + (height + sliderPosition[1]) / zoom}) scale(${
          1 / zoom
        })`}
        onPressIn={(e) => {
          e.stopPropagation();
        }}
        ref={hackTouchableNode}
      >
        {SliderElement}
      </G>
    </Svg>
  );
};

export default Canvas;
