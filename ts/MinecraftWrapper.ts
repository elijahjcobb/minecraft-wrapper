/**
 * Elijah Cobb
 * elijah@elijahcobb.com
 * elijahcobb.com
 * github.com/elijahjcobb
 */

import {ChildProcessWithoutNullStreams, spawn} from "child_process";
import {TypedEmitter} from "tiny-typed-emitter";
import * as FS from "fs";
import * as Path from "path";

export interface MWConfig {
	workingDirectory: string;
	jarName: string;
	maxMemory?: number;
}

export interface MWEvents {
	rawOutput: (value: string) => void;
	message: (message: string, time: string) => void;
	playerMessage: (message: string, player: string, time: string) => void;
	playerJoin: (player: string, time: string) => void;
	playerLeave: (player: string, time: string) => void;
	serverStarted: (time: string) => void;
	serverStopping: (time: string) => void;
	serverStopped: (time: string) => void;
}

export class MinecraftMessage {



	public constructor(buff: Buffer) {

	}

}

export class MinecraftWrapper extends TypedEmitter<MWEvents> {

	private readonly activePlayers: Set<string>;
	private running: boolean;
	private readonly DEFAULT_MEMORY: number = 1024;
	private readonly config: MWConfig;
	private readonly process: ChildProcessWithoutNullStreams;

	public constructor(config: MWConfig) {

		super();

		this.activePlayers = new Set<string>();
		this.running = false;

		if (!FS.existsSync(config.workingDirectory)) {
			console.error("The path you supplied for the working directory does not exist. :\\");
			throw new Error(`Path '${config.workingDirectory}' does not exist. Aborting...`);
		}

		if (!FS.existsSync(Path.resolve(config.workingDirectory, config.jarName))) {
			console.error("Cannot find a jar with that name...");
			throw new Error(`A '.jar'. with name '${config.jarName}' does not exist in path '${config.workingDirectory}'.`);
		}

		this.config = config;
		this.process = spawn("java", [`-Xmx${config.maxMemory ?? this.DEFAULT_MEMORY}M`, `-Xms${config.maxMemory ?? this.DEFAULT_MEMORY}M`, "-jar", config.jarName, "nogui"], {cwd: config.workingDirectory});
		this.process.stdout.on("data", this.handleSTDOut.bind(this));
		this.process.on("close", this.handleClose.bind(this));

	}

	private handleClose(): void {
		this.running = false;
		this.emit("serverStopped", MinecraftWrapper.getTimeNow());
	}

	private handleSTDOut(value: Buffer): void {

		let msg: string = value.toString("utf8");
		this.emit("rawOutput", msg);
		msg = msg.replace("\n", "");

		const timeUnformatted: string = msg.substr(1, 8);
		const time: string = new Date(`August 19, 1975 ${timeUnformatted} GMT+00:00`).toLocaleTimeString("en-US");

		const message: string = msg.substr(msg.indexOf("]: ") + 3);
		this.handleMessage(time, message);

	}

	private handleMessage(time: string, message: string): void {
		if (message.indexOf("joined the game") !== -1) {
			const player: string = message.split(" ")[0];
			this.emit("playerJoin", player, time);
			this.activePlayers.add(player);
		} else if (message.indexOf("left the game") !== -1) {
			const player: string = message.split(" ")[0];
			this.emit("playerLeave", player, time);
			this.activePlayers.delete(player);
		} else if (message.indexOf("Done (") !== -1) {
			this.emit("serverStarted", time);
			this.running = true;
		} else if (message.indexOf("Stopping server") !== -1) {
			this.running = false;
			this.emit("serverStopping", time);
		} else if (message.charAt(0) === "<") {
			const player: string = message.substring(1, message.indexOf(">"));
			const msg: string = message.substring(message.indexOf("> ") + 2);
			this.emit("playerMessage", msg, player, time);
		} else {
			this.emit("message", message, time);
		}
	}

	public playerCount(): number {
		return this.activePlayers.size;
	}

	public players(): string[] {
		const players: string[] = [];
		for (const player of this.activePlayers) players.push(player);
		return players;
	}

	public command(command: string): void {
		if (this.process.stdin.destroyed) {
			console.error("Server not running.");
			return;
		}

		this.process.stdin.write(command + "\n", error => {
			if (error) {
				console.error(error);
			}
		});
	}

	public say(message: string, player?: string): void {
		if (!player) this.command("say " + message);
		else this.command(`tell ${player} ${message}`);
	}

	public title(title: string, subtitle?: string, player?: string): void {
		this.command(`title ${player ?? "@a"} title {"text":"${title}"}`);
		if (subtitle) this.command(`title ${player ?? "@a"} subtitle {"text":"${subtitle}"}`);
	}

	private static getTimeNow(): string {
		return new Date().toLocaleTimeString("en-US");
	}

}
