import * as React from "react"; // for expo
import { FC, ReactElement, memo } from "react";
import { G, Rect } from "react-native-svg";
import { useAtom } from "jotai";

import { toolbarAtom } from "../atoms/toolbar";
import ColorPicker from "../components/ColorPicker";
import { hackTouchableNode } from "../utils/touchHandlerHack";
import PenIcon from "../icons/Pen";
import HandIcon from "../icons/Hand";
import MoveIcon from "../icons/Move";
import ZoomInIcon from "../icons/ZoomIn";
import ZoomOutIcon from "../icons/ZoomOut";
import BiggerIcon from "../icons/Bigger";
import SmallerIcon from "../icons/Smaller";
import RotateLeftIcon from "../icons/RotateLeft";
import RotateRightIcon from "../icons/RotateRight";
import PaletteIcon from "../icons/Palette";
import DeleteIcon from "../icons/Delete";
import SaveIcon from "../icons/Save";
import ImageIcon from "../icons/Image";
import { FileSystemModule } from "../modules/file-system/FileSystemModule";

const icons: Record<string, ReactElement> = {
  draw: <PenIcon />,
  pan: <HandIcon />,
  move: <MoveIcon />,
  zoomIn: <ZoomInIcon />,
  zoomOut: <ZoomOutIcon />,
  bigger: <BiggerIcon />,
  smaller: <SmallerIcon />,
  rotateLeft: <RotateLeftIcon />,
  rotateRight: <RotateRightIcon />,
  color: <PaletteIcon />,
  erase: <DeleteIcon />,
  save: <SaveIcon />,
  image: <ImageIcon />,
};

type Props = {
  size?: number;
  margin?: number;
  radius?: number;
  ColorPickerElement?: ReactElement;
  fileSystemModule: FileSystemModule;
};

export const Toolbar: FC<Props> = ({
  size = 36,
  margin = 8,
  radius = 6,
  ColorPickerElement = <ColorPicker />,
  fileSystemModule,
}) => {
  const [tools, dispatch] = useAtom(toolbarAtom);
  return (
    <>
      <Rect
        x={0}
        y={0}
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
          onPressIn={() => {
            dispatch({ id: tool.id, fileSystemModule });
          }}
          ref={hackTouchableNode}
        >
          <Rect
            x={margin}
            y={margin + (size + margin) * i}
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
            x={margin + (size - 24) / 2}
            y={margin + (size + margin) * i + (size - 24) / 2}
            fill="#444"
          >
            {icons[tool.id]}
          </G>
        </G>
      ))}
      <G
        id="colorpicker"
        transform={`translate(${size + margin * 3} ${margin})`}
      >
        {ColorPickerElement}
      </G>
    </>
  );
};

export default memo(Toolbar);
