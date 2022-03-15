import Discord from "discord.js";
import React from "../react";
import { bot } from "../../index";

export default class ButtonHandler {
  private client: Discord.Client;

  constructor(client: Discord.Client) {
    this.client = client;

    this.client.on("interactionCreate", async (interaction: Discord.Interaction) => {
      if (!interaction.isButton()) return;
      this.handle(interaction);
    });
  }

  public async handle(interaction: Discord.ButtonInteraction) {
    if (interaction.customId.startsWith("REACT")) {
      new React(interaction).handle(interaction);
      return;
    }

    switch (interaction.customId) {
      case "anotherCorgi":
        bot.CommandHandler.commands.get("corgi")?.execute(interaction);
        break;
      case "anotherCat":
        bot.CommandHandler.commands.get("cat")?.execute(interaction);
        break;
      default:
        break;
    }
  }
}
