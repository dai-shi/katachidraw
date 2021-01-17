import { FC, memo } from "react";
import { Platform } from "react-native";
import { G, Path } from "react-native-svg";
import { useAtom } from "jotai";

import { modeAtom } from "../atoms/canvas";
import { ShapeAtom, selectAtom } from "../atoms/shapes";
import {
  setPressingShapeAtom,
  IsPointInShape,
  registerIsPointInShape,
} from "../atoms/drag";
import { hackTouchableNode } from "../utils/touchHandlerHack";

export const SvgShape: FC<{
  shapeAtom: ShapeAtom;
}> = ({ shapeAtom }) => {
  const [mode] = useAtom(modeAtom); // XXX this is very unfortunate (re-render all shapes)
  const [shape] = useAtom(shapeAtom);
  const [, select] = useAtom(selectAtom);
  const [, setPressingShape] = useAtom(setPressingShapeAtom);

  return (
    <G
      transform={`translate(${shape.x} ${shape.y})`}
      onStartShouldSetResponder={() => mode !== "pen"}
      onPress={() => {
        select(shapeAtom);
      }}
      onPressIn={() => {
        setPressingShape(shapeAtom);
      }}
      onPressOut={() => {
        setPressingShape(null);
      }}
      ref={(instance: any) => {
        hackTouchableNode(instance);
        let isPointInShape: IsPointInShape;
        if (Platform.OS === "web") {
          const node = instance?._touchableNode;
          isPointInShape = (pos) => {
            const ele = document.elementFromPoint(pos[0], pos[1]);
            return !!node && (ele === node || ele?.parentNode === node);
          };
        } else {
          isPointInShape = (pos, offset, zoom) => {
            const point = instance.ownerSVGElement.createSVGPoint();
            point.x = offset.x + pos[0] / zoom;
            point.y = offset.y + pos[1] / zoom;
            // TODO isPointInStroke doesn't work
            // x/y straight lines don't work
            return instance.isPointInFill(point);
          };
        }
        registerIsPointInShape(shapeAtom, isPointInShape);
      }}
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
