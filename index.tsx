import React from "react";
import {
  View,
  Animated,
  StyleSheet,
  LayoutChangeEvent,
  LayoutRectangle,
  Dimensions,
  ScrollViewProps as NativeScrollViewProps
} from "react-native";
import {
  PanGestureHandler,
  PanGestureHandlerStateChangeEvent,
  State
} from "react-native-gesture-handler";

interface ScrollViewProps extends NativeScrollViewProps {}

const initLayout = { x: 0, y: 0, height: 0, width: 0 };

export default class ScrollView extends React.Component<ScrollViewProps> {
  location = new Animated.ValueXY();
  panEvent = Animated.event([
    {
      nativeEvent: {
        //translationX: this.location.x,
        translationY: this.location.y
      }
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

  onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.END) {
      this.location.extractOffset();
    }
  };

  getTranslateTransform = () => {
    const translateX = Animated.diffClamp(
      this.location.x,
      -Math.min(0, this.contentLayout.width - this.containerLayout.width),
      0
    );

    const max = Math.min(
      0,
      this.containerLayout.height - this.contentLayout.height
    );
    const translateY = Animated.diffClamp(this.location.y, max, 200);

    return [{ translateX }, { translateY }];
  };

  render() {
    const { children } = this.props;

    return (
      <PanGestureHandler
        onGestureEvent={this.panEvent}
        onHandlerStateChange={this.onHandlerStateChange}
      >
        <View onLayout={this.onContainerLayout} style={styles.container}>
          <Animated.View
            onLayout={this.onContentLayout}
            style={{ transform: this.getTranslateTransform() }}
          >
            {children}
          </Animated.View>
        </View>
      </PanGestureHandler>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height
  }
});
