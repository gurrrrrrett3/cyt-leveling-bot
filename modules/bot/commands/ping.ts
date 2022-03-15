import { SlashCommandBuilder } from '@discordjs/builders';
import Discord from 'discord.js';

const Command = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Gets the bot\'s latency'),
        async execute(interaction: Discord.CommandInteraction, ...args: any[]) {
            const start = Date.now();
            interaction.reply("Pong!").then(() => {
                const latency = Date.now() - start;
                const ws = interaction.client.ws.ping;
          
                const embed = new Discord.MessageEmbed()
                  .setTitle("Pong!")
                  .setColor("#0099ff")
                  .setDescription(`Latency: ${latency}ms\nWS Latency: ${ws}ms`)
                  .setFooter(`Requested by ${interaction.user.username}`)
                  .setTimestamp();
                interaction.editReply({ embeds: [embed], content: undefined });
              });
        }
}
module.exports = Command;