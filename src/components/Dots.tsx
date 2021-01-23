import * as React from "react"; // for expo
import { FC, memo } from "react";
import { Circle } from "react-native-svg";
import { useAtom } from "jotai";

import { dotsAtom } from "../atoms/dots";

export const Dots: FC = () => {
  const [dots] = useAtom(dotsAtom);
  return (
    <>
      {dots.map((dot, index) => (
        <Circle key={index} cx={dot[0]} cy={dot[1]} r="2" fill="gray" />
      ))}
    </>
  );
};

export default memo(Dots);
