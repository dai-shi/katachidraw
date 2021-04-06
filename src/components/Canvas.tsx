import { useInterpret, useSelector } from "@xstate/react";
import * as React from "react"; // for expo
import { FC, ReactElement, useEffect } from "react";
import Svg, { G, Rect } from "react-native-svg";
import CanvasMachine from "../machines/CanvasMachine";
import { FileSystem } from "../modules/file-system/FileSystem";
import { hackTouchableNode } from "../utils/touchHandlerHack";
import Dots from "./Dots";
import Shapes from "./Shapes";
import Slider from "./Slider";
import Toolbar from "./Toolbar";

type Props = {
  width: number;
  height: number;
  toolbarPosition?: readonly [number, number];
  sliderPosition?: readonly [number, number];
  SliderElement?: ReactElement;
};

const selectShapes = (state: any) => state.context.shapes;
const selectDots = (state: any) => state.context.dots;
const selectOffset = (state: any) => state.context.offset;
const selectZoom = (state: any) => state.context.zoom;

export const Canvas: FC<Props> = ({
  width,
  height,
  toolbarPosition = [5, 50],
  sliderPosition = [-(width * 0.75) - 10, -40 - 10],
  SliderElement = <Slider width={width * 0.75} />,
}) => {
  const service = useInterpret(CanvasMachine, { devTools: true });
  const shapes = useSelector(service, selectShapes) || {};
  const dots = useSelector(service, selectDots);
  const offset = useSelector(service, selectOffset);
  const zoom = useSelector(service, selectZoom);

  useEffect(() => {
    service.send({ type: "SET_DIMENSIONS", width, height });
  }, [width, height]);

  return (
    <Svg viewBox={`${offset.x} ${offset.y} ${width / zoom} ${height / zoom}`}>
      <G
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponderCapture={() => true}
        onResponderGrant={(e) => {
          const { locationX, locationY } = e.nativeEvent;
          service.send({ type: "START_DRAG", pos: [locationX, locationY] });
        }}
        onResponderMove={(e) => {
          const { locationX, locationY } = e.nativeEvent;
          service.send({ type: "DRAG" as any, pos: [locationX, locationY] });
        }}
        onResponderEnd={() => {
          service.send({ type: "END_DRAG" });
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
        <Shapes shapes={shapes} />
        <Dots dots={dots} />
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
        <Toolbar service={service} fileSystemModule={FileSystem} />
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
