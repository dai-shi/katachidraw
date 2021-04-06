import * as React from "react"; // for expo
import { FC, memo } from "react";
import Shape from "./Shape";

type Props = {
  shapes: any;
};

export const Shapes: FC<Props> = ({ shapes }) => {
  return (
    <>
      {Object.keys(shapes).map((id: any) => (
        <Shape key={id} service={shapes[id].ref} type={shapes[id].type} />
      ))}
    </>
  );
};

export default memo(Shapes);
