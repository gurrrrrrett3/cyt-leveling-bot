export default class User {
  public id: string;
  public level: number;
  public xp: number;
  public total: number;
  public last: number;

  public constructor({ ID, LEVEL, XP, TOTAL, LAST }: { ID: string; LEVEL: number; XP: number; TOTAL: number; LAST: number }) {
    this.id = ID;
    this.level = LEVEL;
    this.xp = XP;
    this.total = TOTAL;
    this.last = LAST;
  }

  public processMessage() {
    //only give xp if the last message was more than a minute ago

    if (Date.now() - this.last > 60000) {
      let xpToGive = this.genXP();
      this.xp += xpToGive;
      this.total += xpToGive;
      this.last = Date.now();
    }

    this.levelUp();
  }

  public export() {
    return [this.level, this.xp, this.total, this.last, this.id];
  }

  public genXPNeeded(level?: number) {

    if (level == undefined) level = this.level;

    //return the amount of xp needed to level up
    return 5 * Math.pow(level, 2) + 50 * level + 100;
  }

  public genTotalXP() {

    //return the user's total xp

    let xp = 0;

    for (let i = 1; i <= this.level; i++) {
      xp += this.genXPNeeded(i);
    }

    return xp;

  }

  private levelUp() {
    if (this.xp >= this.genXPNeeded()) {
      this.xp -= this.genXPNeeded();
      this.level += 1;
    }
  }

  private genXP() {
    //give 15 - 25 xp
    return Math.floor(Math.random() * 10) + 15;
  }
}
