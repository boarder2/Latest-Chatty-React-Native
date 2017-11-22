import { View, Text, StyleSheet, ScrollView } from "react-native";
import React from "react";

import GlobalStyles from "./styles/GlobalStyles";
import StyleConverters from "./styles/StyleConverters";

export default class HelpView extends React.Component {
	static navigationOptions = ({ navigation }) => ({
		title: "Help",
		headerTintColor: GlobalStyles.navigationHeaderTintColor,
		headerStyle: GlobalStyles.navigationHeaderStyle,
		headerLeft: GlobalStyles.getHamburgerButton(navigation)
	});

	render() {
		return (<ScrollView style={{
			flex: 1, backgroundColor: "#222"
		}}>
			<View style={{
				padding: 6
			}}>
				<Text style={styles.header}>About</Text>
				<Text style={styles.blended}>
					Created by boarder2 {"\n"}
					Special thanks to electroly for the API
				</Text>
				<Text style={styles.header}>Change History</Text>
				<Text style={styles.subHeader}>11/21/2017</Text>
				<Text style={styles.text}>
					• Added thread depth indicators{"\n"}
				</Text>
				<Text style={styles.subHeader}>11/20/2017</Text>
				<Text style={styles.text}>
					• Added help section{"\n"}
					• Better support for application getting backgrounded{"\n"}
				</Text>
				<Text style={[styles.blended, { fontSize: 8 }]}>
					This application is not supported by, endorsed by, or affiliated with shacknews.com
				</Text>
			</View>
		</ScrollView >);
	}
}

const styles = StyleSheet.create({
	header: {
		fontSize: 30,
		fontWeight: "bold",
		paddingTop: 12,
		color: StyleConverters.getAccentColor()
	},
	subHeader: {
		fontSize: 20,
		fontWeight: "bold",
		paddingTop: 6,
		color: "#FFF"
	},
	text: {
		color: "#FFF"
	},
	blended: {
		color: "gray"
	}
});