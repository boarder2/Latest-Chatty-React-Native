import { Text } from "react-native";
import React from "react";
import * as _ from "lodash";

export default class RichPostRenderer {
	static getPostText(text, hyperlinkClicked) {
		return <Text style={{ color: "lightgray" }}>{RichPostRenderer._getTexts({
			text: text,
			position: 0
		}, hyperlinkClicked)}</Text>;
	}

	static _getTexts(textObj, hyperlinkClicked) {
		let currentText = "";
		let texts = [];
		while (textObj.position < textObj.text.length) {
			const isBoundary = textObj.text[textObj.position] === "<";
			if (!isBoundary) {
				currentText += textObj.text[textObj.position];
				textObj.position++;
			} else {
				if (!_.isEmpty(currentText)) {
					texts.push(currentText);
					currentText = "";
				}
				const endBoundaryLength = RichPostRenderer._getEndBoundaryLength(textObj.text, textObj.position);
				if (endBoundaryLength === 0) {
					const boundary = RichPostRenderer._getStyleForBoundary(textObj.text, textObj.position);
					if (boundary === undefined) {
						// console.log(JSON.stringify(textObj));
						// console.log(textObj.text.substr(textObj.position));
					}
					textObj.position += boundary.length;
					let onPress;
					if (boundary.specialType === "spoiler") {
						onPress = () => {
							alert("Pressed a spoiler.");
						};
					} else if (boundary.specialType === "hyperlink") {
						const hyperlink = RichPostRenderer._consumeHyperlink(textObj);
						onPress = () => {
							hyperlinkClicked(hyperlink);
						};
					}
					texts.push(<Text key={textObj.position}
						onPress={onPress}
						style={boundary.style}>{RichPostRenderer._getTexts(textObj)}</Text>);
				} else {
					textObj.position += endBoundaryLength;
					return texts;
				}
			}
		}
		if (!_.isEmpty(currentText)) {
			texts.push(currentText);
		}
		return texts;
	}

	static _endBoundaries = [
		"</u>",
		"</i>",
		"</b>",
		"</span>",
		"</pre>",
		"</a>"];

	static _consumeHyperlink(textObj) {
		const curLocation = textObj.position;
		const endIndex = textObj.text.indexOf("</a>", curLocation);
		if (endIndex > 0) {
			const length = endIndex - curLocation;
			textObj.location += length;
			return textObj.text.substr(curLocation, length);
		}
		return "";
	}

	static _getEndBoundaryLength(text, location) {
		for (const boundary in RichPostRenderer._endBoundaries) {
			if (text.indexOf(RichPostRenderer._endBoundaries[boundary], location) === location) {
				return RichPostRenderer._endBoundaries[boundary].length;
			}
		}
		return 0;
	}

	static _getStyleForBoundary(text, location) {
		if (text.indexOf("<u>", location) === location) {
			return { length: 3, style: { textDecorationLine: "underline" } };
		}
		if (text.indexOf("<i>", location) === location) {
			return { length: 3, style: { fontStyle: "italic" } };
		}
		if (text.indexOf("<b>", location) === location) {
			return { length: 3, style: { fontWeight: "bold" } };
		}
		if (text.indexOf("<a target=\"_blank\"", location) === location) {
			//todo: hyperlink
			return {
				length: (text.indexOf(">", location) - location) + 1,
				style: { textDecorationLine: "underline", color: "gray" },
				specialType: "hyperlink"
			};
		}
		if (text.indexOf("<pre class=\"jt_code\">", location) === location) {
			return { length: 21, fontFamily: "monospace" };
		}
		if (text.indexOf("<span class=\"jt_", location) === location) {
			const endOfStatic = location + 16;
			const endOfTag = (text.indexOf(">", endOfStatic) - location) + 1;
			let style;
			const styleText = text.substr(endOfStatic, text.indexOf("\"", endOfStatic) - endOfStatic);
			let specialType = "none";
			switch (styleText) {
				case "red":
					style = { color: "red" };
					break;
				case "green":
					style = { color: "green" };
					break;
				case "blue":
					style = { color: "blue" };
					break;
				case "yellow":
					style = { color: "yellow" };
					break;
				case "olive":
					style = { color: "olive" };
					break;
				case "lime":
					style = { color: "lime" };
					break;
				case "orange":
					style = { color: "orange" };
					break;
				case "pink":
					style = { color: "pink" };
					break;
				case "sample":
					//TODO: Make text smaller
					break;
				case "quote":
					//TODO: Make text bigger
					break;
				case "spoiler":
					//TODO: spoilers
					specialType = "spoiler";
					style = { color: "transparent", backgroundColor: "green" };
					break;
				case "strike":
					style = { textDecorationLine: "line-through" };
					break;
			}

			return { length: endOfTag, style: style, specialType: specialType };
		}
	}
}