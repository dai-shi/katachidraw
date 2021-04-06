import { useService } from "@xstate/react";
import { useAtom } from "jotai";
import * as React from "react"; // for expo
import { FC, memo } from "react";
import { Platform } from "react-native";
import { G, Image, Path, Rect } from "react-native-svg";
import { IsPointInShape, setPressingShapeAtom } from "../atoms/drag";
import { ShapeAtom, TShapeImage, TShapePath } from "../atoms/shapes";
import { hackTouchableNode } from "../utils/touchHandlerHack";

const ShapePath: React.FC<{
  service: any;
}> = React.memo(({ service }) => {
  const [state, send] = useService<any, any, any>(service);
  const ref = React.useRef(null);
  const selected = state.matches("selected");
  const { x, y, scale, path, color, id } = state.context;

  React.useEffect(() => {
    const instance: any = ref.current;
    hackTouchableNode(instance);
    let isPointInShape: IsPointInShape;
    if (Platform.OS === "web") {
      const node = instance?._touchableNode;
      isPointInShape = (pos) => {
        const ele = document.elementFromPoint(pos[0], pos[1]);
        return !!node && (ele === node || ele?.parentNode === node);
      };
    } else {
      isPointInShape = (pos, offset, zoom) => {
        const point = instance.ownerSVGElement.createSVGPoint();
        point.x = offset.x + pos[0] / zoom;
        point.y = offset.y + pos[1] / zoom;
        return instance.isPointInFill(point);
      };
    }

    if (ref.current && !state.context.isPointInShape) {
      send({ type: "REGISTER_IS_POINT_IN_SHAPE", isPointInShape });
    }
  });

  return (
    <G
      transform={`translate(${x} ${y}) scale(${scale})`}
      onStartShouldSetResponder={() => true}
      onPress={() => {
        if (selected) {
          send({ type: "DESELECT_SHAPE" });
        } else {
          send({ type: "SELECT_SHAPE" });
        }
      }}
      onPressIn={() => {}}
      onPressOut={() => {}}
      ref={ref}
    >
      <Path
        d={path}
        fill="red"
        stroke="red"
        opacity={selected ? 0.2 : 0}
        strokeWidth={30 / scale}
      />
      <Path d={path} fill={color} stroke={color} strokeWidth="2" />
    </G>
  );
});

const ShapeImage: React.FC<{
  service: any;
}> = ({ service }) => {
  const [state, send] = useService<any, any, any>(service);
  const selected = state.matches("selected");
  const { x, y, scale, image, width, height } = state.context;
  const handleSize = 12 / scale;

  return (
    <G transform={`translate(${x} ${y}) scale(${scale})`}>
      <G
        onPress={() => {
          if (selected) {
            send({ type: "DESELECT_SHAPE" });
          } else {
            send({ type: "SELECT_SHAPE" });
          }
        }}
        onPressIn={() => {}}
        onPressOut={() => {}}
        ref={(instance: any) => {
          hackTouchableNode(instance);
        }}
      >
        <Rect
          x={-handleSize * 2}
          y={-handleSize * 2}
          width={handleSize * 3}
          height={handleSize * 3}
          fill="red"
          opacity={selected ? 0.2 : 0}
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
        href={Platform.OS === "web" ? (image as any) : { uri: image }}
        width={width}
        height={height}
        preserveAspectRatio="xMinYMin meet"
      />
    </G>
  );
};

export const Shape: FC<{
  service: any;
  type: string;
}> = ({ service, type }) => {
  if (type === "path") {
    return <ShapePath service={service} />;
  }
  if (type === "image") {
    return <ShapeImage service={service} />;
  }
  return null;
};

export default memo(Shape);
