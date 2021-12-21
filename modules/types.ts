import { Client, Message } from "discord.js";
import Database from "./database";

export type Command = {
  name: string;
  description: string;
  usage: string;
  category: string;
  aliases: string[];
  run(Client: Client, message: Message, db: Database): Promise<void>;
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
