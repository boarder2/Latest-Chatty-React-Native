import * as _ from "lodash";

import loginStore from "../data/LoginStore";
import debugStore from "../data/DebugStore";

export default class WinchattyAPI {
	static tenYearUsers = [];

	static async getChatty() {
		let response = await fetch("https://winchatty.com/v2/getChatty");
		return await response.json();
	}

	static async postComment(parentId, message) {
		try {
			let data = new FormData();
			const username = await loginStore.getUser();
			if (_.isEmpty(username)) {
				console.error("Not logged in, can't post a comment.");
				return;
			}

			const password = await loginStore.getPassword();

			data.append("username", username);
			data.append("password", password);
			data.append("parentId", parentId);
			data.append("text", message);
			const response = await fetch("https://winchatty.com/v2/postComment",
				{
					method: "POST",
					body: data
				});
			const result = await response.json();
			if (result.result !== "success" && result.error) {
				//TODO: Handle error
				console.error("Error posting comment " + result.code + " : " + result.message);
			}
		} catch (error) {
			console.error(error);
		}
	}

	static async _getNewestEventId() {
		const response = await fetch("https://winchatty.com/v2/getNewestEventId");
		const rJson = await response.json();
		debugStore.addLog("Latest event Id is ", JSON.stringify(rJson));
		return rJson.eventId;
	}

	static async _waitForNextEvent(currentEventId) {
		debugStore.addLog("Waiting for event last id is " + currentEventId);
		const response = await fetch("https://winchatty.com/v2/waitForEvent?lastEventId=" + currentEventId);
		const json = await response.json();
		return json;
	}

	static async _getTenYearUsers() {
		if (WinchattyAPI.tenYearUsers.length === 0) {
			try {
				debugStore.addLog("Getting users.");
				const response = await fetch("https://winchatty.com/v2/getAllTenYearUsers");
				const usersJson = await response.json();
				WinchattyAPI.tenYearUsers = _.sortBy(usersJson.users, [(x) => {
					return x.toLowerCase();
				}]);
				debugStore.addLog("Got " + WinchattyAPI.tenYearUsers.length + " users");
			} catch (ignored) {
				WinchattyAPI.tenYearUsers = [];
			}
		}
	}

	static isTenYearUser(name) {
		if (WinchattyAPI.tenYearUsers.length > 0) {
			return _.sortedIndexOf(WinchattyAPI.tenYearUsers, name.toLowerCase()) > -1;
		}
		//return _.includes(WinchattyAPI.tenYearUsers, name);
		return false;
	}
}