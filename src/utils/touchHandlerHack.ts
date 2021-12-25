// https://github.com/react-native-svg/react-native-svg/issues/1483
// onPress is not working on web, hacking...
export const hackTouchableNode = (instance: any) => {
  const node = instance?._touchableNode;
  const props = instance?.props;
  if (node && props) {
    const emulateResponder = props.onStartShouldSetResponder?.();
    const onDown = (e: any) => {
      if (emulateResponder) {
        props.onResponderGrant?.(hackEvent(e));
      }
      props.onPressIn?.(hackEvent(e));
      node._moveCount = 0;
    };
    const onMove = (e: any) => {
      if (emulateResponder) {
        props.onResponderMove?.(hackEvent(e));
      }
      node._moveCount += 1;
    };
    const onUp = (e: any) => {
      if (emulateResponder) {
        props.onResponderEnd?.(hackEvent(e));
      }
      props.onPressOut?.();
      if (node._moveCount <= 1) {
        // assume press with small move
        props.onPress?.();
      }
      node._moveCount = 0;
    };
    node.removeEventListener("pointerdown", node._previousDownHandler);
    node.removeEventListener("pointermove", node._previousMoveHandler);
    node.removeEventListener("pointerup", node._previousUpHandler);
    node.addEventListener("pointerdown", onDown);
    node.addEventListener("pointermove", onMove);
    node.addEventListener("pointerup", onUp);
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
