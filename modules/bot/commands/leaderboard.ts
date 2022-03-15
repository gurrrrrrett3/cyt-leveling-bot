import { SlashCommandBuilder } from '@discordjs/builders';
import Discord from 'discord.js';
import Util from '../../util';
import lang from '../../../lang.json';
import { db } from "../../.."

const Command = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Shows the top 10 users'),
        async execute(interaction: Discord.CommandInteraction, ...args: any[]) {

            if (!interaction.guild) return;

            let users = await db.getTop(10);

            let fields: {
                name: string,
                value: string,
                inline: boolean
            }[] = []


            for (let i = 0; i < users.length; i++) {
                let user = users[i];
                let dMember = await interaction.guild.members.fetch(user.ID);
                let total = user.TOTAL;
                let level = user.LEVEL;
                fields.push({
                    name: `${i + 1}. ${dMember.displayName ?? dMember.user.username}`,
                    value: `**${lang.leaderboard.leaderboard_level}:** \`${level}\`\n**${lang.leaderboard.leaderboard_xp}:** \`${total}\``,
                    inline: true
                })
            }

            let embed = Util.genEmbed(
                lang.leaderboard.leaderboard_title,
                `${lang.leaderboard.leaderboard_subtitle} ${interaction.guild.name}`,
                0x00ff00,
                fields
            )

            interaction.reply({embeds: [embed]});
        }
}
module.exports = Command;