import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
} from "react-native";
import { useTranslation } from "react-i18next";
import BaseScreen from "@/components/templates/BaseScreen";
import { Divider } from "react-native-paper";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function IndexScreen() {
  const { t } = useTranslation("home");
  return (
    <BaseScreen title={t("title")}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.row}
          onPress={() => router.push("/challenge1")}
        >
          <Text style={{ color: "black" }}>{t("challenge1.title")}</Text>
          <Ionicons name="chevron-forward" size={20} color="black" />
        </TouchableOpacity>
        <Divider />
      </View>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 25,
  },
  row: {
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
  },
});
