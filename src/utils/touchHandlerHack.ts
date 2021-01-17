// https://github.com/react-native-svg/react-native-svg/issues/1483
// onPress is not working on web, hacking...
export const hackTouchableNode = (instance: any) => {
  const node = instance?._touchableNode;
  const props = instance?.props;
  if (node && props) {
    const emulateResponder = props.onStartShouldSetResponder?.();
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
      if (emulateResponder) {
        props.onResponderGrant?.(hackEvent(e));
        return;
      }
      props.onPressIn?.(hackEvent(e));
      pressStart = true;
    };
    const onMove = (e: any) => {
      if (emulateResponder) {
        props.onResponderMove?.(hackEvent(e));
        return;
      }
      pressStart = false;
    };
    const onUp = () => {
      if (emulateResponder) {
        props.onResponderEnd?.();
        return;
      }
      props.onPressOut?.();
      if (pressStart) {
        const { onPress } = props;
        if (onPress) {
          setTimeout(onPress, 0);
        }
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

const hackEvent = (e: any) => {
  const { clientX, clientY } = e.touches ? e.touches[0] : e;
  const nativeEvent = {
    locationX: clientX,
    locationY: clientY,
  };
  return {
    nativeEvent,
    preventDefault: () => e.preventDefault(),
    stopPropagation: () => e.stopPropagation(),
  };
};
