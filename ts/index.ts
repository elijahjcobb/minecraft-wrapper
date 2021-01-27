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
});

mw.on("playerJoin", player => {
	console.log(player + " joined!");
	mw.command("op " + player);
});

mw.on("playerLeave", player => {
	console.log(player + " left!");
});
