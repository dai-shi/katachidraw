import * as React from "react"; // for expo
import { FC, useState, useEffect } from "react";
import { Dimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Provider } from "jotai";

import Canvas from "./Canvas";

export const App: FC = () => {
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  }>(() => Dimensions.get("window"));
  useEffect(() => {
    const onChange = ({
      window,
    }: {
      window: { width: number; height: number };
    }) => {
      setDimensions(window);
    };
    Dimensions.addEventListener("change", onChange);
    return () => {
      Dimensions.removeEventListener("change", onChange);
    };
  }, []);

  return (
    <>
      <Provider>
        <Canvas width={dimensions.width} height={dimensions.height} />
      </Provider>
      {/* eslint-disable react/style-prop-object */}
      <StatusBar style="dark" />
    </>
  );
};

export default App;
