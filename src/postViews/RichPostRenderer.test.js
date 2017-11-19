import RichPostRenderer from "./RichPostRenderer";
import { Text } from "react-native";
import React from "react";

//TODO: Get these in the right format.
describe("RichPostRenderer Tests", () => {
	xit("Underlined text", () => {
		const result = RichPostRenderer.getPostText("<u>UnderlinedText</u>");
		expect(result).toEqual((
			<Text style={{ color: "lightgray" }}>{[<Text key={3}
				style={{ textDecorationLine: "underline" }}>UnderlinedText</Text>]}</Text>
		));
	});

	xit("Underlined text with post", () => {
		const result = RichPostRenderer.getPostText("<u>UnderlinedText</u>Some more stuff");
		expect(result).toEqual((
			<Text style={{ color: "lightgray" }}>{
				[
					<Text key={3}
						style={{ textDecorationLine: "underline" }}>UnderlinedText</Text>,
					"Some more stuff"]}</Text>
		));
	});

	xit("Underlined text with pre and post", () => {
		const result = RichPostRenderer.getPostText("Doop<u>UnderlinedText</u>Some more stuff");
		expect(result).toEqual(
			(
				<Text style={{ color: "lightgray" }}>{
					[
						<Text key={0}>Doop</Text>,
						<Text key={7} style={{ textDecorationLine: "underline" }}>UnderlinedText</Text>,
						<Text key={25}>Some more stuff</Text>]}</Text>
			));
	});

	xit("Pink and red", () => {
		const result = RichPostRenderer.getPostText("This is unformatted.<span class=\"jt_red\">This is red.</span><span class=\"jt_pink\">This is pink.</span>");
		expect(result).toEqual((
			<Text style={{ color: "lightgray" }}>{[
				<Text key={0}>This is unformatted.</Text>,
				<Text key={41} style={{ color: "red" }}>This is red.</Text>,
				<Text key={82} style={{ color: "pink" }}>This is pink.</Text>
			]}</Text>
		));
	});

	xit("Pink and underlined", () => {
		const result = RichPostRenderer.getPostText("<span class=\"jt_pink\"><u>This is red and underlined.</u></span>");
		expect(result).toEqual((
			<Text style={{ color: "lightgray" }}>{[
				<Text key={0} style={{ color: "pink" }}>
					<Text key={21} style={{ textDecorationLine: "underline" }}>This is red.</Text>
				</Text>
			]}</Text>
		));
	});

	xit("No formatting", () => {
		const result = RichPostRenderer.getPostText("NoFormattingText");
		expect(result).toEqual((
			<Text style={{ color: "lightgray" }}>{[<Text key={0} style={undefined}>NoFormattingText</Text>]}</Text>
		));
	});
});