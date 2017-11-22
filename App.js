import { DrawerNavigator, StackNavigator } from "react-navigation";
import React from "react";

import BrowserView from "./src/BrowserView";
import ChattyRoot from "./src/chattyRoot/ChattyRoot";
import HelpView from "./src/HelpView";
import LoginScreen from "./src/settings/LoginScreen";
import NewRootPostView from "./src/postViews/NewRootPostView";
import SettingsScreen from "./src/settings/SettingsScreen";
import StyleConverters from "./src/styles/StyleConverters";
import ThreadList from "./src/threadView/ThreadList";

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

const App = DrawerNavigator(
	{
		Chatty: { screen: Chatty },
		Settings: { screen: Settings },
		Help: { screen: StackNavigator({ Help: { screen: HelpView } }) }
	},
	{
		initialRouteName: "Chatty",
		drawerBackgroundColor: "black",
		contentOptions: {
			inactiveTintColor: "lightgray",
			activeTintColor: StyleConverters.getAccentColor()
		}
	}
);

export default App;