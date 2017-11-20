import { action, observable } from "mobx";
import seenPosts from "./SeenPosts";
import * as _ from "lodash";
import loginStore from "../data/LoginStore";
import WinchattyAPI from "../api/WinchattyAPI";

export class ChattyStore {
	@observable unfilteredChatty = observable.map();
	@observable filteredChatty = observable.map();
	@observable sortOrder = "hasReplies";
	@observable refreshing = false;
	@observable newThreadCount = 0;

	_lastEventId = 0;
	_refreshTimer;

	startChatyRefresh() {
		if (this.refreshing) return;
		this.refreshing = true;
		this._clearTimer();
		this.refreshTimer = setTimeout(() => {
			this._getWholeChatty();
		}, 1);
	}

	stopChattyRefresh() {
		this._clearTimer();
	}

	@action addRootPost(post) {
		// console.log("Adding post id " + post.id + " to data store.");
		this.unfilteredChatty.set(post.id.toString(), post);
	}

	@action addRootPosts(posts) {
		// console.log("Adding " + posts.length + " posts to root store.");
		_.each(posts, p => {
			this.unfilteredChatty.set(p.id.toString(), p);
		});
	}

	@action async updatePostsForThread(threadId, posts) {
		var username = await loginStore.getUser();
		if (!_.isEmpty(username)) { username = username.toLowerCase(); }
		const thread = this.unfilteredChatty.get(threadId.toString());
		const selectedId = _.find(thread.posts, (post) => post.isSelected).id;
		thread.postCount = posts.length;
		thread.hasUnreadPosts = _.some(posts, p => !seenPosts.isPostRead(p.id));
		thread.participated = !_.isEmpty(username) && _.some(posts, p => p.author.toLowerCase() === username);
		thread.unreadReplies = !_.isEmpty(username) && this._threadContainsUnreadReplies(username, posts);
		_.each(posts, (post) => {
			post.isSelected = post.id === selectedId;
		});
		thread.posts = posts;
	}

	@action clearRootPosts() {
		this.unfilteredChatty.clear();
	}

	@action async selectPost(threadId, postId) {
		const thread = this.unfilteredChatty.get(threadId.toString());
		_.each(thread.posts, (post) => {
			post.isSelected = post.id === postId;
			if (post.isSelected) {
				seenPosts.markPostRead(post.id);
				post.isRead = true;
			}
		});
		thread.hasUnreadPosts = _.some(thread.posts, p => !seenPosts.isPostRead(p.id));

		var username = await loginStore.getUser();
		if (!_.isEmpty(username)) {
			username = username.toLowerCase();
		} else {
			return;
		}
		thread.unreadReplies = this._threadContainsUnreadReplies(username, thread.posts);
	}

	@action async selectPostInDirection(threadId, forward) {
		const posts = this.unfilteredChatty.get(threadId.toString()).posts;
		const selectedPostIndex = _.findIndex(posts, (p) => p.isSelected);
		let newSelectedPostIndex = forward ? selectedPostIndex + 1 : selectedPostIndex - 1;
		if (newSelectedPostIndex < 0) {
			newSelectedPostIndex = posts.length - 1;
		} else if (newSelectedPostIndex >= posts.length) {
			newSelectedPostIndex = 0;
		}
		const newSelectedPost = posts[newSelectedPostIndex];
		await this.selectPost(threadId, newSelectedPost.id);
	}

	@action markThreadRead(threadId) {
		const thread = this.unfilteredChatty.get(threadId.toString());
		_.each(thread.posts, p => {
			seenPosts.markPostRead(p.id);
			p.isRead = true;
		});
		thread.hasUnreadPosts = false;
		thread.unreadReplies = false;
	}

	@action updateTag(threadId, postId, tag, increment) {
		const thread = this.unfilteredChatty.get(threadId.toString());
		const post = _.find(thread.posts, p => p.id === postId);

		if (_.isUndefined(post)) { return; }

		let foundTag = _.find(post.lols, t => t.tag === tag);
		if (_.isUndefined(foundTag) && increment > 0) {
			foundTag = {
				tag: tag,
				count: 1
			};
			post.lols.push(foundTag);
		} else {
			foundTag.count += increment;
		}
	}

