# 🚧 react-native-scrollview

## **Under construction!** Do NOT use in production.

Implementation of ScrollView using **react-native-gesture-handler** and **react-native-reanimated**. Works with **Expo**.

## Motivation

The original ScrollView component does not offer much control or customizability and the behavior is platform specific (while this can be a good thing, sometimes it's limiting). Features that we

## Features

- momentum scrolling (customizable mass, stiffness and damping)
- overscrolling (customizable resistance and return velocity)
- pull-to-refresh (customizable indicator and animation)
- scroll bars (customizable color, shape, animation)
- API compatible with the original ScrollView
- only depends on packages supported by Expo (no need to eject)

## Performance

Isn't it slow? Surprisingly enough it performs quite well. Thanks to react-native-gesture-handler and react-native-reanimated all the scrolling can run in the UI thread. Rasterization can be used to improve performance even more (we didn't find it necessary)
