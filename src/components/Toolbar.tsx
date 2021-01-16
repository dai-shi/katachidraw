import { FC, ReactElement, memo } from "react";
import { G, Rect } from "react-native-svg";
import { useAtom } from "jotai";

import { toolbarAtom } from "../atoms/toolbar";
import { hackTouchableNodePress } from "../utils/touchHandlerHack";
import PenIcon from "../icons/Pen";
import HandIcon from "../icons/Hand";
import ZoomInIcon from "../icons/ZoomIn";
import ZoomOutIcon from "../icons/ZoomOut";
import PaletteIcon from "../icons/Palette";
import DeleteIcon from "../icons/Delete";

const icons: Record<string, ReactElement> = {
  pen: <PenIcon />,
  hand: <HandIcon />,
  zoomIn: <ZoomInIcon />,
  zoomOut: <ZoomOutIcon />,
  palette: <PaletteIcon />,
  erase: <DeleteIcon />,
};

const left = 0;
const top = 0;
const size = 30;
const margin = 8;
const radius = 6;

export const SvgToolbar: FC = () => {
  const [tools, dispatch] = useAtom(toolbarAtom);
  return (
    <>
      <Rect
        x={left}
        y={top}
        rx={radius}
        ry={radius}
        width={size + margin * 2}
        height={margin + (size + margin) * tools.length}
        fill="#ddd"
        opacity="0.8"
      />
      {tools.map((tool, i) => (
        <G
          key={tool.id}
          onPress={(e) => {
            e.preventDefault();
            e.stopPropagation();
            dispatch(tool.id);
          }}
          ref={hackTouchableNodePress((e: any) => {
            e.preventDefault();
            e.stopPropagation();
            dispatch(tool.id);
          })}
        >
          <Rect
            x={left + margin}
            y={top + margin + (size + margin) * i}
            rx={radius}
            ry={radius}
            width={size}
            height={size}
            stroke={tool.active ? "#000" : "none"}
            strokeWidth="2.5"
            fill="#aaa"
            opacity="0.8"
          />
          <G
            x={left + margin + (size - 24) / 2}
            y={top + margin + (size + margin) * i + (size - 24) / 2}
            fill="#444"
          >
            {icons[tool.id]}
          </G>
        </G>
      ))}
    </>
  );
};

export default memo(SvgToolbar);
