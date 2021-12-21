import Discord from "discord.js";
import mariadb from "mariadb";
import auth from "../data/auth.json";
import fs from "fs";
import { Command, CommandData } from "./types";
import Database from "./database";

export default class CommandHandler {
  public Client: Discord.Client;
  public db: Database;
  private prefix: string;
  private commands: Command[] = [];

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
  }

    public getCommand(name: string): Command | undefined {
        return this.commands.find((command) => command.getCommandData().name === name);
    }

}

