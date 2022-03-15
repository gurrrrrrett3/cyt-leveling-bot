import { SlashCommandBuilder } from '@discordjs/builders';
import Discord, { Client, EmbedFieldData } from 'discord.js';
import fs from 'fs';
import Util from '../../util';

const Command = {
    data: new SlashCommandBuilder()
        .setName('credts')
        .setDescription('Get info on the developer, and the bot'),
        async execute(interaction: Discord.CommandInteraction, ...args: any[]) {
            let packages: string[]  = [];

            const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

            Object.keys(packageJson.dependencies).forEach((key) => {
                packages.push(`${key} - ${packageJson.dependencies[key]}`);
              });

              let feilds: EmbedFieldData[] = [];

              feilds.push({
                name: "Author",
                value: "Gucci_Garrett#9211",
                inline: true,
              });
        
              feilds.push({
                name: "Version",
                value: packageJson.version,
                inline: true,
              });
        
              feilds.push({
                name: "Uptime",
                value: Util.formatTime((interaction.client.uptime ?? 0)),
                inline: true,
              });
        
              feilds.push({
                name: "Github",
                value: packageJson.repository.url.replace("git+", "").replace(".git", ""),
                inline: false,
              });
        
              feilds.push({
                name: "Dependencies",
                value: packages.join("\n"),
                inline: false,
              });
        
              feilds.push({
                name: "Any bugs?",
                value: `Report them here: ${packageJson.bugs.url}`
              });

              const embed = Util.genEmbed("Credits", "", 0x00ff00 ,feilds);

                interaction.reply({ embeds: [embed]});
        }
}
module.exports = Command;