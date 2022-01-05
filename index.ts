import Discord from "discord.js";
import auth from "./data/auth.json";
import Bot from "./modules/bot";
import checkForDbs from "./modules/checkForDbs";
import Database from "./modules/database";
import onFirstRun from "./modules/onFirstRun";

const db = new Database({
  host: auth.database.host,
  port: auth.database.port,
  user: auth.database.user,
  password: auth.database.password,
});

//check if db files exist and create them if they don't
checkForDbs()

//connect to database
db.Connect().then(async () => {

  //Run first run code

  onFirstRun(db);

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

  Client.once("ready", async() => {
    console.log(`Logged in as ${Client.user?.tag}`);

    Client.user?.setActivity("on CYT | craftyour.town | !help", { type: "PLAYING" });

    //Initialize the bot

    new Bot(Client, db);
  });
});
