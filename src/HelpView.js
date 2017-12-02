import { View, Text, StyleSheet, ScrollView, Button, StatusBar } from "react-native";
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
				<StatusBar barStyle="light-content" />
				<Text style={styles.header}>About</Text>
				<Text style={styles.blended}>
					Created by boarder2 {"\n"}
					Special thanks to electroly for the API
				</Text>
				<Text style={styles.header}>Change History</Text>
				<Text style={styles.subHeader}>12/2/2017</Text>
				<Text style={styles.text}>
					• Optimized handling of new posts a bit
				</Text>
				<Text style={styles.subHeader}>11/26/2017</Text>
				<Text style={styles.text}>
					• Better support for resuming from being backgrounded
				</Text>
				<Text style={styles.subHeader}>11/25/2017</Text>
				<Text style={styles.text}>
					• Retrieve the names of users who tagged a post by tapping the tag count{"\n"}
					• Added tag indicators to root posts{"\n"}
					• Condensed root posts without new lines{"\n"}
					• Added custom font for depth indicators for a more consistent experience{"\n"}
				</Text>
				<Text style={styles.subHeader}>11/23/2017</Text>
				<Text style={styles.text}>
					• Sort new posts to the top on refresh{"\n"}
				</Text>
				<Text style={styles.subHeader}>11/22/2017</Text>
				<Text style={styles.text}>
					• Enhanced author coloring{"\n"}
				</Text>
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
				<Button style={{ padding: 6 }} title="Show Debug Log" onPress={() => this.props.navigation.navigate("DebugView")} />
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