	@action updateTagCount(postId, tag, count) {
		const post = _.find(this.unfilteredChatty.values(), (thread) => {
			return _.find(thread.posts, (post) => {
				return post.id === postId;
			});
		});

		if (_.isUndefined(post)) { return; }

		let foundTag = _.find(post.lols, t => t.tag === tag);
		if (_.isUndefined(foundTag)) {
			foundTag = {
				tag: tag,
				count: count
			};
			post.lols.push(foundTag);
		} else {
			foundTag.count = count;
		}
	}

	@action refreshChatty() {
		this.filteredChatty.clear();
		this.newThreadCount = 0;
		const sortedChatty = this._getSortedChatty();
		_.each(sortedChatty, (p) => this.filteredChatty.set(p.id.toString(), p));
	}

	@action setSortOrder(value) {
		this.sortOrder = value;
	}

	@action async _getWholeChatty() {
		try {
			//performance.now doesn't exist in RN so I guess this is the best I can do for now.  
			// No luck looking for something different in after 2 minutes and it's not worth spending more time.
			// let start = new Date();
			this.refreshing = true;
			this.clearRootPosts();
			await WinchattyAPI._getTenYearUsers();
			await seenPosts.refreshSeenPosts();
			this._lastEventId = await WinchattyAPI._getNewestEventId();
			// let end = new Date();
			// console.log("Getting cloud data took " + (end.getTime() - start.getTime()).toString() + " ms");
			// start = new Date();
			const chattyJson = await WinchattyAPI.getChatty();
			// end = new Date();
			// console.log("Getting chatty took " + (end.getTime() - start.getTime()).toString() + " ms");
			// start = new Date();
			const rootPosts = [];
			const username = await loginStore.getUser();
			for (const thread of chattyJson.threads) {
				const newThread = await this._createRootThread(thread.posts, username);
				rootPosts.push(newThread);
			}
			// end = new Date();
			// console.log("Parsing chatty took " + (end.getTime() - start.getTime()).toString() + " ms");

			this.addRootPosts(rootPosts);
			this.refreshChatty();
			this.refreshing = false;

			this.refreshTimer = setTimeout(async () => {
				await this._waitForNextEvent();
			}, 10000);
		} catch (error) {
			console.error(error);
		}
	}

	@action async _waitForNextEvent() {
		try {
			// console.log("getting next event");
			const json = await WinchattyAPI._waitForNextEvent(this._lastEventId);
			this._lastEventId = json.lastEventId;
			_.each(json.events, async (event) => {
				switch (event.eventType) {
					case "newPost":
						await this._processNewPost(event.eventData.post);
						break;
					case "lolCountsUpdate":
						this._processTagCountUpdate(event.eventData.updates);
						break;
					default:
						// console.log("unhandled event type: " + JSON.stringify(json));
						break;
				}
			});
		} finally {
			this._clearTimer();
			this._refreshTimer = setTimeout(async () => {
				await this._waitForNextEvent();
			}, 10000);
		}
	}

	_getSortedChatty() {
		// console.log("Sorting by " + this.sortOrder);
		switch (this.sortOrder) {
			case "hasReplies":
				return this.unfilteredChatty.values().sort((a, b) => {
					if (a.unreadReplies === b.unreadReplies) {
						const aMaxPostId = _.max(a.posts.map(p => p.id));
						const bMaxPostId = _.max(b.posts.map(p => p.id));
						return this._sortSingle(aMaxPostId, bMaxPostId);
					}
					return a.unreadReplies ? -1 : 1;
				});
			case "replyCount":
				return _.orderBy(this.unfilteredChatty.values(), ["postCount"], ["desc"]);
		}
	}

	_threadContainsUnreadReplies(username, threadPosts) {
		return _.some(threadPosts, p => {
			return !p.isRead && _.some(threadPosts, p1 => {
				return (p1.id === p.parentId) && (p1.author.toLowerCase() === username);
			});
		});
	}

	_clearTimer() {
		if (_.isUndefined(this._refreshTimer)) {
			clearTimeout(this._refreshTimer);
			this._refreshTimer = undefined;
		}
	}

	_processTagCountUpdate(updates) {
		_.each(updates, (update) => {
			this.updateTagCount(update.postId, update.tag, update.count);
		});
	}

	async _processNewPost(post) {
		const username = await loginStore.getUser();
		if (post.parentId === 0) {
			const newThread = this._createRootThread([post], username);
			this.addRootPost(newThread);
			this.newThreadCount++;
		} else {
			const thread = this.unfilteredChatty.get(post.threadId.toString());
			if (_.isUndefined(thread)) {
				// console.log("Can't find thread for the post");
				return;
			}
			const newPosts = _.union(thread.posts, [post]);
			const sortedPosts = this._parseThread(newPosts, username, false);
			await this.updatePostsForThread(post.threadId, sortedPosts);
		}
	}

