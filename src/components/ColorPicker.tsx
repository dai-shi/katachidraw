import { memo } from "react";
import { Rect } from "react-native-svg";
import { useAtom } from "jotai";

import { modeAtom } from "../atoms/modeMachine";
import { setColorAtom } from "../atoms/colorPicker";
import { hackTouchableNode } from "../utils/touchHandlerHack";
import openColors from "../utils/open-color.json";

export const ColorPicker = () => {
  const [mode] = useAtom(modeAtom);
  const [, setColor] = useAtom(setColorAtom);
  if (mode !== "color") {
    return null;
  }
  return (
    <>
      <Rect
        x={0}
        y={0}
        width={30 * 10}
        height={30}
        fill="black"
        onPress={() => setColor("black")}
        ref={hackTouchableNode}
      />
      {(
        [
          "gray",
          "red",
          "pink",
          "grape",
          "violet",
          "indigo",
          "blue",
          "cyan",
          "teal",
          "green",
          "lime",
          "yellow",
          "orange",
        ] as const
      ).map((colorName, index) =>
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((colorIndex) => (
          <Rect
            key={`${colorName}-${colorIndex}`}
            x={30 * (9 - colorIndex)}
            y={30 * (1 + index)}
            width={30}
            height={30}
            fill={openColors[colorName][colorIndex]}
            onPress={() => setColor(openColors[colorName][colorIndex])}
            ref={hackTouchableNode}
          />
        ))
      )}
    </>
  );
};

export default memo(ColorPicker);
