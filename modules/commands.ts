import Discord, { MessageButton } from "discord.js";
import Util from "./util";

import { discord } from "../data/auth.json";
import Database from "./database";
import User from "./user";
import Api from "./api";
import React from "./react";
import auth from "../data/auth.json";
import lang from "../data/lang.json";
import reactDB from "./reactdb";

let reactDatabase = new reactDB(auth.react.file);

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
          `**${discord.prefix}leaderboard** - Shows the top 10 users\n` +
          `**${discord.prefix}react** - gives you a react challenge to get xp\n` +
          `**${discord.prefix}reactlb - shows the top 10 react users\n` +
          `**${discord.prefix}reactuser - shows your react stats\n` +
          `**${discord.prefix}reactuser <user> - shows someone else's react stats react stats\n`
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
      message.reply(lang.ping.ping_pong).then((msg) => {
        const ping = msg.createdTimestamp - message.createdTimestamp;

        const embed = Util.genEmbed(lang.ping.ping_pong, `🔁 ${ping}ms \n💟 ${Client.ws.ping}ms`);

        msg.edit({ embeds: [embed] });
      });
    },
  },

  level: {
    name: "level",
    description: "Shows your level and XP",
    usage: "level",
    category: "Levels",
    aliases: ["lvl", "xp", "exp", "p", "profile", "rank"],
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
        `**${lang.leaderboard.leaderboard_level}:** ${userData.level}\n**${
          lang.leaderboard.leaderboard_xp
        }:** ${userData.xp}\n**${lang.leaderboard.leaderboard_to_next_level}:** ${
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
          value: `**${lang.leaderboard.leaderboard_level}:** \`${level}\`\n**${lang.leaderboard.leaderboard_xp}:** \`${total}\``,
          inline: true,
        });
      }

      let embed = Util.genEmbed(
        lang.leaderboard.leaderboard_title,
        `${lang.leaderboard.leaderboard_subtitle} ${message.guild?.name}`,
        0x00ff00,
        fields
      );
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
      if (!reactDatabase.checkIfUserCanUse(message.author.id)) {
        const embed = Util.genEmbed(
          "React",
          `You can use this command in ${Util.formatTime(reactDatabase.getTimeLeft(message.author.id))}`,
          0xff0000
        );

        message.reply({ embeds: [embed] });
        return;
      }

      const embed = Util.genEmbed(lang.react.react_get_ready_title, lang.react.react_get_ready_subtitle);

      message.reply({ embeds: [embed] }).then((msg) => {
        setTimeout(async () => {
          let r = new React(message);
          let g = await r.generate();
          let e = g.embed;
          let b = g.row;
          msg.edit({ embeds: [e], components: [b] });
        }, Util.randomInt(auth.react.react_min_delay, auth.react.react_max_delay));
      });
    },
  },
  rlb: {
    name: "rlb",
    description: "Shows the top 10 users who reacted",
    usage: "!rlb, !rlb <user>",
    category: "Levels",
    aliases: ["rl", "reactlb", "reactleaderboard"],
    run: async (Client: Discord.Client, message: Discord.Message, db: Database) => {
      let users = await reactDatabase.getTopUsers(10);

      let fields: { name: string; value: string; inline: boolean }[] = [];

      for (let i = 0; i < users.length; i++) {
        let user = users[i];
        const reactCount = user.totalReacts;
        const average = Math.round(reactDatabase.getAverageReactTime(user.ID));
        const username = await Client.users.fetch(user.ID).then((u) => u.username);

        fields.push({
          name: `${i + 1} ${username}`,
          value: `**${lang.reactlb.rlb_average}:** \`${average}ms\`\n**${lang.reactlb.rlb_total_reacts}:** \`${reactCount}\``,
          inline: true,
        });
      }

      let embed = new Discord.MessageEmbed()
        .setTitle(lang.reactlb.rlb_title)
        .setDescription(`${lang.reactlb.rlb_subtitle} ${message.guild?.name}`)
        .setColor(0x00ff00)
        .setFooter(`${lang.embed.embed_footer}`)
        .setTimestamp()
        .addFields(fields);

      message.reply({ embeds: [embed] });
    },
  },
  reactUser: {
    name: "reactuser",
    description: "Shows info on a single react user",
    usage: "!reactuser, !reactuser <user>",
    category: "Levels",
    aliases: ["ru", "reactu"],
    run: async (Client: Discord.Client, message: Discord.Message, db: Database) => {
      let user = message.mentions.users.first() ?? message.author;
      let userData = reactDatabase.getUser(user.id);

      const embed = Util.genEmbed(
        `${await Client.users.fetch(user).then((u) => u.username)}'s react stats`,
        `**${lang.reactlb.rlb_total_reacts}:** ${userData.totalReacts}\n**${
          lang.reactlb.rlb_average
        }:** ${reactDatabase.getAverageReactTime(userData.ID)}ms`
      );

      message.reply({ embeds: [embed] });
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
        .setFooter(`${lang.embed.embed_footer} | Powered by thecatapi.com`)
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
        .setFooter(`${lang.embed.embed_footer} | Powered by dog.ceo`)
        .setTimestamp();

      const row = new Discord.MessageActionRow().addComponents(
        new MessageButton().setCustomId("anotherCorgi").setLabel("Another!").setStyle("SUCCESS")
      );

      message.reply({ embeds: [embed], components: [row] });
    },
  },
};
