import chattyStore from "./ChattyStore";

describe("blah", () => {
	let posts;

	beforeEach(() => {
		posts = [{
			//0
			"id": 36793307,
			"threadId": 36792962,
			"parentId": 36793301,
			"author": "BlackCat9",
			"category": "ontopic",
			"date": "2017-10-08T19:21:00Z",
			"body": "I do know the team lead and he's also getting over a cold, but said he'd be there.",
			"lols": []
		}, {
			//1
			"id": 36793301,
			"threadId": 36792962,
			"parentId": 36792962,
			"author": "boarder2",
			"category": "ontopic",
			"date": "2017-10-08T19:19:00Z",
			"body": "Ask them if you can. They might not want to get sick.",
			"lols": []
		}, {
			//2
			"id": 36793288,
			"threadId": 36792962,
			"parentId": 36792962,
			"author": "quazar",
			"category": "ontopic",
			"date": "2017-10-08T19:15:00Z",
			"body": "Got to tuff it out ",
			"lols": []
		}, {
			//3
			"id": 36793178,
			"threadId": 36792962,
			"parentId": 36793172,
			"author": "jingletard",
			"category": "ontopic",
			"date": "2017-10-08T18:42:00Z",
			"body": "I had an addiction years ago but this is an antihistamine and a nasal spray.  I don't think I'm going to have to go to rehab over that.",
			"lols": []
		}, {
			//4
			"id": 36793172,
			"threadId": 36792962,
			"parentId": 36793161,
			"author": "helvetica",
			"category": "ontopic",
			"date": "2017-10-08T18:40:00Z",
			"body": "Didn't you have issues with taking too many pills? Or am I misremembering?",
			"lols": []
		}, {
			//5
			"id": 36793170,
			"threadId": 36792962,
			"parentId": 36792985,
			"author": "j0nchan",
			"category": "ontopic",
			"date": "2017-10-08T18:39:00Z",
			"body": "as an interviewer, i'd be more put off that people come in sick. :\\",
			"lols": []
		}, {
			//6
			"id": 36793168,
			"threadId": 36792962,
			"parentId": 36792962,
			"author": "helvetica",
			"category": "ontopic",
			"date": "2017-10-08T18:38:00Z",
			"body": "I would barrel through. They should be understanding and rescheduling could be a pain in the caboose for them.Good luck!",
			"lols": []
		}, {
			//7
			"id": 36793161,
			"threadId": 36792962,
			"parentId": 36793138,
			"author": "jingletard",
			"category": "ontopic",
			"date": "2017-10-08T18:34:00Z",
			"body": "Also if any of ya'll reading this have problems breathing through your nose when you wake up and you're all stuffed up, this is the magical combo which will fix all your problems.",
			"lols": []
		}, {
			//8
			"id": 36793138,
			"threadId": 36792962,
			"parentId": 36793125,
			"author": "jingletard",
			"category": "ontopic",
			"date": "2017-10-08T18:28:00Z",
			"body": "I smoke and I can't breathe out of my nose because of it.  I'm always stuffed up.  This stuff right up above not only allows me to breathe normally, it absolutely opens me up when I have a cold as well. ",
			"lols": []
		}, {
			//9
			"id": 36793125,
			"threadId": 36792962,
			"parentId": 36793119,
			"author": "jingletard",
			"category": "ontopic",
			"date": "2017-10-08T18:24:00Z",
			"body": "Here's what they look like. I guarantee you will be able to breathe.",
			"lols": []
		}, {
			//10
			"id": 36793119,
			"threadId": 36792962,
			"parentId": 36793114,
			"author": "BlackCat9",
			"category": "ontopic",
			"date": "2017-10-08T18:22:00Z",
			"body": "Being able to breathe through my nose would be nice.",
			"lols": []
		}, {
			//11
			"id": 36793116,
			"threadId": 36792962,
			"parentId": 36792962,
			"author": "A10Pilot",
			"category": "ontopic",
			"date": "2017-10-08T18:20:00Z",
			"body": "Good luck! ",
			"lols": []
		}, {
			//12
			"id": 36793114,
			"threadId": 36792962,
			"parentId": 36792962,
			"author": "jingletard",
			"category": "ontopic",
			"date": "2017-10-08T18:20:00Z",
			"body": "Go get some Loratadine (Clairitin) and some Fluticasone (Nasonex) from Walmart for like $10 a piece for both of them for the generic version.  Use that.  At least you won't be congested any more.",
			"lols": []
		}, {
			//13
			"id": 36793097,
			"threadId": 36792962,
			"parentId": 36792962,
			"author": "Megara9",
			"category": "ontopic",
			"date": "2017-10-08T18:14:00Z",
			"body": "Either way I\u2019m pulling for you. Hope you get it!!! ",
			"lols": []
		}, {
			//14
			"id": 36793079,
			"threadId": 36792962,
			"parentId": 36792962,
			"author": "sposh",
			"category": "ontopic",
			"date": "2017-10-08T18:08:00Z",
			"body": "I wouldn\u2019t reschedule unless it\u2019s serious. Just get some rest and take something tomorrow if needed. ",
			"lols": []
		}, {
			//15
			"id": 36792985,
			"threadId": 36792962,
			"parentId": 36792970,
			"author": "mn3m0n1c",
			"category": "ontopic",
			"date": "2017-10-08T17:44:00Z",
			"body": "^^^ Just let them know you've got a cold. Use it as an opportunity to demonstrate your determination.",
			"lols": []
		}, {
			//16
			"id": 36792970,
			"threadId": 36792962,
			"parentId": 36792962,
			"author": "AssGoblin",
			"category": "ontopic",
			"date": "2017-10-08T17:42:00Z",
			"body": "Don\u2019t reschedule and don\u2019t take drugs. ",
			"lols": []
		}, {
			//17
			"id": 36792962,
			"threadId": 36792962,
			"parentId": 0,
			"author": "BlackCat9",
			"category": "ontopic",
			"date": "2017-10-08T17:39:00Z",
			"body": "Got an interview for the job of my life tomorrow. I've been preparing all week to go in and crush it. But after losing sleep all week, now I've got a cold. Do I ask to reschedule or load up with Dayquil and just barrel through?",
			"lols": [{ "tag": "unf", "count": 1 }]
		}];
	});

	it("does some stuff", () => {
		const sorted = chattyStore._parseThread(posts, true);
		expect(sorted).toEqual([posts[17], posts[16], posts[15], posts[5], posts[14], posts[13], posts[12], posts[10], posts[9], posts[8], posts[7], posts[4], posts[3], posts[11], posts[6], posts[2], posts[1], posts[0]]);
	});
});
