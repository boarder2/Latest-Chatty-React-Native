import { action, observable } from "mobx";
import moment from "moment";

export class DebugStore {
	@observable logEntries = observable([]);

	@action addLog(entry) {
		const newEntry = {id: this.logEntries.length, time: new Date(), message: entry};
		console.log(moment(newEntry.time).format("hh:mm:ss.SSSS") + " : " + newEntry.message);
		this.logEntries.unshift(newEntry);
	}

	@action clearLog() {
		this.logEntries.clear();
	}
}

const debugStore = new DebugStore();
export default debugStore;