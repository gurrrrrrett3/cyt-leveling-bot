import Canvas from "node-canvas";
import fs from "fs";
export default class Profile {
  public userIcon: string | undefined;
  public border: string | undefined;
  public background: string | undefined;
  public username: string | undefined;
  public tagline: string | undefined;
  public bio: string | undefined;
  public serverIcon: string | undefined;
  public levelData:
    | {
        level: number;
        xp: number;
        totalXP: number | undefined;
      }
    | undefined;

  constructor() {}

  public async generate() {
    let canvas = Canvas.createCanvas(500, 500);
    let ctx = canvas.getContext("2d");

    if (this.userIcon) {
      let img = await Canvas.loadImage(this.userIcon);
      ctx.drawImage(img, 32, 32, 64, 64);
    }

    if (this.border) {
      let img = await Canvas.loadImage(this.border);
      ctx.drawImage(img, 0, 0, 64, 64);
    }

    if (this.background) {
      let img = await Canvas.loadImage(this.loadImage("BACKGROUND", this.background));
      ctx.drawImage(img, 0, 0, 500, 500);
    }

    if (this.username) {
      ctx.font = "bold 30px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(this.username, 10, 30);
    }

    if (this.tagline) {
      ctx.font = "bold 20px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(this.tagline, 10, 60);
    }

    if (this.bio) {
      ctx.font = "bold 20px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(this.bio, 10, 90);
    }

    if (this.levelData) {
      ctx.font = "bold 20px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`Level: ${this.levelData.level}`, 10, 120);
      ctx.fillText(`XP: ${this.levelData.xp}`, 10, 150);
      if (this.levelData.totalXP) {
        ctx.fillText(`Total XP: ${this.levelData.totalXP}`, 10, 180);
      }
    }

    return canvas.toBuffer();
  }

  public async setUserIcon(url: string) {
    this.userIcon = url;
    return this;
  }

  public async setBorder(url: string) {
    this.border = url;
    return this;
  }

  public async setBackground(url: string) {
    this.background = url;
    return this;
  }

  public async setUsername(username: string) {
    this.username = username;
    return this;
  }

  public async setTagline(tagline: string) {
    this.tagline = tagline;
    return this;
  }

  public async setBio(bio: string) {
    this.bio = bio;
    return this;
  }

  public async setLevelData(level: number, xp: number, totalXP?: number) {
    this.levelData = {
      level,
      xp,
      totalXP,
    };
    return this;
  }

  public async setServerIcon(url: string) {
    this.serverIcon = url;
    return this;
  }

  public loadImage(type: "BACKGROUND" | "BORDER", name: string) {
    return fs.readFileSync(`./data/images/${type.toLowerCase()}/${name}.png`)
  }
}