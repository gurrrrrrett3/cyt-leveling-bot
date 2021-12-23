import mariadb from "mariadb";
import fs from "fs";
import { DatabaseUser, LocalDatabase, LocalDatabaseUser } from "./types";
import Util from "./util";
import auth from "../data/auth.json";
import User from "./user";

const localDataFile = "./data/localdb.json";

export default class Database {
  private pool: mariadb.Pool;
  //@ts-ignore
  private conn: mariadb.PoolConnection;
  private nextUpdate: number = Date.now() + Util.minutesToMilliseconds(auth.database.db_update_interval_minutes);
  private lastUpdate = Date.now();
  private databaseQueryCount = 0;

  constructor(Data: { host: string; port: number; user: string; password: string }) {
    this.pool = mariadb.createPool({
      host: Data.host,
      port: Data.port,
      user: Data.user,
      password: Data.password,
      ssl: false
    });
  }

  public async Connect() {
    await this.pool
      .getConnection()
      .catch((err) => {
        console.log("Error connecting to database. Please check your credentials.");
        console.error(err);
        process.exit(-1);
      })
      .then((conn) => {
        this.conn = conn;
        this.conn
          .query(`use ${auth.database.name}`)
          .then((rows) => {
            console.log(`Using database ${auth.database.name}`);
          })
          .catch((err) => {
            console.log(`${auth.database.name} database not found, creating it`);
            this.conn.query(`create database ${auth.database.name}`).then((rows) => {
              console.log(`Created database ${auth.database.name}`);
            });
          })
          .then(() => {
            this.databaseQueryCount++;
            this.conn
              .query(
                `create table ${auth.database.table} (ID CHAR(18) not null primary key, LEVEL int not null, XP int not null, TOTAL int not null, LAST bigint not null)`
              )
              .then((rows) => {
                console.log(rows);
              })
              .catch((err) => {
                console.log(`${auth.database.table} exists, not creating it`);
              });

            //add the local data to the database in case of a crash

            let data = this.getLocalDB();
            if (data.insert.length > 0) {
              this.massInsert(data.insert);
              data.insert = [];
            }

            if (data.update.length > 0) {
              this.massUpdate(data.update);
              data.update = [];
            }

            this.saveLocalDB(data);

            return;
          });
      });

    //start update check interval
    setInterval(() => {
      if (this.nextUpdate <= Date.now()) {
        this.pushLocalData();
        this.databaseQueryCount = 0;
      }
    }, 60000);
  }

  public async getUser(ID: string) {
    let user = this.getUserFromLocalDB(ID);

    //if the user is not in the local database, get it from the database

    if (!user) {
      const dbUser = await this.getUserfromDatabase(ID);

      if (dbUser) {
        this.addUserToUpdate(dbUser);
        user = dbUser;
      } else {
        //if the user is not in the database, create it
        console.log(`Could not find user ${ID} in either database, creating it`);
        const newUser = this.newUser(ID);
        this.addUserToInsert(newUser);
        user = newUser;
      }
    }
    return user;
  }

  public saveUser(user: User) {
    let data = this.getLocalDB();

    let localUser = data.users.find((u: LocalDatabaseUser) => u.ID === user.id);

    if (!localUser) {
      data.users.push(user.export());
    } else {
      data.users[data.users.indexOf(localUser)] = user.export();
    }

    let localUpdateUser = data.update.find((u: LocalDatabaseUser) => u.ID === user.id);

    if (!localUpdateUser) {
      data.update.push(user.export());
    } else {
      data.update[data.update.indexOf(localUpdateUser)] = user.export();
    }

    this.saveLocalDB(data);
  }

  public async getTop(amount: number) {
    let rows: any[] = await this.conn.query(`select * from ${auth.database.table} order by TOTAL desc limit ?`, [
      amount,
    ]);
    this.databaseQueryCount++;
    let users: LocalDatabaseUser[] = [];

    rows.forEach((row: any, index: number) => {
      if (index < amount) {
        users.push(row);
      }
    });

    users.forEach((user: LocalDatabaseUser) => {

        const newUser = new User(user)

        this.saveUser(newUser);

    })

    //sort local users by total
    const data = this.getLocalDB();
    
    data.users.sort((a: LocalDatabaseUser, b: LocalDatabaseUser) => {

        return b.TOTAL - a.TOTAL;

        })

        //return the first amount of users

    return data.users.slice(0, amount);
  }

