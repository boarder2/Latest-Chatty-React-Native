import React from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import WritePost from "./WritePost";
import GlobalStyles from "../styles/GlobalStyles";
import WinchattyAPI from "../api/WinchattyAPI";

export default class NewRootPostView extends React.Component {
	static navigationOptions = () => ({
		title: "New Thread",
		headerTintColor: GlobalStyles.navigationHeaderTintColor,
		headerStyle: GlobalStyles.navigationHeaderStyle,
		drawerLockMode: "locked-closed"
	});

	constructor(props) {
		super(props);
		this.state = {
			paddingViewHeight: 5000
		};
	}

	render() {
		return (<KeyboardAwareScrollView style={styles.container}
			enableOnAndroid={true}
			ref={(ref) => this.scrollView = ref}>
			<View style={{ height: this.state.paddingViewHeight }} />
			<WritePost
				onSubmit={
					async (text, onFinished) => {
						await WinchattyAPI.postComment(0, text);
						onFinished();
						this.props.navigation.goBack();
					}}
				onReplyContentSizeChanged={
					(event) => {
						if (this.scrollView !== undefined) {
							const eventTarget = event.target;
							//TODO: Get the header size.  Or come up with a better way to calculate the size of the padding needed.
							this.setState({ paddingViewHeight: Dimensions.get("window").height - 120 - event.nativeEvent.contentSize.height },
								() => {
									this.scrollView.scrollToFocusedInput(eventTarget);
								});
						}
					}
				} />
		</KeyboardAwareScrollView>);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#222"
	}
});