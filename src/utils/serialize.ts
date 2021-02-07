import { ReactElement, Children, createElement } from "react";
import { Platform } from "react-native";
import ReactDOMServer from "react-dom/server";

const isWeb = Platform.OS === "web";

const childToWeb = (child: any) => {
  const { type, props } = child;
  const name = type && type.displayName;
  const webName = name && name[0].toLowerCase() + name.slice(1);
  const Tag = webName ? webName : type;
  return createElement(Tag, props, toWeb(props.children));
};

const toWeb = (children: any): any => Children.map(children, childToWeb);

export const serialize = (element: ReactElement) => {
  const webJsx = isWeb ? element : toWeb(element);
  const svgString = ReactDOMServer.renderToStaticMarkup(webJsx);
  return svgString;
};
