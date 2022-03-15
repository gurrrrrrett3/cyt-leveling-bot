import { ReactDatabase, ReactUser } from "./types";
import fs from "fs";
import config from "../config.json";

export default class reactDB {
  private localDBFile: string;

  constructor(localDBFile: string) {
    this.localDBFile = localDBFile;
  }

  public getUser(id: string): ReactUser {
    let db = this.getDB();

    let user = db.find((user) => user.ID === id);

    if (!user) {
      user = {
        ID: id,
        totalReacts: 0,
        totalScore: 0,
        totalms: 0,
        last10Reacts: [],
        lastReact: 0,
      };
    }
    return user;
  }

  public saveUser(user: ReactUser) {
    let db = this.getDB();

    let localUser = db.find((u: ReactUser) => u.ID === user.ID);

    if (!localUser) {
      db.push(user);
    } else {
      db[db.indexOf(localUser)] = user;
    }

    this.saveDB(db);
  }

  public checkIfUserCanUse(id: string): boolean {
    let user = this.getUser(id);

    if (user.lastReact + config.settings.react.COOLDOWN_TIME > Date.now()) {
      return false;
    } else {
      return true;
    }
  }

  public getTimeLeft(id: string): number {
    let user = this.getUser(id);

    let timeLeft = config.settings.react.COOLDOWN_TIME - (Date.now() - user.lastReact);

    return timeLeft;
  }

  public getAverageReactTime(id: string): number {
    let user = this.getUser(id);

    return user.totalms / user.totalReacts;
  }

  public getTopUsers(count: number): ReactUser[] {
    let db = this.getDB();

    let users = db.sort((a, b) => this.getAverageReactTime(a.ID) - this.getAverageReactTime(b.ID));

    return users.slice(0, count);
  }

  private getDB(): ReactDatabase {
    return JSON.parse(fs.readFileSync(this.localDBFile, "utf8")) as ReactDatabase;
  }

  private saveDB(db: ReactDatabase) {
    fs.writeFileSync(this.localDBFile, JSON.stringify(db, null, 4));
  }
}
