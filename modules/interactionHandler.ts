import Discord from "discord.js";
import Database from "./database";
import CommandHandler from "./commandHandler";
import { interactions } from "./interactions";
import { Interaction } from "./types";
import React from "./react";

export default class InteractionHandler {
  public client: Discord.Client;
  public db: Database;
  public commandHandler: CommandHandler;

  constructor(client: Discord.Client, db: Database, commandHandler: CommandHandler) {
    this.client = client;
    this.db = db;
    this.commandHandler = commandHandler;
  }

  public handle(interaction: Discord.Interaction) {
    if (interaction.isButton()) {
      let message = interaction.message;

      //handle REACT button interactions

      if (interaction.customId.startsWith("REACT")) {
        //@ts-ignore
        let react = new React(message);
        react.handle(interaction, this.db);
      }

      const interactionData = this.getButtonInteraction(interaction.customId);

      if (!interactionData) return;

      interactionData.run(this.client, interaction, this.db, this.commandHandler);
    }
  }

  public getButtonInteraction(name: string): Interaction | undefined {
    return interactions.button.find((interaction) => interaction.name === name);
  }
}
