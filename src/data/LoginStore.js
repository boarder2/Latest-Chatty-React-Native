import Expo from "expo";
import * as _ from "lodash";

class LoginStore {
	async getUser() {
		let username = await Expo.SecureStore.getItemAsync("username");
		if (!_.isEmpty(username)) { username = username.toLowerCase(); } else { username = ""; }
		return username;
	}

	async getPassword() {
		return await Expo.SecureStore.getItemAsync("password");
	}

	async logout() {
		await global.Expo.SecureStore.deleteItemAsync("username");
		await global.Expo.SecureStore.deleteItemAsync("password");
	}

	async login(username, password) {
		let data = new FormData();
		data.append("username", username);
		data.append("password", password);
		const response = await fetch("https://winchatty.com/v2/verifyCredentials",
			{
				method: "POST",
				body: data
			});
		const result = await response.json();
		if (result.isValid) {
			await Expo.SecureStore.setItemAsync("username", username);
			await Expo.SecureStore.setItemAsync("password", password);
		} else {
			throw JSON.stringify(result);
		}
	}
}

const loginStore = new LoginStore();
export default loginStore;