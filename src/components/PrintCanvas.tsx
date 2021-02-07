import * as React from "react"; // for expo
import { FC, ComponentType, ComponentProps } from "react";
import SvgOrig, { G, Path } from "react-native-svg";

const Svg = (SvgOrig as unknown) as ComponentType<
  ComponentProps<SvgOrig> & {
    xmlns: string;
  }
>;

type Shape = {
  path: string;
  color: string;
  x: number;
  y: number;
};

type Props = {
  shapes: Shape[];
};

export const PrintCanvas: FC<Props> = ({ shapes }) => (
  <Svg xmlns="http://www.w3.org/2000/svg">
    {shapes.map((shape, index) => (
      <G key={index} transform={`translate(${shape.x} ${shape.y})`}>
        <Path d={shape.path} fill="none" stroke={shape.color} strokeWidth="4" />
      </G>
    ))}
  </Svg>
);

export default PrintCanvas;
