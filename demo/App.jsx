"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const react_native_scrollview_1 = __importDefault(require("react-native-scrollview"));
class ExampleScreen extends react_1.default.Component {
    render() {
        return (<react_native_scrollview_1.default contentContainerStyle={styles.container}>
        {Array(100).map(() => (<react_native_1.View style={styles.item}/>))}
      </react_native_scrollview_1.default>);
    }
}
exports.default = ExampleScreen;
const styles = react_native_1.StyleSheet.create({
    container: {
        flexWrap: "wrap",
        flexDirection: "row"
    },
    item: {
        backgroundColor: "red",
        width: 100,
        height: 100,
        margin: 5
    }
});
