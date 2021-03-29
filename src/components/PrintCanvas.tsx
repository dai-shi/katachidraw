import * as React from "react"; // for expo
import { FC, ComponentType, ComponentProps } from "react";
import SvgOrig, { G, Path, Image } from "react-native-svg";

import type { TShape } from "../atoms/shapes";

const Svg = (SvgOrig as unknown) as ComponentType<
  ComponentProps<SvgOrig> & {
    xmlns: string;
  }
>;

type Props = {
  shapes: TShape[];
};

export const PrintCanvas: FC<Props> = ({ shapes }) => (
  <Svg xmlns="http://www.w3.org/2000/svg">
    {shapes.map((shape, index) => (
      <G
        key={index}
        transform={`translate(${shape.x} ${shape.y}) scale(${shape.scale})${
          "image" in shape
            ? ` rotate(${shape.rotate} ${shape.width / 2} ${shape.height / 2})`
            : ""
        }`}
      >
        {"path" in shape && <Path d={shape.path} fill={shape.color} />}
        {"image" in shape && (
          <Image
            href={shape.image as any}
            width={shape.width}
            height={shape.height}
            preserveAspectRatio="xMinYMin meet"
          />
        )}
      </G>
    ))}
  </Svg>
);

export default PrintCanvas;
