"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const react_native_gesture_handler_1 = require("react-native-gesture-handler");
const initLayout = { x: 0, y: 0, height: 0, width: 0 };
class ScrollView extends react_1.default.Component {
    constructor() {
        super(...arguments);
        this.location = new react_native_1.Animated.ValueXY();
        this.panEvent = react_native_1.Animated.event([
            {
                nativeEvent: {
                    //translationX: this.location.x,
                    translationY: this.location.y
                }
            }
        ]);
        this.containerLayout = initLayout;
        this.contentLayout = initLayout;
        this.onContainerLayout = (event) => {
            const newLayout = event.nativeEvent.layout;
            const oldLayout = this.containerLayout;
            if (newLayout.height !== oldLayout.height) {
                this.containerLayout = newLayout;
                this.forceUpdate();
            }
        };
        this.onContentLayout = (event) => {
            const newLayout = event.nativeEvent.layout;
            const oldLayout = this.contentLayout;
            if (newLayout.height !== oldLayout.height) {
                this.contentLayout = newLayout;
                this.forceUpdate();
            }
        };
        this.onHandlerStateChange = (event) => {
            if (event.nativeEvent.state === react_native_gesture_handler_1.State.END) {
                this.location.extractOffset();
            }
        };
        this.getTranslateTransform = () => {
            const translateX = react_native_1.Animated.diffClamp(this.location.x, -Math.min(0, this.contentLayout.width - this.containerLayout.width), 0);
            const max = Math.min(0, this.containerLayout.height - this.contentLayout.height);
            const translateY = react_native_1.Animated.diffClamp(this.location.y, max, 200);
            return [{ translateX }, { translateY }];
        };
    }
    componentDidMount() { }
    render() {
        const { children } = this.props;
        return (<react_native_gesture_handler_1.PanGestureHandler onGestureEvent={this.panEvent} onHandlerStateChange={this.onHandlerStateChange}>
        <react_native_1.View onLayout={this.onContainerLayout} style={styles.container}>
          <react_native_1.Animated.View onLayout={this.onContentLayout} style={{ transform: this.getTranslateTransform() }}>
            {children}
          </react_native_1.Animated.View>
        </react_native_1.View>
      </react_native_gesture_handler_1.PanGestureHandler>);
    }
}
exports.default = ScrollView;
const styles = react_native_1.StyleSheet.create({
    container: {
        overflow: "hidden",
        width: react_native_1.Dimensions.get("window").width,
        height: react_native_1.Dimensions.get("window").height
    }
});
