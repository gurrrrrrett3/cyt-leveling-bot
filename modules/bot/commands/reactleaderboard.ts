import { SlashCommandBuilder } from "@discordjs/builders";
import Discord, { Client } from "discord.js";
import reactDB from "../../reactdb";
import config from "../../../config.json";
import lang from "../../../lang.json";

const reactDatabase = new reactDB(config.settings.react.FILE);

const Command = {
  data: new SlashCommandBuilder()
    .setName("reactleaderboard")
    .setDescription("Shows the top 10 users with the fastest reactions"),
  async execute(interaction: Discord.CommandInteraction, ...args: any[]) {
    let users = reactDatabase.getTopUsers(10);

    let fields: Discord.EmbedFieldData[] = [];

    for (let i = 0; i < users.length; i++) {
      let user = users[i];
      const reactCount = user.totalReacts;
      const average = Math.round(reactDatabase.getAverageReactTime(user.ID));
      const username = (await interaction.guild?.members.fetch(user.ID))?.displayName;

      fields.push({
        name: `${i + 1}. ${username}`,
        value: `**${lang.reactlb.rlb_average}:** \`${average}ms\`\n**${lang.reactlb.rlb_total_reacts}:** \`${reactCount}\``,
        inline: true,
      });
    }

    const embed = new Discord.MessageEmbed()
      .setTitle(lang.reactlb.rlb_title)
      .setDescription(`${lang.reactlb.rlb_subtitle} ${interaction.guild?.name}`)
      .setColor(0x00ff00)
      .setFooter(`${lang.embed.embed_footer}`)
      .setTimestamp()
      .addFields(fields);

    interaction.reply({ embeds: [embed] });
  },
};
module.exports = Command;
