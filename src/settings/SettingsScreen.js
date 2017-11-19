import React from "react";
import { Button, View, StyleSheet, StatusBar, TouchableOpacity, Text } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import loginStore from "../data/LoginStore";
import GlobalStyles from "../styles/GlobalStyles";

export default class SettingsScreen extends React.Component {
	static navigationOptions = ({ navigation }) => ({
		title: "Settings",
		headerTintColor: GlobalStyles.navigationHeaderTintColor,
		headerStyle: GlobalStyles.navigationHeaderStyle,
		headerLeft: (
			<TouchableOpacity onPress={() => navigation.navigate("DrawerOpen")}>
				<Icon name="menu" size={30} style={{ color: "white", paddingLeft: 10 }} />
			</TouchableOpacity>
		)
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