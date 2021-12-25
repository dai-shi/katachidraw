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
    const onWheel = (e: any) => {
      e.preventDefault();
      const { deltaX, deltaY } = e;
      if (e.metaKey || e.ctrlKey) {
        if (emulateResponder && props.onResponderMove) {
          scaleEvents(deltaY).forEach(props.onResponderMove);
        }
      } else {
        if (emulateResponder && props.onResponderMove) {
          scrollEvents(deltaX, deltaY).forEach(props.onResponderMove);
        }
      }
    };
    node.removeEventListener(down, node._previousOnDown);
    node.removeEventListener(move, node._previousOnMove);
    node.removeEventListener(up, node._previousOnUp);
    node.removeEventListener("wheel", node._previousOnWheel);
    node.addEventListener(down, onDown);
    node.addEventListener(move, onMove);
    node.addEventListener(up, onUp);
    node.addEventListener("wheel", onWheel);
    node._previousOnDown = onDown;
    node._previousOnMove = onMove;
    node._previousOnUp = onUp;
    node._previousOnWheel = onWheel;
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

const scaleEvents = (scale: number) => {
  const BASE = 70;
  const locationX = window.innerWidth / 2;
  const locationY = window.innerHeight / 2;
  const touchesArray = [
    [
      {
        locationX,
        locationY: locationY - BASE,
      },
      {
        locationX,
        locationY: locationY + BASE,
      },
    ],
    [
      {
        locationX,
        locationY: locationY - BASE + scale,
      },
      {
        locationX,
        locationY: locationY + BASE - scale,
      },
    ],
    [],
  ];
  return touchesArray.map((touches) => ({
    nativeEvent: {
      touches,
    },
    preventDefault: () => {},
    stopPropagation: () => {},
  }));
};

const scrollEvents = (x: number, y: number) => {
  const BASE = 50;
  const locationX = window.innerWidth / 2;
  const locationY = window.innerHeight / 2;
  const touchesArray = [
    [
      {
        locationX: locationX - BASE,
        locationY: locationY - BASE,
      },
      {
        locationX: locationX + BASE,
        locationY: locationY + BASE,
      },
    ],
    [
      {
        locationX: locationX - BASE - x,
        locationY: locationY - BASE - y,
      },
      {
        locationX: locationX + BASE - x,
        locationY: locationY + BASE - y,
      },
    ],
    [],
  ];
  return touchesArray.map((touches) => ({
    nativeEvent: {
      touches,
    },
    preventDefault: () => {},
    stopPropagation: () => {},
  }));
};
