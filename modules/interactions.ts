import Discord from "discord.js";
import Database from "./database";
import CommandHandler from "./commandHandler";

export const interactions = {
  button: [
    {
      name: "anotherCat",
      run: async (
        client: Discord.Client,
        interaction: Discord.ButtonInteraction,
        db: Database,
        commandHandler: CommandHandler
      ) => {
        const command = commandHandler.getCommand("cat");

        if (command) {
      if (interaction.channel?.id != "920719074030387232") return;
          interaction.message.author = interaction.user;
          //@ts-ignore
          command.run(client, interaction.message, db);
          interaction.reply("Fetching...");
          setTimeout(() => {
            interaction.deleteReply();
          }, 1000);
        }
      },
    },
    {
      name: "anotherCorgi",
      run: async (
        client: Discord.Client,
        interaction: Discord.ButtonInteraction,
        db: Database,
        commandHandler: CommandHandler
      ) => {
        const command = commandHandler.getCommand("corgi");
        if (command) {
      if (interaction.channel?.id != "920719074030387232") return;
          interaction.message.author = interaction.user;
          //@ts-ignore
          command.run(client, interaction.message, db);
          interaction.reply("Fetching...");
          setTimeout(() => {
            interaction.deleteReply();
          }, 1000);
        }
      },
    },
  ],
};
