import getStroke from "perfect-freehand";
import SvgPath from "svgpath";
import svgPathBbox from "svg-path-bbox";

export const getFreehandPath = (points: number[][]) => {
  const stroke = getStroke(points, {
    start: {
      taper: 6,
    },
    end: {
      taper: 1,
    },
  });
  const d = [];
  let [p0, p1] = stroke;
  d.push(`M ${p0[0]} ${p0[1]} Q`);
  for (let i = 1; i < stroke.length; i++) {
    const mpx = p0[0] + (p1[0] - p0[0]) / 2;
    const mpy = p0[1] + (p1[1] - p0[1]) / 2;
    d.push(`${p0[0]},${p0[1]} ${mpx},${mpy}`);
    p0 = p1;
    p1 = stroke[i + 1];
  }
  d.push("Z");
  return d.join(" ");
};

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
