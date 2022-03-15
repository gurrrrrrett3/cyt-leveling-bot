import Discord from "discord.js";
import auth from "./auth.json";
import Bot from "./modules/bot/bot";
import checkForDbs from "./modules/checkForDbs";
import Database from "./modules/database";
import onFirstRun from "./modules/onFirstRun";

export const db = new Database({
  host: auth.database.HOST,
  port: auth.database.PORT,
  user: auth.database.USER,
  password: auth.database.PASSWORD,
});

export let bot: Bot;

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

  Client.login(auth.discord.TOKEN);

  //initialize bot
  bot = new Bot(Client);

  Client.once("ready", async() => {
    Client.user?.setActivity("on CYT | craftyour.town | !help", { type: "PLAYING" });
  });
});
