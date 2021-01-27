/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import {MinecraftWrapper} from "./MinecraftWrapper";

const mw = new MinecraftWrapper({
	workingDirectory: "/home/elijah/Applications/minecraft",
	jarName: "server.jar",
	maxMemory: 16000
});

mw.on("serverStarted", () => {
	console.log("STARTED");
});

mw.on("serverStopping", () => {
	console.log("STOPPING");
});

mw.on("serverStopped", () => {
	console.log("STOPPED");
});

mw.on("playerMessage", (msg, player) => {
	console.log(`${player} says: "${msg}".`);
	if (player === "kernalcobbcorn") {
		if (msg === "1") {
			mw.say("AHH");
		} else if (msg === "2") {
			mw.title("The Title", "The subsititle is a little more boring.");
		} else if (msg === "3") {
			mw.say("There are " + mw.playerCount());
		}
	}

});

mw.on("playerJoin", player => {
	console.log(player + " joined!");
});

mw.on("playerLeave", player => {
	console.log(player + " left!");
});
