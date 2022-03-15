import { SlashCommandBuilder } from "@discordjs/builders";
import Discord from "discord.js";
import Api from "../../api";
import lang from "../../../lang.json";

const Command = {
  data: new SlashCommandBuilder().setName("cat").setDescription("Gets a random cat image"),
  async execute(interaction: Discord.CommandInteraction, ...args: any[]) {
    const embed = new Discord.MessageEmbed()
      .setTitle("Random Cat")
      .setImage(await Api.getRandomCat())
      .setColor(0x00ff00)
      .setFooter(
        `${lang.embed.embed_footer} | Requested by ${interaction.user.username} | Powered by thecatapi.com`
      )
      .setTimestamp();

    const row = new Discord.MessageActionRow().addComponents(
      new Discord.MessageButton().setCustomId("anotherCat").setLabel("Another!").setStyle("SUCCESS")
    );

    interaction.reply({ embeds: [embed], components: [row] });
  },
};
module.exports = Command;
