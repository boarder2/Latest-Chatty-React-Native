import * as _ from "lodash";

import loginStore from "../data/LoginStore";

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
			console.error("Error tagging " + e);
		}

		return 0;
	}
}