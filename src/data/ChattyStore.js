import { action, observable } from "mobx";
import * as _ from "lodash";

import AuthorTypes from "./AuthorTypes";
import loginStore from "../data/LoginStore";
import seenPosts from "./SeenPosts";
import WinchattyAPI from "../api/WinchattyAPI";
import debugStore from "./DebugStore";

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
		this._clearTimer();
		if (this.unfilteredChatty.size > 0) {
			debugStore.addLog("Have a chatty. Waiting for next event.");
			this._waitForNextEvent();
		} else {
			this.refreshing = true;
			debugStore.addLog("Getting full chatty from startChattyRefresh");
			this._getWholeChatty(true);
		}
	}

	stopChattyRefresh() {
		this._clearTimer();
	}

	@action addRootPost(post) {
		// console.log("Adding post id " + post.id + " to data store.");
		this.unfilteredChatty.set(post.id.toString(), post);
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
		for (const p of sortedChatty) {
			if (p.isNewThread) {
				p.wasNewThread = true;
			} else {
				p.wasNewThread = false;
			}
			p.isNewThread = false;
			this.filteredChatty.set(p.id.toString(), p);
		}
	}

	@action setSortOrder(value) {
		this.sortOrder = value;
	}

	@action async _getWholeChatty(startRefreshTimer) {
		try {
			//performance.now doesn't exist in RN so I guess this is the best I can do for now.  
			// No luck looking for something different in after 2 minutes and it's not worth spending more time.
			// let start = new Date();
			this.refreshing = true;
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
			const rootPosts = new Map();
			const username = await loginStore.getUser();
			for (const thread of chattyJson.threads) {
				const newThread = await this._createRootThread(thread.posts, username, false);
				rootPosts.set(newThread.id.toString(), newThread);
			}
			// end = new Date();
			// console.log("Parsing chatty took " + (end.getTime() - start.getTime()).toString() + " ms");

			this.unfilteredChatty.replace(rootPosts);
			this.refreshChatty();
			this.refreshing = false;

			this._clearTimer();
			if (startRefreshTimer) {
				this.refreshTimer = setTimeout(async () => {
					await this._waitForNextEvent();
				}, 10000);
			}
		} catch (error) {
			debugStore.addError(error);
		}
	}

	@action async _waitForNextEvent() {
		let json;
		try {
			// console.log("getting next event");
			json = await WinchattyAPI._waitForNextEvent(this._lastEventId);
			if (json.error) {
				if (json.code === "ERR_TOO_MANY_EVENTS") {
					debugStore.addLog("Too many events since last refresh. Starting over.");
					await this._getWholeChatty(false);
					return;
				}
			}

			this._lastEventId = json.lastEventId;
			debugStore.addLog(`Got ${json.events.length} events`);
			for (const event of json.events) {
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
			}
		} catch (e) {
			debugStore.addError("Error processing events - Error:  " + JSON.stringify(e) + " Events: " + JSON.stringify(json));
		} finally {
			this._clearTimer();
			this._refreshTimer = setTimeout(async () => {
				await this._waitForNextEvent();
			}, 10000);
		}
	}

	_getSortedChatty() {
		debugStore.addLog("Sorting by " + this.sortOrder);
		switch (this.sortOrder) {
			case "hasReplies":
				return this.unfilteredChatty.values().sort((a, b) => {
					if (a.unreadReplies === b.unreadReplies) {
						if (a.isNewThread === b.isNewThread) {
							const aMaxPostId = _.max(a.posts.map(p => p.id));
							const bMaxPostId = _.max(b.posts.map(p => p.id));
							return this._sortSingle(aMaxPostId, bMaxPostId);
						}
						return a.isNewThread ? -1 : 1;
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
		if (!_.isUndefined(this._refreshTimer)) {
			debugStore.addLog("Stopping chatty refresh timer.");
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
			const newThread = this._createRootThread([post], username, true);
			if (!this.unfilteredChatty.has(newThread.id.toString())) {
				this.addRootPost(newThread);
				this.newThreadCount++;
			}
		} else {
			const thread = this.unfilteredChatty.get(post.threadId.toString());
			if (_.isUndefined(thread)) {
				// console.log("Can't find thread for the post");
				return;
			}
			const newPosts = _.unionBy(thread.posts, [post], (p) => p.id);
			const sortedPosts = this._parseThread(newPosts, username, false);
			await this.updatePostsForThread(post.threadId, sortedPosts);
		}
	}

	_createRootThread(threadPosts, username, isNewThread) {
		if (!_.isEmpty(username)) { username = username.toLowerCase(); } else { username = ""; }
		const parsedThreadPosts = this._parseThread(threadPosts, username, true);
		seenPosts.markPostRead(parsedThreadPosts[0].id); //Root post will never be unread.
		parsedThreadPosts[0].isRead = true;
		let rootPost = Object.assign({}, parsedThreadPosts[0]);
		rootPost.postCount = parsedThreadPosts.length;
		rootPost.isNewThread = isNewThread;
		rootPost.hasUnreadPosts = _.some(parsedThreadPosts, p => !seenPosts.isPostRead(p.id));
		rootPost.participated = !_.isEmpty(username) && _.some(parsedThreadPosts, p => p.author.toLowerCase() === username);
		rootPost.unreadReplies = !_.isEmpty(username) && this._threadContainsUnreadReplies(username, parsedThreadPosts);
		this._generatePreview(rootPost);
		rootPost.posts = parsedThreadPosts;
		return rootPost;
	}
	//Prettu much copied this from LC UWP. There is a lot of looping in here that I"m sure could be optimized.
	_parseThread(threadPosts, username, setRootSelected) {
		if (!_.isEmpty(username)) { username = username.toLowerCase(); } else { username = ""; }
		threadPosts = _.orderBy(threadPosts, ["id"], ["asc"]);
		const rootPost = _.find(threadPosts, (p) => {
			return p.parentId === 0;
		});
		const threadOP = rootPost.author;
		rootPost.depth = 0;
		this._recursiveSetDepth(rootPost, threadPosts, 1);
		const sortedPosts = [];
		this._recursiveAddComments(rootPost, sortedPosts, threadPosts);
		const posts = _.chain(sortedPosts)
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
				p.body = p.body.replace(/\r?<br \/>/g, "\n");
				p.authorType = this._getAuthorType(p.author, username, p.id === rootPost.id ? "" : threadOP);
			})
			.value();

		this._calculateDepthIndicators(posts);
		return posts;
	}

	_getAuthorType(username, currentUser, opAuthor) {
		switch (username.toLowerCase()) {
			case "boarder2":
				return AuthorTypes.Boarder2;
			case "shacknews":
				return AuthorTypes.Shacknews;
			case currentUser.toLowerCase():
				return AuthorTypes.Self;
			case opAuthor.toLowerCase():
				return AuthorTypes.ThreadOP;
			default:
				return AuthorTypes.Default;
		}
	}

	_calculateDepthIndicators(posts) {
		var orderedById = _.sortBy(posts, ["id"]);
		for (const c of orderedById) {
			var indicators = [c.depth];
			for (var depth = 0; depth < c.depth; depth++) {
				//Figure out if we're the last at our depth.
				if (depth == c.depth - 1) {
					indicators[depth] = this._isLastCommentAtDepth(posts, c) ? "└" : "├";
				}
				else {
					var parentForDepth = this._findParentAtDepth(posts, c, depth + 1);
					if (!this._isLastCommentAtDepth(posts, parentForDepth)) {
						indicators[depth] = "│";
					}
					else {
						indicators[depth] = " ";
					}
				}
			}
			if (c.depth > 0) {
				c.depthText = indicators.join("");
			} else {
				c.depthText = "";
			}
		}
	}

	_findParentAtDepth(posts, c, depth) {
		var parent = _.find(posts, c1 => c1.id === c.parentId);
		if (parent.depth == depth) {
			return parent;
		}
		return this._findParentAtDepth(posts, parent, depth);
	}

	_isLastCommentAtDepth(posts, c) {
		var threadsAtDepth = _.orderBy(_.filter(posts, c1 => c1.parentId == c.parentId), ["id"]);
		return _.last(threadsAtDepth).id === c.id;
	}

	_generatePreview(post) {
		post.preview = post.body.replace(/\n/mg, " ").replace(/<(?:.|\n)*?>/gm, "").trim().substr(0, 300);
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