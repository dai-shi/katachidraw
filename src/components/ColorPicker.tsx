import * as React from "react"; // for expo
import { FC, memo } from "react";
import { Rect } from "react-native-svg";
import openColors from "../utils/open-color.json";
import { hackTouchableNode } from "../utils/touchHandlerHack";

type Props = {
  setColor?: any;
};

export const ColorPicker: FC<Props> = ({ setColor }) => {
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
      {([
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
      ] as const).map((colorName, index) =>
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
