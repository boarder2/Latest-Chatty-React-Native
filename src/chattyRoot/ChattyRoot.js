import { observer } from "mobx-react/native";
import { StyleSheet, FlatList, View, TouchableOpacity, AppState, StatusBar, Text } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import React from "react";

import chattyStore from "../data/ChattyStore";
import FadeInView from "../animation/FadeInView";
import GlobalStyles from "../styles/GlobalStyles";
import RenderedRootPost from "./RenderedRootPost";
import StyleConverters from "../styles/StyleConverters";

@observer
export default class ChattyRoot extends React.Component {
	static navigationOptions = ({ navigation }) => ({
		title: "Chatty",
		headerTintColor: GlobalStyles.navigationHeaderTintColor,
		headerStyle: GlobalStyles.navigationHeaderStyle,
		headerLeft: GlobalStyles.getHamburgerButton(navigation),
		headerRight: (
			<TouchableOpacity onPress={() => navigation.navigate("NewThread")}>
				<Icon name="plus" size={30} style={{ color: "white", paddingRight: 10 }} />
			</TouchableOpacity>
		)
	});

	constructor(props) {
		super(props);
		this.state = {
			store: chattyStore
		};
	}

	componentWillMount() {
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
		const newPostIndicator = this.state.store.newThreadCount > 0 ? (
			<FadeInView style={{ backgroundColor: "#26F", alignItems: "center", padding: 6 }}
				onPress={() => chattyStore.refreshChatty()}>
				<Text style={{ color: "#FFF" }}>{this.state.store.newThreadCount} new threads available</Text>
			</FadeInView>
		) : undefined;
		return (
			<View style={styles.container}>
				<StatusBar barStyle="light-content" />
				{newPostIndicator}
				<FlatList
					data={this.state.store.filteredChatty.values()}
					refreshing={this.state.store.refreshing}
					onRefresh={() => chattyStore.refreshChatty()}
					renderItem={this._renderThread}
					keyExtractor={(item) => item.id}
					ref={(ref) => this.listRef = ref}
				/>
				<Icon name="arrow-up-bold-circle" size={50} style={styles.floatingButton} onPress={() => this._scrollToTop()} />
			</View>
		);
	}

	_handleAppStateChange = (nextState) => {
		switch (nextState) {
			case "active":
				chattyStore.startChatyRefresh();
				break;
			case "background":
			case "inactive":
				chattyStore.stopChattyRefresh();
				break;
		}
	};

	_scrollToTop() {
		this.listRef.scrollToIndex({ index: 0 });
	}

	_renderThread = ({ item }) => {
		return (<RenderedRootPost item={item}
			onPressed={() => this.props.navigation.navigate("Thread", { threadId: item.id })} />);
	};
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#222"
	},
	floatingButton: {
		bottom: 10,
		right: 10,
		width: 50,
		height: 50,
		position: "absolute",
		backgroundColor: "transparent",
		color: StyleConverters.getAccentColor()
	}
});