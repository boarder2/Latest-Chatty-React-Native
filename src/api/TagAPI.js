import * as _ from "lodash";

import loginStore from "../data/LoginStore";
import debugStore from "../data/DebugStore";

export default class TagAPI {
	static tagHostUrl = "http://www.lmnopc.com/greasemonkey/shacklol";

	static async tagPost(postId, tag) {
		const user = await loginStore.getUser();
		if (_.isEmpty(user)) {
			return 0;
		}

		const data = new FormData();
		data.append("who", user);
		data.append("what", postId);
		data.append("tag", tag);
		data.append("version", "-1");

		try {
			const response = await fetch(TagAPI.tagHostUrl + "/report.php",
				{
					method: "POST",
					body: data
				});
			const responseText = await response.text();
			if (responseText.indexOf("ok") > -1) {
				return 1;
			} else if (responseText.indexOf("already tagged") > -1) {
				data.append("action", "untag");
				const response = await fetch(TagAPI.tagHostUrl + "/report.php",
					{
						method: "POST",
						body: data
					});
				const responseText = await response.text();
				if (responseText.indexOf("ok") > -1) {
					return -1;
				}
			}
		} catch (e) {
			debugStore.addError("Error tagging " + e);
		}

		return 0;
	}

	static async getTaggers(postId, tag) {
		try {
			const response = await fetch(`${TagAPI.tagHostUrl}/api.php?special=get_taggers&thread_id=${postId}&tag=${tag}`);
			const json = await response.json();
			const sortedTaggers = _.sortBy(json[tag], a => a.toLowerCase());
			return sortedTaggers;
		} catch (e) {
			return ["Error retrieving users."];
		}
	}
}