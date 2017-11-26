import React from "react";
import { View, Text, FlatList } from "react-native";
import { observer } from "mobx-react";
import moment from "moment";
import debugStore from "./data/DebugStore";
import GlobalStyles from "./styles/GlobalStyles";

@observer
export default class DebugView extends React.Component {
	static navigationOptions = () => ({
		title: "Debug Log",
		headerTintColor: GlobalStyles.navigationHeaderTintColor,
		headerStyle: GlobalStyles.navigationHeaderStyle
	});

	constructor(props) {
		super(props);
		this.state = {
			logStore: debugStore
		};
	}

	render() {
		return (
			<View style={{ flex: 1, backgroundColor: "#222" }}>
				<FlatList data={this.state.logStore.logEntries}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => <Text style={{ color: "#FFF" }} key={item.time}>{moment(item.time).format("hh:mm:ss.SSSS") + " : " + item.message}</Text>} />
			</View>
		);
	}
}