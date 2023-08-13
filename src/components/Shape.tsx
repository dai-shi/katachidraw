import { memo, useMemo } from "react";
import { Platform } from "react-native";
import { G, Path, Image, Rect } from "react-native-svg";
import { atom } from "jotai/vanilla";
import { useAtom } from "jotai/react";

import { sendAtom, selectedAtom } from "../atoms/modeMachine";
import {
  ShapeAtom,
  TShapePath,
  TShapeImage,
  deleteShapeAtom,
} from "../atoms/shapes";
import { hackTouchableNode } from "../utils/touchHandlerHack";

const ShapePath = ({
  shapeAtom,
  shape,
  isSelected,
}: {
  shapeAtom: ShapeAtom;
  shape: TShapePath;
  isSelected: boolean;
}) => {
  const [, send] = useAtom(sendAtom);
  const [, deleteShape] = useAtom(deleteShapeAtom);

  return (
    <G
      transform={`translate(${shape.x} ${shape.y}) scale(${shape.scale})`}
      onPress={() => {
        if (isSelected) {
          // will check "erase" mode in the function
          deleteShape(shapeAtom);
        }
        send({ type: "PRESS_SHAPE", shapeAtom });
      }}
      ref={(instance: any) => hackTouchableNode(instance)}
    >
      <Path
        d={shape.path}
        fill="red"
        stroke="red"
        opacity={isSelected ? 0.2 : 0}
        strokeWidth={30 / shape.scale}
      />
      <Path d={shape.path} fill={shape.color} />
    </G>
  );
};

const ShapeImage = ({
  shapeAtom,
  shape,
  isSelected,
}: {
  shapeAtom: ShapeAtom;
  shape: TShapeImage;
  isSelected: boolean;
}) => {
  const [, send] = useAtom(sendAtom);
  const handleSize = 12 / shape.scale;

  return (
    <G
      transform={`translate(${shape.x} ${shape.y}) scale(${
        shape.scale
      }) rotate(${shape.rotate} ${shape.width / 2} ${shape.height / 2})`}
    >
      <G
        onPress={() => {
          send({ type: "PRESS_SHAPE", shapeAtom });
        }}
        ref={hackTouchableNode}
      >
        <Rect
          x={-handleSize * 2}
          y={-handleSize * 2}
          width={handleSize * 3}
          height={handleSize * 3}
          fill="red"
          opacity={isSelected ? 0.2 : 0}
        />
        <Rect
          x={-handleSize}
          y={-handleSize}
          width={handleSize}
          height={handleSize}
          fill="gray"
        />
      </G>
      <Image
        href={
          Platform.OS === "web" ? (shape.image as any) : { uri: shape.image }
        }
        width={shape.width}
        height={shape.height}
        preserveAspectRatio="xMinYMin meet"
      />
    </G>
  );
};

export const Shape = ({ shapeAtom }: { shapeAtom: ShapeAtom }) => {
  const [shape] = useAtom(shapeAtom);
  const [isSelected] = useAtom(
    useMemo(() => atom((get) => get(selectedAtom).has(shapeAtom)), [shapeAtom])
  );

  if ("path" in shape) {
    return (
      <ShapePath shapeAtom={shapeAtom} shape={shape} isSelected={isSelected} />
    );
  }
  if ("image" in shape) {
    return (
      <ShapeImage shapeAtom={shapeAtom} shape={shape} isSelected={isSelected} />
    );
  }
  return null;
};

export default memo(Shape);
