import Discord, { Client, Message } from "discord.js";
import CommandHandler from "./commandHandler";
import Database from "./database";

export type Command = {
  name: string;
  description: string;
  usage: string;
  category: string;
  aliases: string[];
  run(Client: Client, message: Message, db: Database): Promise<void>;
};

export type Interaction = {
  name: string;
  run(Client: Client, interaction: Discord.Interaction, db: Database, commandHandler: CommandHandler): Promise<void>
};

export type Letter ={
  letter: string;
  emoji: string;
};

export type DatabaseUser = [string, number, number, number, number];
export type LocalDatabaseUser = {
  ID: string;
  XP: number;
  LEVEL: number;
  TOTAL: number;
  LAST: number;
};

export type LocalDatabase = {
  users: LocalDatabaseUser[];
  insert: LocalDatabaseUser[];
  update: LocalDatabaseUser[];
};
