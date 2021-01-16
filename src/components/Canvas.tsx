import { FC, ReactElement, useEffect, useRef } from "react";
import { View, PanResponder } from "react-native";
import Svg, { G } from "react-native-svg";
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
  ShapesElement?: ReactElement;
  DotsElement?: ReactElement;
  ToolbarElement?: ReactElement;
};

export const Canvas: FC<Props> = ({
  width,
  height,
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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_evt, _gestureState) => true,
      onStartShouldSetPanResponderCapture: (_evt, _gestureState) => false,
      onMoveShouldSetPanResponder: (_evt, _gestureState) => true,
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
    })
  ).current;

  return (
    <View {...panResponder.panHandlers}>
      <Svg viewBox={`${offset.x} ${offset.y} ${width / zoom} ${height / zoom}`}>
        {ShapesElement}
        {DotsElement}
        <G
          id="toolbar"
          transform={`translate(${offset.x + 10 / zoom} ${
            offset.y + 10 / zoom
          }) scale(${1 / zoom})`}
          onStartShouldSetResponder={() => false}
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
    </View>
  );
};

export default Canvas;
