import Discord from "discord.js";
import mariadb from "mariadb";
import auth from "../data/auth.json";
import emoji from "../data/emoji.json";
import User from "../modules/user";

export default class Bot {
  public Client: Discord.Client;
  public conn: mariadb.PoolConnection;
  public prefix: string;

  constructor(client: Discord.Client, conn: mariadb.PoolConnection) {
    this.Client = client;
    this.conn = conn;
    this.prefix = auth.discord.prefix;

    this.Client.on("messageCreate", async (message: Discord.Message) => {
      // no bots
      if (message.author.bot) return;

      // no dms
      if (message.channel.type === "DM") return;

      conn
        .query("select * from USERS_TABLE where ID = ?", [message.author.id])
        .then((rows) => {
          //if userdata doesn't exist, create it

          if (rows[0] == undefined) {
            return conn.query("insert into USERS_TABLE (ID, LEVEL, XP, TOTAL, LAST) values (?, ?, ?, ?, ?)", [
              message.author.id,
              1,
              0,
              0,
              Date.now(),
            ]);
          }
        })
        .then(() => {
          conn.query("select * from USERS_TABLE where ID = ?", [message.author.id]).then((rows) => {
            //create a user object
            const user = new User(rows[0]);

            //process the message
            user.processMessage();

            //save the user
            conn.query(
              "update USERS_TABLE set LEVEL = ?, XP = ?, TOTAL = ? , LAST = ? where ID = ?",
              user.export()
            );
          });
        });

      //COMMAND PROCESSING

      //message starts with the prefix

      if (!message.content.toLowerCase().startsWith(this.prefix)) return;

      const args = message.content.split(" ");
      const commandString = args[0].slice(this.prefix.length).toLowerCase();
      const command = getCommand(commandString);
      args.shift();

      //commands

      switch (command) {
        case "help":
          message.reply({
            embeds: [
              new Discord.MessageEmbed({
                title: "Help",
                description:
                  "This is a list of commands you can use in this server.\n\n" +
                  `**${this.prefix}help** - Shows this message\n` +
                  `**${this.prefix}ping** - Pong!\n` +
                  `**${this.prefix}level** - Shows your level and XP\n` +
                  `**${this.prefix}level <user>** - Shows the level of a user\n` +
                  `**${this.prefix}leaderboard** - Shows the top 10 users\n`,
                color: 0x00ff00,
                timestamp: new Date(),
                footer: {
                  text: "craftyour.town",
                },
              }),
            ],
          });
          break;

        case "ping": {
          message.reply("Pong!").then((msg) => {
            msg.edit({
              embeds: [
                new Discord.MessageEmbed({
                  title: "Pong!",
                  description: `🔁 ${msg.createdTimestamp - message.createdTimestamp}ms \n💟 ${Math.round(
                    this.Client.ws.ping
                  )}ms`,
                  color: 0x00ff00,
                  timestamp: new Date(),
                  footer: {
                    text: "craftyour.town",
                  },
                }),
              ],
            });
          });
          break;
        }

        case "level": {
          let user = message.mentions.users.first();
          if (!user) user = message.author;

          if (!user) {
            message.reply({ content: "```ERROR: User unresolvable.```" });
            return;
          }

          conn.query("select * from USERS_TABLE where ID = ?", [user.id]).then(async (rows) => {
            if (rows[0] == undefined) {
              message.reply("That user does not exist!");
            } else {
              const userData = new User(rows[0]);
              message.reply({
                embeds: [
                  new Discord.MessageEmbed({
                    title: `${await this.Client.users
                      .fetch(user ?? message)
                      .then((u) => u.username)}'s level`,
                    description: `**Level:** ${userData.level}\n**XP:** ${
                      userData.xp
                    }\n**XP to next level:** ${userData.genXPNeeded() - userData.xp}\n\n ${formatProgressBar(
                      10,
                      userData.xp,
                      userData.genXPNeeded(),
                      userData.level
                    )}`,
                    color: 0x00ff00,
                    timestamp: new Date(),
                    footer: {
                      text: "craftyour.town",
                    },
                  }),
                ],
              });
            }
          });
          break;
        }

        case "leaderboard": {
          conn.query("select * from USERS_TABLE order by TOTAL desc limit 10").then(async (rows) => {
            let fields = [];

            for (let i = 0; i < rows.length; i++) {
              let thisRow = rows[i];
              let user = new User(thisRow);
              let username = await this.Client.users.fetch(user.id).then((u) => u.username);
              let totalxp = user.total;

              fields.push({
                name: `**${parseInt(i.toString()) + 1}**. ${username}`,
                value: `Total XP: \`${totalxp}\``,
              });
            }

            message.reply({
              embeds: [
                new Discord.MessageEmbed({
                  title: "Leaderboard",
                  color: 0x00ff00,
                  fields: fields,
                  timestamp: new Date(),
                  footer: {
                    text: "craftyour.town",
                  },
                }),
              ],
            });
          });
        }
      }
    });
  }
}

function getCommand(command: string) {
  const commands = [
    { key: "ping", values: ["ping", "pong"] },
    { key: "help", values: ["help", "h"] },
    { key: "level", values: ["level", "lvl", "profile", "p", "stats"] },
    { key: "leaderboard", values: ["leaderboard", "lb"] },
  ];

  for (const index in commands) {
    if (commands[index].values.includes(command)) {
      return commands[index].key;
    }
  }
  return "error";
}

//FROM github.com/gurrrrrrett3/goochmusic-botv2

export function formatProgressBar(length: number, current: number, total: number, level: number) {
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
