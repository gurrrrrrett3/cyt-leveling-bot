import { SlashCommandBuilder } from "@discordjs/builders";
import Discord from "discord.js";
import Api from "../../api";
import lang from "../../../lang.json";

const Command = {
  data: new SlashCommandBuilder().setName("corgi").setDescription("Get a random corgi image"),
  async execute(interaction: Discord.CommandInteraction, ...args: any[]) {
    const embed = new Discord.MessageEmbed()
      .setTitle("Random Corgi")
      .setImage(await Api.getRandomCorgi())
      .setColor(0x00ff00)
      .setFooter(
        `${lang.embed.embed_footer} | Requested by ${interaction.user.username} | Powered by dog.ceo`
      )
      .setTimestamp();

    const row = new Discord.MessageActionRow().addComponents(
      new Discord.MessageButton().setCustomId("anotherCorgi").setLabel("Another!").setStyle("SUCCESS")
    );

    interaction.reply({ embeds: [embed], components: [row] });
  },
};
module.exports = Command;
