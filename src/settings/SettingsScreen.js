import { Button, View, StyleSheet, StatusBar, Text } from "react-native";
import React from "react";

import GlobalStyles from "../styles/GlobalStyles";
import loginStore from "../data/LoginStore";

export default class SettingsScreen extends React.Component {
	static navigationOptions = ({ navigation }) => ({
		title: "Settings",
		headerTintColor: GlobalStyles.navigationHeaderTintColor,
		headerStyle: GlobalStyles.navigationHeaderStyle,
		headerLeft: GlobalStyles.getHamburgerButton(navigation)
	});

	constructor(props) {
		super(props);
		this.state = {
			username: ""
		};
	}

	async componentWillMount() {
		await this._updateUserFromStore();
	}

	async _updateUserFromStore() {
		this.setState({
			username: await loginStore.getUser()
		});
	}

	render() {
		return (
			<View style={styles.container}>
				<StatusBar barStyle="light-content" />
				{this._getLogin()}
			</View>
		);
	}

	async _logout() {
		await loginStore.logout();
		this.setState({
			username: ""
		});
	}

	_getLogin() {
		let labelText, buttonText, buttonPress;
		if (this.state.username) {
			labelText = "Logged in as " + this.state.username;
			buttonText = "Logout";
			buttonPress = async () => await this._logout();
		} else {
			labelText = "Not logged in.";
			buttonText = "Login";
			buttonPress = () => this.props.navigation.navigate("Login", { onLogin: async () => await this._updateUserFromStore() });
		}
		return (
			<View style={{ flex: 0, flexDirection: "row", alignItems: "center" }}>
				<Text style={[styles.text, { flex: 0, marginRight: 6 }]}>{labelText}</Text>
				<Button style={{ flex: 1 }} title={buttonText} onPress={buttonPress} />
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#222",
		padding: 12
	},
	text: {
		color: "white"
	}
});