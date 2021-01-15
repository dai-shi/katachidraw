import { atom } from "jotai";
import { curveToBezier } from "points-on-curve/lib/curve-to-bezier.js";
import { pointsOnBezierCurves } from "points-on-curve";

import { offsetAtom, zoomAtom } from "./canvas";
import { shapeAtomListAtom, createShapeAtom } from "./shapes";

export const dotsAtom = atom<[number, number][]>([]);

export const addDotAtom = atom(
  null,
  (get, set, [x, y]: readonly [number, number]) => {
    const offset = get(offsetAtom);
    const zoom = get(zoomAtom);
    const dots = get(dotsAtom);
    set(dotsAtom, [...dots, [x / zoom + offset.x, y / zoom + offset.y]]);
  }
);

export const commitDotsAtom = atom(null, (get, set) => {
  const dots = get(dotsAtom);
  if (dots.length > 2) {
    let bcurve = curveToBezier(dots);
    const reducedPoints = pointsOnBezierCurves(bcurve, 0.5, 3);
    if (reducedPoints.length > 2) {
      bcurve = curveToBezier(reducedPoints);
    }
    let path = `M${bcurve[0][0]} ${bcurve[0][1]}`;
    let i = 1;
    while (i + 2 < bcurve.length) {
      path += ` C${bcurve[i][0]} ${bcurve[i][1]},`;
      path += `${bcurve[i + 1][0]} ${bcurve[i + 1][1]},`;
      path += `${bcurve[i + 2][0]} ${bcurve[i + 2][1]}`;
      i += 3;
    }
    set(shapeAtomListAtom, [...get(shapeAtomListAtom), createShapeAtom(path)]);
  }
  set(dotsAtom, []);
});
