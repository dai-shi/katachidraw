import SvgPath from "svgpath";
import { svgPathBbox } from "svg-path-bbox";

export const adjustSvgPath = (
  path: string
): {
  x: number;
  y: number;
  path: string;
} => {
  const [x, y] = svgPathBbox(path);
  return {
    x,
    y,
    path: new SvgPath(path).translate(-x, -y).toString(),
  };
};
