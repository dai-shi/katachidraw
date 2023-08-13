import { memo } from "react";
import { Circle } from "react-native-svg";
import { useAtom } from "jotai/react";

import { dotsAtom } from "../atoms/dots";

export const Dots = () => {
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