  public getDatabaseStats() {
    return {
      databaseQueryCount: this.databaseQueryCount,
      lastUpdate: Math.round(this.lastUpdate / 1000),
      nextUpdate: Math.round(this.nextUpdate / 1000),
      localUsers: this.getLocalDB().users.length,
      localInsert: this.getLocalDB().insert.length,
      localUpdate: this.getLocalDB().update.length,
    };
  }

  private getUserFromLocalDB(ID: string) {
    let data = this.getLocalDB();

    let user = data.users.find((user: LocalDatabaseUser) => user.ID === ID);

    return user;
  }

  private async getUserfromDatabase(ID: string) {
    const rows = await this.conn.query(`SELECT * FROM ${auth.database.table} WHERE ID = ?`, ID);
    this.databaseQueryCount++;
    return rows[0];
  }

  private convertToDatabaseUser(user: LocalDatabaseUser): DatabaseUser {
    return [user.ID, user.LEVEL, user.XP, user.TOTAL, user.LAST];
  }

  private convertToDatabaseUserUpdate(user: LocalDatabaseUser) {
    return [user.LEVEL, user.XP, user.TOTAL, user.LAST, user.ID];
  }

  private newUser(ID: string) {
    return {
      ID: ID,
      LEVEL: 1,
      XP: 0,
      TOTAL: 0,
      LAST: Date.now(),
    };
  }

  private addUserToInsert(user: LocalDatabaseUser) {
    let data = this.getLocalDB();

    data.insert.push(user);
    data.users.push(user);

    this.saveLocalDB(data);
  }

  private addUserToUpdate(user: LocalDatabaseUser) {
    let data = this.getLocalDB();

    let localUser = data.update.find((localUser: LocalDatabaseUser) => localUser.ID === user.ID);

    if (!localUser) {
      data.update.push(user);
    } else {
      const index = data.update.findIndex((localUser: LocalDatabaseUser) => localUser.ID === user.ID);
      data.update[index] = user;
    }

    localUser = data.users.find((localUser: LocalDatabaseUser) => localUser.ID === user.ID);

    if (!localUser) {
      data.users.push(user);
    } else {
      const index = data.users.findIndex((localUser: LocalDatabaseUser) => localUser.ID === user.ID);
      data.users[index] = user;
    }

    this.saveLocalDB(data);
  }

  private getLocalDB(): LocalDatabase {
    return JSON.parse(fs.readFileSync(localDataFile, "utf8"));
  }

  private saveLocalDB(data: LocalDatabase) {
    fs.writeFileSync(localDataFile, JSON.stringify(data, null, 4));
  }

  private async massInsert(data: LocalDatabaseUser[]) {
    let newData: any = [];

    data.forEach((user: LocalDatabaseUser) => {
      newData.push(this.convertToDatabaseUser(user));
    });

    this.databaseQueryCount++;
    this.conn
      .batch(`insert into ${auth.database.table} (ID, LEVEL, XP, TOTAL, LAST) values (?, ?, ?, ?, ?)`, newData)
      .catch((err) => {
        console.log("Error inserting users into database");
        console.error(err);
      });
  }

  private async massUpdate(data: LocalDatabaseUser[]) {
    let newData: any = [];

    data.forEach((user: LocalDatabaseUser) => {
      newData.push(this.convertToDatabaseUserUpdate(user));
    });

    this.databaseQueryCount++;
    this.conn
      .batch(`update ${auth.database.table} set LEVEL = ?, XP = ?, TOTAL = ? , LAST = ? where ID = ?`, newData)
      .catch((err) => {
        console.log("Error updating database");
        console.error(err);
      });
  }

  private async pushLocalData() {
    const data = this.getLocalDB();

    if (data.insert.length > 0) {
      this.massInsert(data.insert);
      data.insert = [];
    }

    if (data.update.length > 0) {
      this.massUpdate(data.update);
      data.update = [];
    }

    this.saveLocalDB(data);

    this.setUpdateTime();
  }

  private setUpdateTime() {
    this.nextUpdate = Date.now() + Util.minutesToMilliseconds(auth.database.db_update_interval_minutes);
  }
}
