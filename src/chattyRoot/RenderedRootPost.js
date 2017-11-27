import { observer } from "mobx-react/native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import moment from "moment";
import PropTypes from "prop-types";
import React from "react";
import * as _ from "lodash";

import StyleConverters from "../styles/StyleConverters";
import WinchattyAPI from "../api/WinchattyAPI";
import chattyStore from "../data/ChattyStore";

@observer
export default class RenderedRootPost extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			store: chattyStore
		};
	}

	render() {
		const item = this.state.store.unfilteredChatty.get(this.props.threadId);
		let tagStyle = StyleConverters.getThreadTagStyle(item.author.toLowerCase() === "shacknews" ? "informative" : item.category);
		let participatedIcon;
		let unreadRepliesIcon;
		if (!item.participated) {
			participatedIcon = <Icon name="account-outline" size={16} color="#333" />;
		} else {
			participatedIcon = <Icon name="account" size={16} color={StyleConverters.getAccentColor()} />;
		}
		if (!item.unreadReplies) {
			unreadRepliesIcon = <Icon name="comment-outline" size={16} color="#333" />;
		} else {
			unreadRepliesIcon = <Icon name="comment" size={16} color={StyleConverters.getAccentColor()} />;
		}
		let tenYearIcon;
		if (WinchattyAPI.isTenYearUser(item.author)) {
			tenYearIcon = <Icon name="flash" style={{ marginLeft: 2, marginTop: 2 }} size={12} color="rgb(255, 186, 0);" />;
		}
		const tagIndicators = [];
		_.each(item.lols, (tag) => {
			const size = Math.min(15, Math.max(5, tag.count * 2));
			tagIndicators.push(<View key={tag.tag} style={{ height: size, width: size, marginRight:2, backgroundColor: StyleConverters.getLolTagColor(tag.tag) }} />);
		});
		return (
			<TouchableOpacity
				style={{
					padding: 6,
					alignItems: "stretch"
				}}
				onPress={() => this.props.onPressed()}>
				<View style={{
					flex: 1,
					flexDirection: "row",
					justifyContent: "space-between"
				}}>
					<View style={{ flex: 1, flexDirection: "row" }}>
						<Text style={StyleConverters.getAuthorTextStyle(item.authorType)}>{item.author}</Text>
						{tenYearIcon}
					</View>
					<View style={{ flex: 1, flexDirection: "row", justifyContent: "flex-end" }}>
						{item.wasNewThread ? <Icon name="star" fontSize="14" color={StyleConverters.getAccentColor()} /> : undefined}
						<Text style={styles.dateText}>{moment(item.date).fromNow()}</Text>
					</View>
				</View>
				<View style={{
					flex: 1,
					flexDirection: "row"
				}}>
					<View style={[{
						flex: 0,
						height: 75,
						width: 40,
						alignItems: "center",
						justifyContent: "center"
					}, tagStyle]}>
						<Text style={styles.replyCountText} numberOfLines={1}>{item.postCount}</Text>
					</View>
					<View style={{
						flex: 1,
						paddingLeft: 6,
						alignItems: "stretch"
					}}>
						<Text style={{ flex: 1, color: item.hasUnreadPosts ? "lightgray" : "gray" }} numberOfLines={3}>
							{item.preview}
							{/* <RichPostView text={item.preview}/> */}
						</Text>
						<View style={{ flex: 0, flexDirection: "row", alignItems:"flex-end" }}>
							{tagIndicators}
						</View>
					</View>
					<View style={{ flex: 0, flexDirection: "column", justifyContent: "space-between" }}>
						{participatedIcon}
						{unreadRepliesIcon}
						<Icon name="pin-off" size={16} color="#333" />
					</View>
				</View>
			</TouchableOpacity>
		);
	}
}

RenderedRootPost.propTypes = {
	threadId: PropTypes.number.isRequired,
	onPressed: PropTypes.func
};

const styles = StyleSheet.create({
	dateText: {
		color: "lightgray"
	},
	textInput: {
		height: 60,
		width: 100,
		backgroundColor: "white"
	},
	replyCountText: {
		fontWeight: "bold"
	}
});