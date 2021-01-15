import { FC, memo } from "react";
import { G, Path } from "react-native-svg";
import { useAtom } from "jotai";

import { ShapeAtom, selectAtom } from "../atoms/shapes";
import { hackTouchableNodePress } from "../utils/touchHandlerHack";

export const SvgShape: FC<{
  shapeAtom: ShapeAtom;
}> = ({ shapeAtom }) => {
  const [shape] = useAtom(shapeAtom);
  const [, select] = useAtom(selectAtom);
  return (
    <G
      transform={`translate(${shape.x} ${shape.y})`}
      onPress={(e) => {
        e.preventDefault();
        e.stopPropagation();
        select(shapeAtom);
      }}
      ref={hackTouchableNodePress((e: any) => {
        e.preventDefault();
        e.stopPropagation();
        select(shapeAtom);
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
