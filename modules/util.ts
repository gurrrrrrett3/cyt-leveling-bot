import Discord from "discord.js";
export default class Util {

    public static genEmbed(title: string, description: string, color: number = 0x00ff00, fields?: {name: string, value: string, inline?: boolean}[]): Discord.MessageEmbed {

        const embed = new Discord.MessageEmbed();
        embed.setTitle(title);
        embed.setDescription(description);
        embed.setColor(color);
        if (fields) embed.setFields(fields)
        embed.setTimestamp(new Date());
        embed.setFooter("craftyour.town");
        
        return embed;
    }

}