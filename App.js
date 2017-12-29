import { DrawerNavigator, StackNavigator } from "react-navigation";
import { Font } from "expo";
import React from "react";
import { AppState } from "react-native";

import BrowserView from "./src/BrowserView";
import ChattyRoot from "./src/chattyRoot/ChattyRoot";
import chattyStore from "./src/data/ChattyStore";
import HelpView from "./src/HelpView";
import LoginScreen from "./src/settings/LoginScreen";
import NewRootPostView from "./src/postViews/NewRootPostView";
import SettingsScreen from "./src/settings/SettingsScreen";
import StyleConverters from "./src/styles/StyleConverters";
import ThreadList from "./src/threadView/ThreadList";
import debugStore from "./src/data/DebugStore";
import DebugView from "./src/DebugView";

const Chatty = StackNavigator(
	{
		Home: { screen: ChattyRoot },
		Thread: { screen: ThreadList },
		BrowserView: { screen: BrowserView },
		NewThread: { screen: NewRootPostView }
	}, {
		navigationOptions: {
			gesturesEnabled: true
		}
	});

const Settings = StackNavigator({
	Settings: { screen: SettingsScreen },
	Login: { screen: LoginScreen }
});

const AppNavigator = DrawerNavigator(
	{
		Chatty: { screen: Chatty },
		Settings: { screen: Settings },
		Help: {
			screen: StackNavigator(
				{
					Help: { screen: HelpView },
					DebugView: { screen: DebugView }
				})
		}
	},
	{
		// They broke defaults.
		// https://github.com/react-navigation/react-navigation/issues/3149#issuecomment-352862563
		drawerOpenRoute: "DrawerOpen",
		drawerCloseRoute: "DrawerClose",
		drawerToggleRoute: "DrawerToggle",
		initialRouteName: "Chatty",
		drawerBackgroundColor: "black",
		contentOptions: {
			inactiveTintColor: "lightgray",
			activeTintColor: StyleConverters.getAccentColor()
		}
	}
);

export default class App extends React.Component {
	componentWillMount() {
		Font.loadAsync({
			"source-code-pro-light": require("./assets/fonts/SourceCodePro-Light.ttf")
		});
		chattyStore.startChatyRefresh();
	}

	componentDidMount() {
		AppState.addEventListener("change", this._handleAppStateChange);
	}

	componentWillUnmount() {
		chattyStore.stopChattyRefresh();
		AppState.removeEventListener("change", this._handleAppStateChange);
	}

	render() {
		return <AppNavigator />;
	}

	_handleAppStateChange = (nextState) => {
		switch (nextState) {
			case "active":
				debugStore.addLog("App activated");
				chattyStore.startChatyRefresh();
				break;
			case "background":
			case "inactive":
				debugStore.addLog("App backgrounded or inactive");
				chattyStore.stopChattyRefresh();
				break;
		}
	};
}