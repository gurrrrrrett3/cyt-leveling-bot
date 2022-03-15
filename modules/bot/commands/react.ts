import { SlashCommandBuilder } from "@discordjs/builders";
import Discord from "discord.js";
import reactDB from "../../reactdb";
import Util from "../../util";
import config from "../../../config.json";
import lang from "../../../lang.json";
import React from "../../react";

let reactDatabase = new reactDB(config.settings.react.FILE);

const Command = {
  data: new SlashCommandBuilder().setName("react").setDescription("Starts a reaction challenge"),
  async execute(interaction: Discord.CommandInteraction, ...args: any[]) {
    if (!reactDatabase.checkIfUserCanUse(interaction.user.id)) {
      interaction.reply({
        embeds: [
          Util.genEmbed(
            lang.react.react_not_ready_title,
            `${lang.react.react_not_ready_subtitle} ${Util.formatTime(
              reactDatabase.getTimeLeft(interaction.user.id)
            )}`,
            0x00ff00
          ),
        ],
      });
      return;
    }

    const embed = Util.genEmbed(
      lang.react.react_get_ready_title,
      lang.react.react_get_ready_subtitle,
      0x00ff00
    );

    interaction.reply({ embeds: [embed] }).then(() => {
      setTimeout(async () => {
        let r = new React(interaction);
        let g = await r.generate();
        let e = g.embed;
        let b = g.row;
        interaction.editReply({ embeds: [e], components: [b] });
      }, Util.randomInt(config.settings.react.MIN_DELAY, config.settings.react.MAX_DELAY));
    });
  },
};
module.exports = Command;
