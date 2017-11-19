import Expo from "expo";
import { Platform } from "react-native";

export default class GlobalStyles {
	static navigationHeaderStyle = {
		backgroundColor: "#111",
		marginTop: (Platform.OS === "android") ? Expo.Constants.statusBarHeight : 0
	};
	static navigationHeaderTintColor = "#FFF";
}