import React from "react";
import Expo from "expo";
import { Platform, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default class GlobalStyles {
	static navigationHeaderStyle = {
		backgroundColor: "#111",
		marginTop: (Platform.OS === "android") ? Expo.Constants.statusBarHeight : 0
	};
	
	static navigationHeaderTintColor = "#FFF";

	static getHamburgerButton(navigation) {
		return (
			<TouchableOpacity onPress={() => navigation.navigate("DrawerOpen")}>
				<Icon name="menu" size={30} style={{ color: "white", paddingLeft: 10 }} />
			</TouchableOpacity>
		);
	}
}