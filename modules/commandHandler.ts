import Discord from "discord.js";
import auth from "../data/auth.json";
import { Command } from "./types";
import Database from "./database";
import Util from "./util";
import { Commands } from "./commands";

export default class CommandHandler {
  public Client: Discord.Client;
  public db: Database;
  private prefix: string;

  constructor(client: Discord.Client, db: Database) {
    this.Client = client;
    this.db = db;
    this.prefix = auth.discord.prefix;
  }

  public async handle(message: Discord.Message) {
    //message starts with the prefix

    if (!message.content.toLowerCase().startsWith(this.prefix)) return;

    const args = message.content.split(" ");
    const commandString = args[0].slice(this.prefix.length).toLowerCase();
    const command = this.getCommand(commandString);
    args.shift();

    if (command) {
      try {
        await command.run(this.Client, message, this.db);
      } catch (e) {
        console.error(e);
      }
    } else {
      //message.reply({embeds: [Util.genEmbed("Error", "Command not found", 0xFF0000)]});
    }
  }

  public getCommand(name: string): Command | undefined {
    return Object.values(Commands).find((cmd) => cmd.name === name || cmd.aliases.includes(name));
  }
}
