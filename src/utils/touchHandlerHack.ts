// https://github.com/react-native-svg/react-native-svg/issues/1483
// onPress is not working on web, hacking...
export const hackTouchableNodePress = (onPress: any) => (ele: any) => {
  const node = ele && ele._touchableNode;
  if (node) {
    if ("ontouchstart" in node) {
      node.removeEventListener("touchstart", node._previousPressHandler);
      node.addEventListener("touchstart", onPress);
      node._previousPressHandler = onPress;
    } else {
      let clickStart = false;
      const onMouseDown = () => {
        clickStart = true;
      };
      const onMouseMove = () => {
        clickStart = false;
      };
      const onMouseUp = () => {
        if (clickStart) {
          setTimeout(() => {
            onPress(new Event("dummy"));
          }, 0);
        }
        clickStart = false;
      };
      node.removeEventListener("mousedown", node._previousMouseDownHandler);
      node.removeEventListener("mousemove", node._previousMouseMoveHandler);
      node.removeEventListener("mouseup", node._previousMouseUpHandler);
      node.addEventListener("mousedown", onMouseDown);
      node.addEventListener("mousemove", onMouseMove);
      node.addEventListener("mouseup", onMouseUp);
      node._previousMouseDownHandler = onMouseDown;
      node._previousMouseMoveHandler = onMouseMove;
      node._previousMouseUpHandler = onMouseUp;
    }
  }
};

export const hackTouchableNodeAll = (onEvent: any) => (ele: any) => {
  const node = ele && ele._touchableNode;
  if (node) {
    if ("ontouchstart" in node) {
      node.removeEventListener("touchstart", node._previousEventHandler);
      node.removeEventListener("touchmove", node._previousEventHandler);
      node.removeEventListener("touchend", node._previousEventHandler);
      node.addEventListener("touchstart", onEvent);
      node.addEventListener("touchmove", onEvent);
      node.addEventListener("touchend", onEvent);
      node._previousEventHandler = onEvent;
    } else {
      node.removeEventListener("mousedown", node._previousEventHandler);
      node.removeEventListener("mousemove", node._previousEventHandler);
      node.removeEventListener("mouseup", node._previousEventHandler);
      node.addEventListener("mousedown", onEvent);
      node.addEventListener("mousemove", onEvent);
      node.addEventListener("mouseup", onEvent);
      node._previousEventHandler = onEvent;
    }
  }
};
