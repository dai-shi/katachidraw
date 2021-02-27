import * as React from "react"; // for expo
import { Path } from "react-native-svg";

const Smaller: React.FC = () => (
  <>
    <Path d="M0 0h24v24H0z" fill="none" />
    <Path d="M22,3.41l-5.29,5.29L20,12h-8V4l3.29,3.29L20.59,2L22,3.41z M3.41,22l5.29-5.29L12,20v-8H4l3.29,3.29L2,20.59L3.41,22z" />
  </>
);

export default Smaller;
