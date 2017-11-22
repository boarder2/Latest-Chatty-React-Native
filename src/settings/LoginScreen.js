import { Button, TextInput, View, StyleSheet, StatusBar, Text } from "react-native";
import React from "react";

import GlobalStyles from "../styles/GlobalStyles";
import loginStore from "../data/LoginStore";

export default class LoginScreen extends React.Component {
	static navigationOptions = () => ({
		title: "Login",
		headerTintColor: GlobalStyles.navigationHeaderTintColor,
		headerStyle: GlobalStyles.navigationHeaderStyle,
	});

	constructor(props) {
		super(props);
		this.state = {
			username: "",
			password: "",
			loginButtonDisabled: false
		};
	}

	async componentWillMount() {
		const user = await loginStore.getUser();
		const pass = await loginStore.getPassword();
		this.setState({
			username: (user === undefined || user === null) ? "" : user,
			password: (pass === undefined || pass === null) ? "" : pass
		});
	}

	render() {
		let errorText;
		if (this.state.errorText) {
			errorText = <Text style={styles.error}>{this.state.errorText}</Text>;
		}
		return (
			<View style={styles.container}>
				<StatusBar barStyle="light-content" />
				<TextInput placeholder="username"
					style={styles.input}
					value={this.state.username}
					onChangeText={(text) => this.setState({ username: text })}
					returnKeyType="next"
					onSubmitEditing={() => this.passwordField.focus()} />
				<TextInput placeholder="password"
					style={styles.input}
					value={this.state.password}
					onChangeText={(text) => this.setState({ password: text })}
					secureTextEntry={true}
					returnKeyType="go"
					ref={(input) => this.passwordField = input} />
				{errorText}
				<Button
					title="Login"
					onPress={() => {
						this.setState({ loginButtonDisabled: true, errorText: "" }, async () => this._tryLogin());
					}}
					disabled={this.state.loginButtonDisabled}
				/>
			</View>
		);
	}

	async _tryLogin() {
		try {
			const { params } = this.props.navigation.state;
			await loginStore.login(this.state.username, this.state.password);
			this.props.navigation.goBack();
			await params.onLogin();
		} catch (ex) {
			this.setState({ errorText: "Login failed:\n" + ex });
		}
		finally {
			this.setState({ loginButtonDisabled: false });
		}
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#222",
		padding: 12
	},
	input: {
		height: 30,
		backgroundColor: "#eee",
		marginBottom: 6
	},
	error: {
		color: "red",
		marginBottom: 6
	}
});