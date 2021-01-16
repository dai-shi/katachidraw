// https://github.com/react-native-svg/react-native-svg/issues/1483
// onPress is not working on web, hacking...
export const hackTouchableNodePress = (onPress: any) => (ele: any) => {
  const node = ele && ele._touchableNode;
  if (node) {
    const { down, move, up } = getEventNames(node);
    let pressStart = false;
    const onDown = () => {
      pressStart = true;
    };
    const onMove = () => {
      pressStart = false;
    };
    const onUp = () => {
      if (pressStart) {
        setTimeout(() => {
          onPress(new Event("dummy"));
        }, 0);
      }
      pressStart = false;
    };
    node.removeEventListener(down, node._previousDownHandler);
    node.removeEventListener(move, node._previousMoveHandler);
    node.removeEventListener(up, node._previousUpHandler);
    node.addEventListener(down, onDown);
    node.addEventListener(move, onMove);
    node.addEventListener(up, onUp);
    node._previousDownHandler = onDown;
    node._previousMoveHandler = onMove;
    node._previousUpHandler = onUp;
  }
};

export const hackTouchableNodeAll = (onEvent: any) => (ele: any) => {
  const node = ele && ele._touchableNode;
  if (node) {
    const { down, move, up } = getEventNames(node);
    node.removeEventListener(down, node._previousEventHandler);
    node.removeEventListener(move, node._previousEventHandler);
    node.removeEventListener(up, node._previousEventHandler);
    node.addEventListener(down, onEvent);
    node.addEventListener(move, onEvent);
    node.addEventListener(up, onEvent);
    node._previousEventHandler = onEvent;
  }
};

const getEventNames = (node: any) => {
  let down = "mousedown";
  let move = "mousemove";
  let up = "mouseup";
  if ("ontouchstart" in node) {
    down = "touchstart";
    move = "touchmove";
    up = "touchend";
  }
  return { down, move, up };
};
