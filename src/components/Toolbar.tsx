import { useSelector } from "@xstate/react";
import * as React from "react"; // for expo
import { FC, memo } from "react";
import { G, Rect } from "react-native-svg";
import ColorPicker from "../components/ColorPicker";
import BiggerIcon from "../icons/Bigger";
import DeleteIcon from "../icons/Delete";
import HandIcon from "../icons/Hand";
import ImageIcon from "../icons/Image";
import MoveIcon from "../icons/Move";
import PaletteIcon from "../icons/Palette";
import PenIcon from "../icons/Pen";
import SaveIcon from "../icons/Save";
import SmallerIcon from "../icons/Smaller";
import ZoomInIcon from "../icons/ZoomIn";
import ZoomOutIcon from "../icons/ZoomOut";
import { FileSystemModule } from "../modules/file-system/FileSystemModule";
import { hackTouchableNode } from "../utils/touchHandlerHack";

const getIcons = (stateValue: any) => [
  stateValue.selection === "selection"
    ? {
        id: "move",
        component: MoveIcon,
        eventType: "SELECT_MOVE",
        active: stateValue.mode.pan,
      }
    : {
        id: "pan",
        PannerNode,
        component: HandIcon,
        eventType: "SELECT_PAN",
        active: stateValue.mode.pan,
      },
  {
    id: "draw",
    component: PenIcon,
    eventType: "SELECT_DRAW",
    active: stateValue.mode.draw,
  },
  {
    id: "erase",
    component: DeleteIcon,
    eventType: "SELECT_ERASE",
    active: stateValue.mode.erase,
  },
  stateValue.selection === "noSelection"
    ? {
        id: "zoomIn",
        component: ZoomInIcon,
        eventType: "ZOOM_IN",
      }
    : {
        id: "bigger",
        component: BiggerIcon,
        eventType: "BIGGER",
      },
  stateValue.selection === "noSelection"
    ? {
        id: "zoomOut",
        component: ZoomOutIcon,
        eventType: "ZOOM_OUT",
      }
    : {
        id: "smaller",
        component: SmallerIcon,
        eventType: "SMALLER",
      },

  {
    id: "color",
    component: PaletteIcon,
    eventType: "SELECT_COLOR",
    active: stateValue.mode === "color",
  },
  { id: "save", component: SaveIcon, eventType: "SELECT_SAVE" },
  { id: "image", component: ImageIcon, eventType: "UPLOAD_IMAGE" },
];

type Props = {
  size?: number;
  margin?: number;
  radius?: number;
  fileSystemModule: FileSystemModule;
  service: any;
};

const selectStateValue = (state: any) => state.value;

export const Toolbar: FC<Props> = ({
  size = 36,
  margin = 8,
  radius = 6,
  fileSystemModule,
  service,
}) => {
  const stateValue = useSelector(service, selectStateValue);
  const icons = getIcons(stateValue);
  return (
    <>
      <Rect
        x={0}
        y={0}
        rx={radius}
        ry={radius}
        width={size + margin * 2}
        height={margin + (size + margin) * icons.length}
        fill="#ddd"
        opacity="0.8"
      />
      {icons.map((tool, i) => {
        const ToolComponent = tool.component;

        return (
          <G
            key={tool.id}
            onPress={() => {
              service.send(tool.eventType as any);
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
              <ToolComponent></ToolComponent>
            </G>
          </G>
        );
      })}
      {stateValue.mode === "color" && (
        <G
          id="colorpicker"
          transform={`translate(${size + margin * 3} ${margin})`}
        >
          {/* FTODO: this was passed as props, but it never changes? I'm not making it a prop so I can add props to it myself */}
          <ColorPicker
            setColor={(color: string) =>
              service.send({ type: "SET_COLOR", color })
            }
          />
        </G>
      )}
    </>
  );
};

export default memo(Toolbar);
