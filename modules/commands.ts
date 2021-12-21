import Discord from "discord.js";
import Util from "./util";

import { discord } from "../data/auth.json";

export const Commands = {
  help: {
    name: "help",
    description: "Get a list of commands",
    usage: "help",
    category: "General",
    aliases: ["h", "commands", "cmds"],
    run: async (Client: Discord.Client, message: Discord.Message) => {
      Util.genEmbed(
        "Help",
        "This is a list of commands you can use in this server.\n\n" +
          `**${discord.prefix}help** - Shows this message\n` +
          `**${discord.prefix}ping** - Pong!\n` +
          `**${discord.prefix}level** - Shows your level and XP\n` +
          `**${discord.prefix}level <user>** - Shows the level of a user\n` +
          `**${discord.prefix}leaderboard** - Shows the top 10 users\n`
      );
    },
  },

    ping: {
        name: "ping",
        description: "Pong!",
        usage: "ping",
        category: "General",
        aliases: ["p"],
        run: async (Client: Discord.Client, message: Discord.Message) => {

            Util.genEmbed(
                "Pong!",
                `🔁 ${message.createdTimestamp - message.createdTimestamp}ms \n💟 ${Client.ws.ping}ms`
            );
        }
    },

    level: {
        name: "level",
        description: "Shows your level and XP",
        usage: "level",
        category: "General",
        aliases: ["lvl"],
        run: async (Client: Discord.Client, message: Discord.Message) => {

        }
    }

};
