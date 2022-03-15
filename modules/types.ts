import Discord, { Client, Message } from "discord.js";
import Database from "./database";

export type Command = {
  name: string;
  description: string;
  usage: string;
  category: string;
  aliases: string[];
  run(Client: Client, message: Message, db: Database): Promise<void>;
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


export type ReactUser = {

  ID: string;
  totalReacts: number;
  totalScore: number;
  totalms: number;
  last10Reacts: number[];
  lastReact: number;
}

export type ReactDatabase = ReactUser[];