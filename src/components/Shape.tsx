import { FC, memo } from "react";
import { G, Path } from "react-native-svg";
import { useAtom } from "jotai";

import { ShapeAtom, selectAtom } from "../atoms/shapes";
import {
  setPressingShapeAtom,
  registerIsPointInShapeAtom,
} from "../atoms/drag";
import { hackTouchableNode } from "../utils/touchHandlerHack";

export const SvgShape: FC<{
  shapeAtom: ShapeAtom;
}> = ({ shapeAtom }) => {
  const [shape] = useAtom(shapeAtom);
  const [, select] = useAtom(selectAtom);
  const [, setPressingShape] = useAtom(setPressingShapeAtom);

  const element = (
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
        init: (node: any) => {
          const isPointInShape = (pos: readonly [number, number]) => {
            const ele = document.elementFromPoint(pos[0], pos[1]);
            return ele === node || ele?.parentNode === node;
          };
          registerIsPointInShapeAtom(shapeAtom, isPointInShape);
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
  const { isPointInStroke } = element as any;
  if (isPointInStroke) {
    registerIsPointInShapeAtom(shapeAtom, ([x, y]: readonly [number, number]) =>
      isPointInStroke({ x, y })
    );
  }
  return element;
};

export default memo(SvgShape);
