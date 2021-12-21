import Discord from "discord.js";
import mariadb from "mariadb";
import auth from "../data/auth.json";
import emoji from "../data/emoji.json";
import User from "./user";
import CommandHandler from "./commandHandler";
import Database from "./database";

export default class Bot {
  public Client: Discord.Client;
  public db: Database;
  public prefix: string;
  public commandHandler: CommandHandler;

  constructor(client: Discord.Client, db: Database) {
    this.Client = client;
    this.db = db;
    this.prefix = auth.discord.prefix;
    this.commandHandler = new CommandHandler(this.Client, this.db);

    this.Client.on("messageCreate", async (message: Discord.Message) => {
      // no bots
      if (message.author.bot) return;

      // no dms
      if (message.channel.type === "DM") return;

    });
  }
}
