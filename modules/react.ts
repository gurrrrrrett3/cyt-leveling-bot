import Discord from "discord.js";
import emojis from "../data/emoji.json";
import Database from "./database";
import { Letter } from "./types";
import User from "./user";
import Util from "./util";
import reactDB from "./reactdb";
import lang from "../lang.json";
import config from "../config.json";
import { db } from "..";

export default class React {
  public interaction: Discord.Interaction;
  public reactDB = new reactDB(config.settings.react.FILE);

  constructor(interaction: Discord.Interaction) {
    this.interaction = interaction;
  }

  public async generate() {
    let letter = React.generateLetter();

    const embed = new Discord.MessageEmbed()
      .setTitle(lang.react.react_title)
      .setDescription(lang.react.react_button)
      .addField(lang.react.react_click, letter.letter, true);

    const row = React.generateRow(letter, Date.now());

    return {
      embed,
      row,
    };
  }

  public async handle(interaction: Discord.ButtonInteraction) {
    let clicked = interaction.customId;
    let correct = clicked.startsWith("REACTT");
    let letter = clicked.charAt(6);
    let ms = parseInt(clicked.substr(7));
    const took = Date.now() - ms;
    let xp =
      took > config.settings.react.MAX_TIME
        ? 0
        : Math.round((config.settings.react.MAX_TIME - took) / config.settings.react.MS_PER_XP);
    const embed = new Discord.MessageEmbed()
      .setTitle(correct ? lang.react.react_correct : lang.react.react_incorrect)
      .setDescription(`You took ${took}ms to react${correct ? `\nand got ${xp}xp!` : `!`}`)
      .setColor(correct ? 0x00ff00 : 0xff0000);

    if (!this.interaction.isButton()) return;

    interaction.client.channels.fetch(interaction.channelId).then((channel) => {
      if (!channel?.isText()) return;
      channel.messages.fetch(interaction.message.id).then((message) => {
        let letters: string[] = [];
        let correctID = 0;

        message.components[0].components.forEach((c, i) => {
          const id = c.customId ?? "";
          if (id.startsWith("REACTT")) {
            correctID = i;
          }
          letters.push(id.charAt(6));
        });

        message.edit({ embeds: [embed], components: [React.generateDisabledRow(correctID, letters)] });
        interaction.reply({content: "\u200b"}).then(() => interaction.deleteReply())
      });
    });

    if (correct) {
      let dbUser = await db.getUser(interaction.user.id);
      let user = new User(dbUser);
      user.giveXP(xp);
      db.saveUser(user);
    }

    let user = this.reactDB.getUser(interaction.user.id);

    user.totalReacts++;
    user.totalScore += xp;
    user.lastReact = Date.now();
    user.totalms += took;

    if (user.last10Reacts.length >= 10) {
      user.last10Reacts.shift();
      user.last10Reacts.push(took);
    } else {
      user.last10Reacts.push(took);
    }

    this.reactDB.saveUser(user);
  }

  private static generateLetter(lettersToExclude: string[] = []) {
    const letters = emojis.letters;
    let letter = {
      letter: "",
      emoji: "",
    };
    while (letter.letter === "" || letter.emoji === "" || lettersToExclude.includes(letter.letter)) {
      letter = letters[Util.randomInt(0, letters.length - 1)];
    }
    return letter;
  }

  private static generateButtons() {
    let buttons: Discord.MessageButton[] = [];

    for (var i = 0; i < config.settings.react.BUTTON_COUNT; i++) {
      let b = new Discord.MessageButton().setStyle(React.generateRandomStyle());
      buttons.push(b);
    }
    return buttons;
  }

  private static generateRandomStyle() {
    const styles: Discord.MessageButtonStyleResolvable[] = ["PRIMARY", "SECONDARY", "DANGER", "SUCCESS"];
    return styles[Util.randomInt(0, styles.length - 1)];
  }

  private static generateButtonCustomId(letter: Letter, ms: number, correct: boolean = false) {
    return `REACT${correct ? "T" : "F"}${letter.letter}${ms}`;
  }

  private static generateRow(correctLetter: Letter, ms: number) {
    let row = new Discord.MessageActionRow();

    let buttons = React.generateButtons();

    let letters = [correctLetter];
    for (var i = 0; i < config.settings.react.BUTTON_COUNT - 1; i++) {
      letters.push(React.generateLetter(letters.map((l) => l.letter)));
    }

    Util.randomizeArray(letters);

    buttons.forEach((b, index) => {
      b.setCustomId(React.generateButtonCustomId(letters[index], ms, letters[index] === correctLetter));
      b.setEmoji(letters[index].emoji);
      row.addComponents(b);
    });

    return row;
  }

  private static generateDisabledRow(correctID: number, letters: string[]) {
    let row = new Discord.MessageActionRow();
    let buttons: Discord.MessageButton[] = [];

    for (var i = 0; i < config.settings.react.BUTTON_COUNT; i++) {
      let b = new Discord.MessageButton().setStyle(i == correctID ? "SUCCESS" : "DANGER");
      b.setEmoji(
        emojis.letters.find((l) => {
          return l.letter == letters[i];
        })?.emoji as string
      );
      b.setCustomId(i.toString());
      buttons.push(b);
      b.setDisabled(true);
    }
    row.addComponents(buttons);
    return row;
  }
}
