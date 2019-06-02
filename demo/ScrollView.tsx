import React from "react";
import {
  StyleSheet,
  LayoutChangeEvent,
  LayoutRectangle,
  Dimensions,
  ScrollViewProps as NativeScrollViewProps
} from "react-native";

import {
  PanGestureHandler,
  PanGestureHandlerStateChangeEvent,
  State,
  GestureHandlerGestureEventNativeEvent,
  PanGestureHandlerEventExtra
} from "react-native-gesture-handler";

import Animated from "react-native-reanimated";

const {
  event,
  set,
  cond,
  eq,
  add,
  block,
  Value,
  View,
  startClock,
  stopClock,
  Clock
} = Animated;

interface ScrollViewProps extends NativeScrollViewProps {}

type PanNativeEvent = GestureHandlerGestureEventNativeEvent &
  PanGestureHandlerEventExtra;

const initLayout = { x: 0, y: 0, height: 0, width: 0 };

export default class ScrollView extends React.Component<ScrollViewProps> {
  locationY = new Value(0);
  offsetY = new Value(0);
  velocityY = new Value(0);

  locationX = new Value(0);
  offsetX = new Value(0);
  velocityX = new Value(0);

  momentumClock = new Clock();

  panEvent = event([
    {
      nativeEvent: ({
        translationX: x,
        translationY: y,
        state
      }: PanNativeEvent) =>
        block([
          // update on pan
          stopClock(this.momentumClock),
          set(this.locationX, add(x, this.offsetX)),
          set(this.locationY, add(y, this.offsetY)),

          // extract offset on pan end
          cond(eq(state, State.END), [
            set(this.offsetX, add(this.offsetX, x)),
            set(this.offsetY, add(this.offsetY, y)),
            startClock(this.momentumClock)
          ])
        ])
    }
  ]);
  containerLayout: LayoutRectangle = initLayout;
  contentLayout: LayoutRectangle = initLayout;

  componentDidMount() {}

  onContainerLayout = (event: LayoutChangeEvent) => {
    const newLayout = event.nativeEvent.layout;
    const oldLayout = this.containerLayout;

    if (newLayout.height !== oldLayout.height) {
      this.containerLayout = newLayout;
      this.forceUpdate();
    }
  };

  onContentLayout = (event: LayoutChangeEvent) => {
    const newLayout = event.nativeEvent.layout;
    const oldLayout = this.contentLayout;

    if (newLayout.height !== oldLayout.height) {
      this.contentLayout = newLayout;
      this.forceUpdate();
    }
  };

  getTranslateTransform = () => {
    /*const translateX = Animated.diffClamp(
      this.location.x,
      -Math.min(0, this.contentLayout.width - this.containerLayout.width),
      0
    );*/

    const max = Math.min(
      0,
      this.containerLayout.height - this.contentLayout.height
    );
    const translateY = Animated.diffClamp(this.locationY, max, 200);

    return [{ translateY }];
  };

  render() {
    const { children, contentContainerStyle } = this.props;

    return (
      <PanGestureHandler
        onGestureEvent={this.panEvent}
        onHandlerStateChange={this.panEvent}
      >
        <View onLayout={this.onContainerLayout} style={styles.container}>
          <View
            onLayout={this.onContentLayout}
            style={[
              contentContainerStyle,
              { transform: this.getTranslateTransform() }
            ]}
          >
            {children}
          </View>
        </View>
      </PanGestureHandler>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    backgroundColor: "#ccc"
  }
});
