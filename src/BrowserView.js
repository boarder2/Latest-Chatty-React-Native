import { WebView, Linking, Button } from "react-native";
import React, { Component } from "react";

import GlobalStyles from "./styles/GlobalStyles";

export default class BrowserView extends Component {
	static navigationOptions = ({ navigation }) => ({
		title: "Web",
		headerTintColor: GlobalStyles.navigationHeaderTintColor,
		headerStyle: GlobalStyles.navigationHeaderStyle,
		headerRight: (
			<Button title="Browser" onPress={() => Linking.openURL(navigation.state.params.uri)} />
		),
		drawerLockMode: "locked-closed"
	});

	render() {
		const uri = this.props.navigation.state.params.uri;
		return (
			<WebView
				ref={(ref) => {
					this.webview = ref;
				}}
				source={{ uri: uri }}
				startInLoadingState={true}
			/>
		);
	}
}