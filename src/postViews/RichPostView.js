import { observer } from "mobx-react/native";
import { Text } from "react-native";
import * as PropTypes from "prop-types";
import React from "react";

import RichPostRenderer from "./RichPostRenderer";

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