import Discord from "discord.js";
import emojis from "../data/emoji.json";
import Database from "./database";
import { Letter } from "./types";
import User from "./user";
import Util from "./util";
import reactDB from "./reactdb";
import lang from "../data/lang.json";
import auth from "../data/auth.json";

export default class React {
  public message: Discord.Message;
  public reactDB = new reactDB(auth.react.file);

  constructor(message: Discord.Message) {
    this.message = message;
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

  public async handle(interaction: Discord.ButtonInteraction, db: Database) {
    let clicked = interaction.customId;
    let correct = clicked.startsWith("REACTT");
    let letter = clicked.charAt(6);
    let ms = parseInt(clicked.substr(7));
    const took = Date.now() - ms;
    let xp =
      took > auth.react.max_react_time
        ? 0
        : Math.round((auth.react.max_react_time - took) / auth.react.ms_per_xp);
    const embed = new Discord.MessageEmbed()
      .setTitle(correct ? lang.react.react_correct : lang.react.react_incorrect)
      .setDescription(`You took ${took}ms to react${correct ? `\nand got ${xp}xp!` : `!`}`)
      .setColor(correct ? 0x00ff00 : 0xff0000);

    this.message.edit({ embeds: [embed], components: [] });

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
    user.totalms += correct ? took : 1e5;

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

    for (var i = 0; i < auth.react.react_button_count; i++) {
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
    for (var i = 0; i < auth.react.react_button_count - 1; i++) {
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
}
