import { KeyboardAwareFlatList } from "react-native-keyboard-aware-scroll-view";
import { observer } from "mobx-react/native";
import { StyleSheet, View, TouchableOpacity, Modal, Button } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import React from "react";

import chattyStore from "../data/ChattyStore";
import GlobalStyles from "../styles/GlobalStyles";
import RenderedPost from "./RenderedPost";
import TagAPI from "../api/TagAPI";

@observer
export default class ThreadList extends React.Component {
	static navigationOptions = () => ({
		title: "Thread",
		headerTintColor: GlobalStyles.navigationHeaderTintColor,
		headerStyle: GlobalStyles.navigationHeaderStyle,
		drawerLockMode: "locked-closed"
	});

	constructor(props) {
		super(props);
		this.state = {
			store: chattyStore,
			showTagModal: false,
			tagPostId: 0
		};
	}

	render() {
		//TODO: Scrol to selected.
		return (
			<View style={styles.container}>
				<Modal animationType="fade"
					transparent={true}
					visible={this.state.showTagModal}
					onRequestClose={() => {
					}}>
					<TouchableOpacity activeOpacity={1}
						style={{
							flex: 1,
							backgroundColor: "rgba(0,0,0, .9)",
							justifyContent: "center",
							alignItems: "center"
						}}
						onPress={() => this.setState({ showTagModal: false })}>
						<View style={styles.tagButton}>
							<Button title="lol" onPress={async () => await this._tagPost("lol")} />
						</View>
						<View style={styles.tagButton}>
							<Button title="inf" onPress={async () => await this._tagPost("inf")} />
						</View>
						<View style={styles.tagButton}>
							<Button title="unf" onPress={async () => await this._tagPost("unf")} />
						</View>
						<View style={styles.tagButton}>
							<Button title="tag" onPress={async () => await this._tagPost("tag")} />
						</View>
					</TouchableOpacity>
				</Modal>
				<KeyboardAwareFlatList
					style={{ flex: 1 }}
					data={this.state.store.unfilteredChatty.get(this.props.navigation.state.params.threadId).posts}
					renderItem={(item) => this._renderPost(item.item)}
					keyExtractor={(item) => item.id}
					ref={(ref) => this.postList = ref}
				/>
				<View style={{ flex: 0, flexDirection: "row", justifyContent: "flex-end" }}>
					<Icon name="email-open"
						style={styles.barIcon}
						onPress={async () => { chattyStore.markThreadRead(this.props.navigation.state.params.threadId); }}
					/>
					<View style={{ width: 6 }} />
					<Icon name="skip-previous"
						style={styles.barIcon}
						onPress={async () => await this._selectPost(false)} />
					<Icon name="skip-next"
						style={styles.barIcon}
						onPress={async () => await this._selectPost(true)} />
				</View>
			</View>
		);
	}

	async _tagPost(tag) {
		// console.log("Tagging post " + this.state.tagPostId + " with " + tag);
		const increment = await TagAPI.tagPost(this.state.tagPostId, tag);
		chattyStore.updateTag(this.props.navigation.state.params.threadId, this.state.tagPostId, tag, increment);
		// console.log("Tagging returned " + increment);
		this.setState({ showTagModal: false, tagPostId: 0 });
	}

	_selectPost = async (next) => {
		await chattyStore.selectPostInDirection(this.props.navigation.state.params.threadId, next);
	}

	_selectPostId = async (id) => {
		await chattyStore.selectPost(this.props.navigation.state.params.threadId, id);
	};

	_tagButtonPressed = (postId) => {
		// console.log("tag button pressed for " + postId);
		this.setState({ showTagModal: true, tagPostId: postId });
	};

	_replyContentSizeChanged = (event) => {
		this.postList.scrollToFocusedInput(event.target);
	} 

	_renderPost(item) {
		return <RenderedPost item={item}
			selectPost={this._selectPostId}
			onTagButtonPressed={this._tagButtonPressed}
			onReplyContentSizeChanged={this._replyContentSizeChanged}
			navigation={this.props.navigation} />;
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#222"
	},
	barIcon: {
		color: "white",
		fontSize: 38,
		padding: 6,
		backgroundColor: "transparent"
	},
	tagButton: {
		margin: 6,
		width: 200
	}
});