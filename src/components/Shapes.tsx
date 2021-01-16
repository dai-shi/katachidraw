import { FC, memo } from "react";
import { useAtom } from "jotai";

import { allShapesAtom } from "../atoms/shapes";
import Shape from "./Shape";

export const Shapes: FC = () => {
  const [shapeAtomList] = useAtom(allShapesAtom);
  return (
    <>
      {shapeAtomList.map((shapeAtom) => (
        <Shape key={`${shapeAtom}`} shapeAtom={shapeAtom} />
      ))}
    </>
  );
};

export default memo(Shapes);
