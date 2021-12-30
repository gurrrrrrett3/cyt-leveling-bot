import Discord, { MessageButton } from "discord.js";
import Util from "./util";

import { discord } from "../data/auth.json";
import Database from "./database";
import User from "./user";
import Api from "./api";
import React from "./react";

export const Commands = {
  help: {
    name: "help",
    description: "Get a list of commands",
    usage: "help",
    category: "General",
    aliases: ["h", "commands", "cmds"],
    run: async (Client: Discord.Client, message: Discord.Message, db: Database) => {
      const embed = Util.genEmbed(
        "Help",
        "This is a list of commands you can use in this server.\n\n" +
          `**${discord.prefix}help** - Shows this message\n` +
          `**${discord.prefix}ping** - Pong!\n` +
          `**${discord.prefix}level** - Shows your level and XP\n` +
          `**${discord.prefix}level <user>** - Shows the level of a user\n` +
          `**${discord.prefix}leaderboard** - Shows the top 10 users\n`
      );

      message.reply({ embeds: [embed] });
    },
  },

  ping: {
    name: "ping",
    description: "Pong!",
    usage: "ping",
    category: "General",
    aliases: ["p"],
    run: async (Client: Discord.Client, message: Discord.Message, db: Database) => {
      message.reply("Pong!").then((msg) => {
        const ping = msg.createdTimestamp - message.createdTimestamp;

        const embed = Util.genEmbed("Pong!", `🔁 ${ping}ms \n💟 ${Client.ws.ping}ms`);

        msg.edit({ embeds: [embed] });
      });
    },
  },

  level: {
    name: "level",
    description: "Shows your level and XP",
    usage: "level",
    category: "Levels",
    aliases: ["lvl", "xp", "exp", "p", "profile"],
    run: async (Client: Discord.Client, message: Discord.Message, db: Database) => {
      let user = message.mentions.users.first() ?? message.author;
      let userDB = await db.getUser(user.id);

      if (!userDB) {
        message.reply("That user does not exist!");
        //should never run, but just in case
        return;
      }

      let userData = new User(userDB);

      const embed = Util.genEmbed(
        `${await Client.users.fetch(user).then((u) => u.username)}'s level`,
        `**Level:** ${userData.level}\n**XP:** ${userData.xp}\n**XP to next level:** ${
          userData.genXPNeeded() - userData.xp
        }\n\n ${Util.formatProgressBar(10, userData.xp, userData.genXPNeeded(), userData.level)}`
      );

      message.reply({ embeds: [embed] });
    },
  },

  leaderboard: {
    name: "leaderboard",
    description: "Shows the top 10 users",
    usage: "leaderboard",
    category: "Levels",
    aliases: ["lb", "top"],
    run: async (Client: Discord.Client, message: Discord.Message, db: Database) => {
      let users = await db.getTop(10);

      let fields: { name: string; value: string; inline: boolean }[] = [];

      for (let i = 0; i < users.length; i++) {
        let user = users[i];
        const total = user.TOTAL;
        const level = user.LEVEL;
        const username = await Client.users.fetch(user.ID).then((u) => u.username);

        fields.push({
          name: `${i + 1} ${username}`,
          value: `**Level:** \`${level}\`\n**XP:** \`${total}\``,
          inline: true,
        });
      }

      let embed = Util.genEmbed("Leaderboard", `Top 10 users for ${message.guild?.name}`, 0x00ff00, fields);
      message.reply({ embeds: [embed] });
    },
  },

  react: {
    name: "react",
    description: "Creates a reaction challenge",
    usage: "!react",
    category: "Levels",
    aliases: ["r"],
    run: async (Client: Discord.Client, message: Discord.Message, db: Database) => {

      const embed = Util.genEmbed(
        "Get Ready...",
        "Please Wait..."
      );

      message.reply({ embeds: [embed] });

      setTimeout(async () => {

        let r = new React(message);
        let g = await r.generate();
        let e = g.embed;
        let b = g.row;

        message.reply({ embeds: [e], components: [b] });

      }, Util.randomInt(3000, 10000));
    },
  },

  dbData: {
    name: "db",
    description: "Shows the database data",
    usage: "db",
    category: "Debug",
    aliases: ["dbdata"],
    run: async (Client: Discord.Client, message: Discord.Message, db: Database) => {
      let data = db.getDatabaseStats();

      const embed = Util.genEmbed(
        "Database Data",
        `**Total Local Users:** \`${data.localUsers}\`\n**Total Local Users waiting to be inserted:** \`${data.localInsert}\`\n**Total Local Users waiting to be updated:** \`${data.localUpdate}\`\n**Last Update:** <t:${data.lastUpdate}:R>\n**Next Update:** <t:${data.nextUpdate}:R>\n**Total Database Queries since last update:** \`${data.databaseQueryCount}\``,
        0x00ff00
      );

      message.reply({ embeds: [embed] });
    },
  },

  cat: {
    name: "cat",
    description: "Gets a random cat",
    usage: "cat",
    category: "Fun",
    aliases: ["kitty", "kitten"],
    run: async (Client: Discord.Client, message: Discord.Message, db: Database) => {
      const embed = new Discord.MessageEmbed()
        .setTitle("Random Cat")
        .setImage(await Api.getRandomCat())
        .setColor(0x00ff00)
        .setFooter("Powered by thecatapi.com")
        .setTimestamp();

      const row = new Discord.MessageActionRow().addComponents(
        new MessageButton().setCustomId("anotherCat").setLabel("Another!").setStyle("SUCCESS")
      );

      message.reply({ embeds: [embed], components: [row] });
    },
  },

  corgi: {
    name: "corgi",
    description: "Gets a random corgi",
    usage: "corgi",
    category: "Fun",
    aliases: ["corgy"],
    run: async (Client: Discord.Client, message: Discord.Message, db: Database) => {

      const embed = new Discord.MessageEmbed()
        .setTitle("Random Corgi")
        .setImage(await Api.getRandomCorgi())
        .setColor(0x00ff00)
        .setFooter("Powered by dog.ceo")
        .setTimestamp();
        
      const row = new Discord.MessageActionRow().addComponents(
        new MessageButton().setCustomId("anotherCorgi").setLabel("Another!").setStyle("SUCCESS")
      );

      message.reply({ embeds: [embed], components: [row] });
    }
  },
};
