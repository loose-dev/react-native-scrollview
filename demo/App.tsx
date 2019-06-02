import React from "react";
import { View, StyleSheet, Text } from "react-native";
import ScrollView from "./ScrollView";

interface ExampleScreenProps {}

export default class ExampleScreen extends React.Component<ExampleScreenProps> {
  render() {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        {[...Array(100)].map((n, index) => (
          <View key={index} style={styles.item}>
            <Text>{index}</Text>
          </View>
        ))}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexWrap: "wrap",
    flexDirection: "row",
    justifyContent: "center"
  },

  item: {
    backgroundColor: "red",
    width: 100,
    height: 100,
    margin: 5,
    justifyContent: "center",
    alignItems: "center"
  }
});
