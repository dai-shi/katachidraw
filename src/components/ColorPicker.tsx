import * as React from "react"; // for expo
import { FC, memo } from "react";
import { useAtom } from "jotai";
// @ts-ignore
import { ColorPicker as CP } from "color-picker-react-native";

import { modeAtom } from "../atoms/canvas";
import { setColorAtom } from "../atoms/colorPicker";
import openColors from "../utils/open-color.json";

const colorIndex = 7;

export const ColorPicker: FC = () => {
  const [mode] = useAtom(modeAtom);
  const [, setColor] = useAtom(setColorAtom);
  if (mode !== "color") {
    return null;
  }
  return (
    <CP
      size={250}
      getColor={setColor}
      colorArray={[
        openColors.black,
        openColors.gray[colorIndex],
        openColors.red[colorIndex],
        openColors.pink[colorIndex],
        openColors.grape[colorIndex],
        openColors.violet[colorIndex],
        openColors.indigo[colorIndex],
        openColors.blue[colorIndex],
        openColors.cyan[colorIndex],
        openColors.teal[colorIndex],
        openColors.green[colorIndex],
        openColors.lime[colorIndex],
        openColors.yellow[colorIndex],
        openColors.orange[colorIndex],
      ]}
    />
  );
};

export default memo(ColorPicker);
