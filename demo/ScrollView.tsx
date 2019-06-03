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
  TapGestureHandler,
  State,
  GestureHandlerGestureEventNativeEvent,
  PanGestureHandlerEventExtra
} from "react-native-gesture-handler";

import Animated, { Easing } from "react-native-reanimated";

const {
  event,
  set,
  cond,
  eq,
  add,
  block,
  decay,
  divide,
  spring,
  debug,
  timing,
  Value,
  View,
  startClock,
  stopClock,
  clockRunning,
  Clock,
  multiply,
  greaterThan,
  exp,
  abs,
  and,
  not,
  greaterOrEq
} = Animated;

interface ScrollViewProps extends NativeScrollViewProps {}

type PanNativeEvent = GestureHandlerGestureEventNativeEvent &
  PanGestureHandlerEventExtra;

const initLayout = { x: 0, y: 0, height: 0, width: 0 };

const MAX_OVERSCROLL_VERTICAL = Dimensions.get("window").height;

export default class ScrollView extends React.Component<ScrollViewProps> {
  locationY = new Value(0);
  offsetY = new Value(0);
  velocityY = new Value(0);

  locationX = new Value(0);
  offsetX = new Value(0);
  velocityX = new Value(0);

  momentumClock = new Clock();

  startMomentumScroll = (
    value: Animated.Node<number>,
    velocity: number,
    dest: Animated.Node<number>
  ) => {
    const state = {
      finished: new Value(0),
      velocity: new Value(0),
      position: new Value(0),
      time: new Value(0)
    };

    const config = {
      toValue: new Value(0),
      mass: 1,
      damping: 10,
      stiffness: 20,
      overshootClamping: true,
      restSpeedThreshold: 1,
      restDisplacementThreshold: 1
    };

    return [
      debug("clockRunning", state.velocity),
      cond(clockRunning(this.momentumClock), 0, [
        set(state.finished, 0),
        set(state.position, value),
        set(config.toValue, dest),
        set(state.time, 0),
        set(state.velocity, velocity),
        startClock(this.momentumClock)
      ]),
      spring(this.momentumClock, state, config),
      cond(state.finished, stopClock(this.momentumClock)),
      state.position,
      debug("position", state.position)
    ];
  };

  panEvent = event([
    {
      nativeEvent: ({
        translationX,
        translationY,
        state,
        velocityY,
        velocityX
      }: PanNativeEvent) =>
        block([
          set(this.velocityY, velocityY),

          debug("active", eq(state, State.ACTIVE)),

          // stop clock if user starts input again
          cond(eq(state, State.ACTIVE), [
            stopClock(this.momentumClock),

            debug("loc", this.locationY),
            debug("transY", greaterOrEq(translationY, 0)),

            cond(
              and(greaterOrEq(this.locationY, 0), greaterOrEq(translationY, 0)),
              // make it exponentioally harder to scroll if overscrolling
              [
                set(
                  this.locationY,
                  add(
                    multiply(
                      -MAX_OVERSCROLL_VERTICAL,
                      exp(divide(translationY, -MAX_OVERSCROLL_VERTICAL))
                    ),
                    this.offsetY,
                    MAX_OVERSCROLL_VERTICAL
                  )
                )
              ]
            ),

            cond(
              not(
                and(
                  greaterOrEq(this.locationY, 0),
                  greaterOrEq(translationY, 0)
                )
              ),
              [
                set(this.locationX, add(translationX, this.offsetX)),
                set(
                  this.locationY,
                  add(multiply(translationY, 2), this.offsetY)
                )
              ]
            )
          ]),

          cond(eq(state, State.BEGAN), [
            debug("BEGAN", eq(state, State.BEGAN))
          ]),

          cond(eq(state, State.CANCELLED), [
            debug("CANCELLED", eq(state, State.CANCELLED))
          ]),

          // extract offset on pan end
          cond(eq(state, State.END), [
            cond(
              greaterThan(this.locationY, 0),
              [
                // spring back on release when overscrolled
                set(
                  this.locationY,
                  this.startMomentumScroll(this.locationY, -600, 0)
                )
              ],
              [
                cond(greaterThan(abs(this.velocityY), 100), [
                  // continue in scrolling direction after release (momentum)
                  set(
                    this.locationY,
                    this.startMomentumScroll(
                      this.locationY,
                      velocityY,
                      add(this.locationY, multiply(velocityY, 1))
                    )
                  )
                ])
              ]
            ),
            debug("END", eq(state, State.END)),
            //debug("velocityY", this.velocityY),
            set(this.offsetX, this.locationX),
            set(this.offsetY, this.locationY)
          ])
        ])
    }
  ]);
  containerLayout: LayoutRectangle = initLayout;
  contentLayout: LayoutRectangle = initLayout;

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
    const translateY = Animated.diffClamp(this.locationY, max - 200, 200);

    return [{ translateY }];
  };

  render() {
    const { children, contentContainerStyle, style } = this.props;

    return (
      <TapGestureHandler onHandlerStateChange={this.panEvent}>
        <View style={[styles.container]} onLayout={this.onContainerLayout}>
          <PanGestureHandler
            onGestureEvent={this.panEvent}
            onHandlerStateChange={this.panEvent}
          >
            <View style={{ width: "100%", height: "100%" }}>
              <View
                onLayout={this.onContentLayout}
                style={[
                  contentContainerStyle,
                  { transform: [{ translateY: this.locationY }] }
                ]}
              >
                {children}
              </View>
            </View>
          </PanGestureHandler>
        </View>
      </TapGestureHandler>
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
