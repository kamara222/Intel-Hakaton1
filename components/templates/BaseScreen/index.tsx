import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { ReactNode } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Appbar } from "react-native-paper";

interface props {
  title?: string;
  titleColor?: string;
  backAction?: boolean;
  statusBarStyle?: "light" | "dark";
  children: ReactNode;
}

export default function BaseScreen({
  title,
  titleColor,
  backAction,
  statusBarStyle,
  children,
}: props) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={statusBarStyle ? `${statusBarStyle}-content` : "dark-content"}
      />
      <Appbar.Header style={styles.header}>
        {backAction && <Appbar.BackAction onPress={() => router.back()} />}
        {title && (
          <Appbar.Content
            title={title}
            titleStyle={[styles.title, { color: titleColor || "black" }]}
          />
        )}
      </Appbar.Header>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    fontSize: 18,
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 17,
  },
});
