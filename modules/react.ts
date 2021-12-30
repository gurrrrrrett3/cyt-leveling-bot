import Discord from "discord.js";
import emojis from "../data/emoji.json";
import { Letter } from "./types";
import Util from "./util";

export default class React {
  public message: Discord.Message;

  constructor(message: Discord.Message) {
    this.message = message;
  }

  public async generate() {
    let letter = React.generateLetter();

    const embed = new Discord.MessageEmbed()
      .setTitle("Think Fast!")
      .setDescription("Click the button that matches the letter!")
      .addField("Click", letter.letter, true);

    const row = React.generateRow(letter, Date.now());

    return {
      embed,
      row,
    };
  }

  public async handle(clicked: string) {
    let correct = clicked.startsWith("REACTT");
    let letter = clicked.charAt(6);
    let ms = parseInt(clicked.substr(7));
    const took = Date.now() - ms;
    let xp = took > 5000 ? 0 : Math.floor(50 - took / 100);
    const embed = new Discord.MessageEmbed()
      .setTitle(correct ? "Correct!" : "Incorrect!")
      .setDescription(`You took ${took}ms to react${correct ? `\nand got ${xp}xp!` : `!`}`)
      .setColor(correct ? 0x00ff00 : 0xff0000);

      this.message.edit({embeds: [embed], components: []});
  }

  private static generateLetter(lettersToExclude: string[] = []) {
    const letters = emojis.letters;
    let letter = {
        letter: "",
        emoji: "",
    }
    while (letter.letter === "" || letter.emoji === "" || lettersToExclude.includes(letter.letter)) {
        letter = letters[Util.randomInt(0, letters.length - 1)];
    }
    return letter;
  }

  private static generateButtons() {
    let buttons: Discord.MessageButton[] = [];

    for (var i = 0; i < 3; i++) {
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
    letters.push(React.generateLetter([letters[0].letter]));
    letters.push(React.generateLetter([letters[0].letter, letters[1].letter]));

    Util.randomizeArray(letters);

    buttons.forEach((b, index) => {
        b.setCustomId(React.generateButtonCustomId(letters[index], ms, letters[index] === correctLetter));
        b.setEmoji(letters[index].emoji);
      row.addComponents(b);
    });

    return row;
  }
}
