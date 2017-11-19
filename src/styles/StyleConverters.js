import { StyleSheet } from "react-native";

export default class StyleConverters {
	static tagStylesheet = StyleSheet.create({
		tagStyleInf: {
			backgroundColor: "rgb(71, 169, 215);"
		},
		tagStyleNone: {
			backgroundColor: "lightgray"
		},
		tagStylePolitical: {
			backgroundColor: "rgb(238, 147, 36);"
		},
		tagStyleStupid: {
			backgroundColor: "rgb(137, 190, 64);"
		},
		tagStyleNws: {
			backgroundColor: "red"
		}
	});

	static getThreadTagStyle(tag) {
		let tagStyle;
		switch (tag) {
			case "informative":
				tagStyle = StyleConverters.tagStylesheet.tagStyleInf;
				break;
			case "stupid":
				tagStyle = StyleConverters.tagStylesheet.tagStyleStupid;
				break;
			case "political":
				tagStyle = StyleConverters.tagStylesheet.tagStylePolitical;
				break;
			case "nws":
				tagStyle = StyleConverters.tagStylesheet.tagStyleNws;
				break;
			default:
				tagStyle = StyleConverters.tagStylesheet.tagStyleNone;
				break;
		}
		return tagStyle;
	}

	static getLolTagStyle(tag) {
		return { color: StyleConverters.getLolTagColor(tag) };
	}

	static getLolTagColor(tag) {
		switch (tag) {
			case "lol":
				return "#FF8800";
			case "inf":
				return "#0099CC";
			case "unf":
				return "#FF0000";
			case "tag":
				return "#77BB22";
			case "wtf":
				return "#C000C0";
			case "ugh":
				return "#00BB00";
			default:
				return "#8f8f8f";
		}
	}

	static getAccentColor() {
		return "#ff2d17";
	}

	static getAuthorTextStyle(authorName) {
		return { color: StyleConverters.getAuthorColor(authorName) };
	}

	static getAuthorColor(authorName) {
		switch (authorName.toLowerCase()) {
			case "boarder2":
				return "#ff5000";
			case "shacknews":
				return "rgb(147, 112, 219)";
			default:
				return "rgb(255, 186, 0)";
		}
	}
}