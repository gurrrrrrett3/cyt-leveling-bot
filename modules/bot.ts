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

      this.commandHandler.handle(message);

      const dbUser = await this.db.getUser(message.author.id);

      if (!dbUser) {
        console.error(`User ${message.author.id} not found in database`);
        //shouldn't happen ever, but just in case
        return;
      }

      const user = new User(dbUser);

      user.processMessage()
      
      db.saveUser(user);

    });

    this.Client.on("interactionCreate", async (interaction: Discord.Interaction) => {

      if (interaction.isButton()) {

        let id = interaction.customId

        switch (id) {
        
          case "anotherCat": {

           const command = this.commandHandler.getCommand("cat")

           if (command) {
             let message = interaction.channel?.lastMessage
             if (!message) return
              command.run(this.Client, message, this.db)
           }

          }

        }

      }

    })
  }
}
