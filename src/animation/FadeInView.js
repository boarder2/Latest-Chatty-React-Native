import React from "react";
import { Animated } from "react-native";

export default class FadeInView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			opacity: new Animated.Value(0)
		};
	}

	componentDidMount() {
		Animated.timing(
			this.state.opacity,
			{
				toValue: 1,
				duration: 500,
				useNativeDriver: true
			}).start();
	}

	render() {
		let { opacity } = this.state;
		return (
			<Animated.View style={{ ...this.props.style, opacity: opacity }}>
				{this.props.children}
			</Animated.View>
		);
	}
}