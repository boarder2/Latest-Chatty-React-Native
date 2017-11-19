import * as _ from "lodash";
import loginStore from "../data/LoginStore";

class SeenPosts {
	seenPostIds = [29374230];
	updateTimer = undefined;

	async refreshSeenPosts() {
		const username = await loginStore.getUser();
		if (_.isEmpty(username)) return;
		// console.log("getting seen posts for " + username);
		const response = await fetch("https://winchatty.com/v2/clientData/getClientData?username=" + username + "&client=latestchattyUWPSeenPosts");
		const responseJson = await response.json();
		const cloudSeenPosts = _.isEmpty(responseJson.data) ? [] : JSON.parse(responseJson.data);
		// console.log("Merging " + cloudSeenPosts.length + " with " + this.seenPostIds.length + " values");
		this.seenPostIds = _.sortBy(_.union(this.seenPostIds, cloudSeenPosts));
		await this._saveSeenPosts();
	}

	markPostRead(postId) {
		if(this.isPostRead(postId)) return;
		const insertLocation = _.sortedIndex(this.seenPostIds, postId);
		this.seenPostIds.splice(insertLocation, 0, postId);
		if(this.updateTimer) clearTimeout(this.updateTimer);
		this.updateTimer = setTimeout(() => this._saveSeenPosts(), 10000);
	}

	isPostRead(postId) {
		return _.sortedIndexOf(this.seenPostIds, postId) !== -1;
	}

	async _saveSeenPosts() {
		const username = await loginStore.getUser();
		if (_.isEmpty(username)) return;

		// console.log("Saving seen posts.");
		let data = new FormData();
		data.append("username", username);
		data.append("client", "latestchattyUWPSeenPosts");
		const dataString = JSON.stringify(this.seenPostIds.slice(-8000));
		data.append("data", dataString);
		await fetch("https://winchatty.com/v2/clientData/setClientData",
			{
				method: "POST",
				body: data
			});
	}
}

const seenPosts = new SeenPosts();
export default seenPosts;