	_createRootThread(threadPosts, username) {
		if (!_.isEmpty(username)) { username = username.toLowerCase(); }
		const parsedThreadPosts = this._parseThread(threadPosts, username, true);
		seenPosts.markPostRead(parsedThreadPosts[0].id); //Root post will never be unread.
		parsedThreadPosts[0].isRead = true;
		let rootPost = Object.assign({}, parsedThreadPosts[0]);
		rootPost.postCount = parsedThreadPosts.length;
		rootPost.hasUnreadPosts = _.some(parsedThreadPosts, p => !seenPosts.isPostRead(p.id));
		rootPost.participated = !_.isEmpty(username) && _.some(parsedThreadPosts, p => p.author.toLowerCase() === username);
		rootPost.unreadReplies = !_.isEmpty(username) && this._threadContainsUnreadReplies(username, parsedThreadPosts);
		this._generatePreview(rootPost);
		rootPost.posts = parsedThreadPosts;
		return rootPost;
	}
	//Prettu much copied this from LC UWP. There is a lot of looping in here that I"m sure could be optimized.
	_parseThread(threadPosts, username, setRootSelected) {
		threadPosts = _.orderBy(threadPosts, ["id"], ["asc"]);
		const rootPost = _.find(threadPosts, (p) => {
			return p.parentId === 0;
		});
		rootPost.depth = 0;
		this._recursiveSetDepth(rootPost, threadPosts, 1);
		const sortedPosts = [];
		this._recursiveAddComments(rootPost, sortedPosts, threadPosts);
		return _.chain(sortedPosts)
			.reverse()
			.each((p) => {
				this._generatePreview(p);
				if (setRootSelected) {
					p.isSelected = p.parentId === 0;
				}
				if (!_.isEmpty(username) && p.author.toLowerCase() === username.toLowerCase()) {
					seenPosts.markPostRead(p.id);
				}
				p.isRead = seenPosts.isPostRead(p.id);
				p.body = p.body.replace(/<br \/>/g, "\n");
			})
			.value();
	}

	_generatePreview(post) {
		post.preview = post.body.replace(/<(?:.|\n)*?>/gm, "").substr(0, 300);
	}

	_recursiveAddComments(post, sortedPosts, threadPosts) {
		const childPosts = _.filter(threadPosts, (p) => {
			return p.parentId === post.id;
		});
		this._addReply(post, sortedPosts, threadPosts);
		_.each(childPosts, (child) => {
			this._recursiveAddComments(child, sortedPosts, threadPosts);
		});
	}

	_addReply(post, sortedPosts, threadPosts) {
		let insertIndex = undefined;
		const repliesToParent = _.filter(sortedPosts, (p) => {
			return p.parentId === post.parentId;
		});
		if (repliesToParent.length > 0) {
			const lastReplyBeforeUs = _.last(_.filter(_.orderBy(repliesToParent, ["id"], ["asc"]), (r) => r.id < post.id));
			if (lastReplyBeforeUs !== undefined) {
				insertIndex = this._findLastCommentIndexInChain(lastReplyBeforeUs, sortedPosts);
			}
		}

		if (insertIndex === undefined) {
			insertIndex = _.indexOf(sortedPosts, _.find(threadPosts, (p) => p.id === post.parentId));
		}

		if (insertIndex !== undefined) {
			sortedPosts.splice(insertIndex, 0, post);
		}
	}

	_findLastCommentIndexInChain(c, comments) {
		const childComments = _.filter(comments, (c1) => c1.parentId === c.id);
		if (childComments.length > 0) {
			const lastComment = _.last(_.orderBy(childComments, ["id"], ["asc"]));
			return this._findLastCommentIndexInChain(lastComment, comments);
		}
		else {
			return _.indexOf(comments, c);
		}
	}

	_recursiveSetDepth(parent, thread, currentDepth) {
		const children = _.filter(thread, (post) => {
			return post.parentId === parent.id;
		});
		_.each(children, (child) => {
			child.depth = currentDepth;
			this._recursiveSetDepth(child, thread, currentDepth + 1);
		});
	}

	_sortSingle(a, b) {
		if (a > b) {
			return -1;
		} else if (a < b) {
			return 1;
		}
		return 0;
	}
}

const chattyStore = new ChattyStore();
export default chattyStore;