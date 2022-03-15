import { SlashCommandBuilder, SlashCommandUserOption } from "@discordjs/builders";
import Discord from "discord.js";
import { db } from "../../..";

const Command = {
  data: new SlashCommandBuilder()
    .setName("level")
    .setDescription("Information about your (or another's) level")
    .addUserOption(
      new SlashCommandUserOption()
        .setName("user")
        .setDescription("The user to get the level of")
        .setRequired(false)
    ),
  async execute(interaction: Discord.CommandInteraction, ...args: any[]) {
    const user = interaction.options.getUser("user") ?? interaction.user;
    db.getUser(user.id).then(async (u) => {
      if (!user) {
        interaction.reply("This user does not exsist!");
        return;
      }
      const embed = new Discord.MessageEmbed()
        .setTitle(`${user.username}'s level`)
        .setColor("#0099ff")
        .setDescription(`Level: ${u.LEVEL}\nXP: ${u.XP}`)
        .setFooter(`Requested by ${interaction.user.username}`)
        .setTimestamp();
      interaction.reply({ embeds: [embed] });
    });
  },
};
module.exports = Command;
