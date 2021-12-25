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
    const onDown = (e: any) => {
      const event = hackEvent(e);
      if (emulateResponder) {
        props.onResponderGrant?.(event);
      }
      props.onPressIn?.(event);
      node._moveCount = 0;
    };
    const onMove = (e: any) => {
      const event = hackEvent(e);
      if (emulateResponder) {
        props.onResponderMove?.(event);
      }
      node._moveCount += 1;
    };
    const onUp = (e: any) => {
      const event = hackEvent(e);
      if (emulateResponder) {
        props.onResponderEnd?.(event);
      }
      props.onPressOut?.(event);
      if (node._moveCount <= 1) {
        // assume press with small move
        props.onPress?.(event);
      }
      node._moveCount = 0;
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
  const touches = e.touches
    ? Array.from(e.touches)
    : e.buttons === 1
    ? [e]
    : [];
  const nativeEvent = {
    touches: touches.map((touch: any) => ({
      locationX: touch.clientX,
      locationY: touch.clientY,
    })),
  };
  return {
    nativeEvent,
    preventDefault: () => e.preventDefault(),
    stopPropagation: () => e.stopPropagation(),
  };
};
