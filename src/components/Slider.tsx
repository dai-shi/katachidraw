import { memo } from "react";
import { Rect, Circle, Path, G } from "react-native-svg";
import { useAtom } from "jotai/react";

import {
  historyPositionAtom,
  hisotryBackAtom,
  hisotryForwardAtom,
} from "../atoms/history";
import { hackTouchableNode } from "../utils/touchHandlerHack";

type Props = {
  width?: number;
  height?: number;
  radius?: number;
};

export const Slider = ({ width = 300, height = 40, radius = 6 }: Props) => {
  const [pos] = useAtom(historyPositionAtom);
  const [, historyBack] = useAtom(hisotryBackAtom);
  const [, historyForward] = useAtom(hisotryForwardAtom);

  return (
    <>
      <Rect
        x={0}
        y={0}
        rx={radius}
        ry={radius}
        width={width}
        height={height}
        fill="#ddd"
        opacity="0.8"
      />
      <Rect
        x={height}
        y={height * 0.4}
        rx={height * 0.1}
        ry={height * 0.1}
        width={width - height * 2}
        height={height * 0.2}
        fill="#bbb"
        opacity="0.8"
      />
      <Circle
        cx={height * 1.4 + (width - height * 1.4 * 2) * pos}
        cy={height / 2}
        r={height * 0.35}
        fill="#888"
      />
      <G
        transform={`translate(${height},${height}) scale(${
          height / 24
        }) rotate(180)`}
        fill="#444"
        onPress={historyBack}
        ref={hackTouchableNode}
      >
        <Rect width="24" height="24" opacity="0" />
        <Path d="M8 5v14l11-7z" />
      </G>
      <G
        transform={`translate(${width - height},0) scale(${height / 24})`}
        fill="#444"
        onPress={historyForward}
        ref={hackTouchableNode}
      >
        <Rect width="24" height="24" opacity="0" />
        <Path d="M8 5v14l11-7z" />
      </G>
    </>
  );
};

export default memo(Slider);
