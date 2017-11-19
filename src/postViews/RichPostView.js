import React from "react";
import * as PropTypes from "prop-types";
import RichPostRenderer from "./RichPostRenderer";
import { Text } from "react-native";
import { observer } from "mobx-react/native";

@observer
export default class RichPostView extends React.Component {
	render() {
		return (
			<Text>
				{RichPostRenderer.getPostText(this.props.text, this.props.onHyperlinkClicked)}
			</Text>
		);
	}
}

RichPostView.propTypes = {
	text: PropTypes.string.isRequired,
	onHyperlinkClicked: PropTypes.func
};