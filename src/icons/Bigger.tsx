import * as React from "react"; // for expo
import { Path } from "react-native-svg";

const Bigger: React.FC = () => (
  <>
    <Path d="M0 0h24v24H0z" fill="none" />
    <Path d="M21,11L21 3 13 3 16.29 6.29 6.29 16.29 3 13 3 21 11 21 7.71 17.71 17.71 7.71z" />
  </>
);

export default Bigger;
