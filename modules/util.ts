import Discord from "discord.js";
import emoji from "../data/emoji.json";
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

    public static formatProgressBar(length: number, current: number, total: number, level: number) {
        const percent = Math.floor((current / total) * 100);
      
        const barCurrent = percent / length;
      
        let progress = "";
        for (let i = 0; i < length; i++) {
          if (i < barCurrent) {
            progress += emoji.progressbar.full;
          } else {
            progress += emoji.progressbar.empty;
          }
        }
        return `${level} |${progress}| ${level + 1}`;
      }

      public static minutesToMilliseconds(minutes: number) {

        return minutes * 60000;
      }

      public static randomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
      
      public static randomizeArray<T>(array: T[]) {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
      }
}