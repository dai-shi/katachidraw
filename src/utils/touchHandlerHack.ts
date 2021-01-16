// https://github.com/react-native-svg/react-native-svg/issues/1483
// onPress is not working on web, hacking...
export const hackTouchableNode = ({
  onPressIn,
  onPressOut,
  onPress,
  onDrag,
}: any) => (ele: any) => {
  const node = ele && ele._touchableNode;
  if (node) {
    let down = "mousedown";
    let move = "mousemove";
    let up = "mouseup";
    if ("ontouchstart" in node) {
      down = "touchstart";
      move = "touchmove";
      up = "touchend";
    }
    let pressStart = false;
    const onDown = (e: any) => {
      if (onPressIn) {
        onPressIn(e);
      }
      pressStart = true;
    };
    const onMove = (e: any) => {
      if (onDrag) {
        onDrag(e);
      }
      pressStart = false;
    };
    const onUp = (e: any) => {
      if (onPressOut) {
        onPressOut(e);
      }
      if (pressStart && onPress) {
        setTimeout(onPress, 0);
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
