import Discord from "discord.js";
import mariadb from "mariadb";

import auth from "./data/auth.json";
import Bot from "./modules/bot";
import Database from "./modules/database";

const db = new Database({
  host: auth.database.host,
  user: auth.database.user,
  password: auth.database.password,
});

db.Connect().then(async () => {

    console.log(await db.getUser("232510731067588608"))

  //Log in to discord

  console.log("Database connection initialized, logging in to discord");

  const Client = new Discord.Client({
    intents: [
      "GUILDS",
      "GUILD_MEMBERS",
      "GUILD_MESSAGES",
      "GUILD_MESSAGE_REACTIONS",
      "GUILD_MESSAGE_TYPING",
      "DIRECT_MESSAGES",
    ],
  });

  Client.login(auth.discord.token);

  Client.once("ready", () => {
    console.log(`Logged in as ${Client.user?.tag}`);

    Client.user?.setActivity("on CYT | craftyour.town | !help", { type: "PLAYING" });

    //Initialize the bot

    const bot = new Bot(Client, db);
  });
});
