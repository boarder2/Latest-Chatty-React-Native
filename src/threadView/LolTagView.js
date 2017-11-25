import { Alert, Text, View, TouchableOpacity } from "react-native";
import { observer } from "mobx-react/native";
import * as _ from "lodash";
import React from "react";

import StyleConverters from "./../styles/StyleConverters";
import TagAPI from "../api/TagAPI";

@observer
export default class LolTagView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			post: this.props.post
		};
	}

	render() {
		const texts = [];
		_.each(this.state.post.lols, (tag) => {
			const text = tag.count + " " + tag.tag + "s";
			texts.push(<TouchableOpacity key={text}
				style={{ padding: 6, alignItems: "center" }}
				onPress={async () => await this._pressedTag(this.state.post, tag.tag)}>
				<Text
					style={StyleConverters.getLolTagStyle(tag.tag)}>{text}</Text>
			</TouchableOpacity>);
		});

		return (<View style={{ ...this.props.style }}>
			{texts}
		</View>
		);
	}

	async _pressedTag(post, tag) {
		const taggers = await TagAPI.getTaggers(post.id, tag);
		Alert.alert(
			`Users who ${tag}d`,
			taggers.join("\n"),
			[
				{ text: "OK" },
			],
			{ cancelable: true }
		);
	}
}