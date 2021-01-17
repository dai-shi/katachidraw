import { FC, memo } from "react";
import { Platform } from "react-native";
import { G, Path } from "react-native-svg";
import { useAtom } from "jotai";

import { ShapeAtom, selectAtom } from "../atoms/shapes";
import { setPressingShapeAtom, registerIsPointInShape } from "../atoms/drag";
import { hackTouchableNode } from "../utils/touchHandlerHack";

export const SvgShape: FC<{
  shapeAtom: ShapeAtom;
}> = ({ shapeAtom }) => {
  const [shape] = useAtom(shapeAtom);
  const [, select] = useAtom(selectAtom);
  const [, setPressingShape] = useAtom(setPressingShapeAtom);

  return (
    <G
      transform={`translate(${shape.x} ${shape.y})`}
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
        let isPointInShape: (pos: readonly [number, number]) => boolean;
        if (Platform.OS === "web") {
          const node = instance?._touchableNode;
          isPointInShape = (pos) => {
            const ele = document.elementFromPoint(pos[0], pos[1]);
            return !!node && (ele === node || ele?.parentNode === node);
          };
        } else {
          isPointInShape = (pos) =>
            !!instance?.isPointInStroke({ x: pos[0], y: pos[1] });
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
