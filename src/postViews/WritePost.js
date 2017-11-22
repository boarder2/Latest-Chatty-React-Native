import { View, TextInput, ActivityIndicator, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import React from "react";

import StyleConverters from "../styles/StyleConverters";

export default class WritePost extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			replyText: "",
			submitDisabled: false
		};
	}

	render() {
		let buttonArea;
		if (this.state.submitDisabled) {
			buttonArea = <ActivityIndicator size="large" />;
		} else {
			buttonArea = (<View style={styles.sendIconView}>
				<Icon name="send"
					style={styles.sendIcon}
					onPress={() => this.setState({ submitDisabled: true }, () => {
						this.props.onSubmit(this.state.replyText, () => {
							this.setState({ submitDisabled: false });
						});
					})} />
			</View>);
		}
		return (
			<View style={{ flex: 1, flexDirection: "row", padding: 6 }}>
				<TextInput multiline ={true}
					autoFocus={true}
					autoGrow={true}
					placeholder="Type a post"
					underlineColorAndroid="transparent"
					returnKeyType="none"
					onChangeText={(text) => this.setState({ replyText: text })}
					onContentSizeChange={(event) => {
						if (this.props.onReplyContentSizeChanged) {
							this.props.onReplyContentSizeChanged(event);
						}
					}}
					style={{ minHeight: 50, backgroundColor: "lightgray", flex: 1, fontSize: 14 }} />
				<View style={{ flex: 0, justifyContent: "flex-end", marginLeft: 6 }}>
					{buttonArea}
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	sendIconView: {
		padding: 6,
		borderRadius: 6,
		backgroundColor: StyleConverters.getAccentColor()
	},
	sendIcon: {
		color: "white",
		fontSize: 30
	}
});