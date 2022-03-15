import { SlashCommandBuilder, SlashCommandUserOption } from "@discordjs/builders";
import Discord from "discord.js";
import reactDB from "../../reactdb";
import config from "../../../config.json";

const reactDatabse = new reactDB(config.settings.react.FILE);

const Command = {
  data: new SlashCommandBuilder()
    .setName("reactuser")
    .setDescription("Get a user's react stats")
    .addUserOption(
      new SlashCommandUserOption()
        .setName("user")
        .setDescription("The user to get the stats of")
        .setRequired(false)
    ),
  async execute(interaction: Discord.CommandInteraction, ...args: any[]) {
    const user = interaction.options.getUser("user") ?? interaction.user;
    const u = reactDatabse.getUser(user.id);
    if (!u) {
      interaction.reply("This user does not exsist!");
      return;
    }

    const embed = new Discord.MessageEmbed()
      .setTitle(`${user.username}'s react stats`)
      .setColor("#0099ff")
      .setDescription(
        `Reacts: \`${u.totalReacts}\`\Average Reaction time: \`${Math.round(
          reactDatabse.getAverageReactTime(user.id)
        )}ms\`\nLast 10 reactions:\n${u.last10Reacts.map((r) => `\`${Math.round(r)}ms\``).join("\n ")}`
      );

    interaction.reply({ embeds: [embed] });
  },
};

module.exports = Command;
