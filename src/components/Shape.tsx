import { FC, memo, useMemo } from "react";
import { PanResponder } from "react-native";
import { G, Path } from "react-native-svg";
import { useAtom } from "jotai";

import { ShapeAtom, selectAtom } from "../atoms/shapes";
import { setPressingShapeAtom, dragShapeAtom } from "../atoms/drag";
import { hackTouchableNode } from "../utils/touchHandlerHack";

export const SvgShape: FC<{
  shapeAtom: ShapeAtom;
}> = ({ shapeAtom }) => {
  const [shape] = useAtom(shapeAtom);
  const [, select] = useAtom(selectAtom);
  const [, setPressingShape] = useAtom(setPressingShapeAtom);
  const [, dragShape] = useAtom(dragShapeAtom);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (_evt, _gestureState) => false,
        onStartShouldSetPanResponderCapture: (_evt, _gestureState) => false,
        onMoveShouldSetPanResponder: (_evt, _gestureState) => true,
        onMoveShouldSetPanResponderCapture: (_evt, _gestureState) => false,
        onPanResponderTerminationRequest: (_evt, _gestureState) => false,
        onPanResponderMove: (_evt, _gestureState) => {
          dragShape(shapeAtom);
        },
      }),
    [dragShape, shapeAtom]
  );

  return (
    <G
      transform={`translate(${shape.x} ${shape.y})`}
      {...panResponder.panHandlers}
      onPress={() => {
        select(shapeAtom);
      }}
      onPressIn={() => {
        setPressingShape(shapeAtom);
      }}
      onPressOut={() => {
        setPressingShape(null);
      }}
      ref={hackTouchableNode({
        onPress: () => {
          select(shapeAtom);
        },
        onPressIn: () => {
          setPressingShape(shapeAtom);
        },
        onPressOut: () => {
          setPressingShape(null);
        },
        onDrag: () => {
          dragShape(shapeAtom);
        },
      })}
    >
      <Path
        d={shape.path}
        fill="none"
        stroke="red"
        opacity={shape.selected ? 0.2 : 0}
        strokeWidth="20"
      />
      <Path d={shape.path} fill="none" stroke={shape.color} strokeWidth="4" />
    </G>
  );
};

export default memo(SvgShape);
