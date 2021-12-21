import mariadb from "mariadb";
import fs from "fs";
import { DatabaseUser, LocalDatabase, LocalDatabaseUser } from "./types";

const localDataFile = "./data/localdb.json";

export default class Database {
  private pool: mariadb.Pool;
  //@ts-ignore
  private conn: mariadb.PoolConnection;

  constructor(Data: { host: string; user: string; password: string }) {
    this.pool = mariadb.createPool({
      host: Data.host,
      user: Data.user,
      password: Data.password,
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
          .query("use USERS")
          .then((rows) => {
            console.log("Using database USERS");
          })
          .catch((err) => {
            console.log("USERS database not found, creating it");
            this.conn.query("create database USERS").then((rows) => {
              console.log("Created database USERS");
            });
          })
          .then(() => {
            this.conn
              .query(
                "create table USERS_TABLE (ID CHAR(18) not null primary key, LEVEL int not null, XP int not null, TOTAL int not null, LAST bigint not null)"
              )
              .then((rows) => {
                console.log(rows);
              })
              .catch((err) => {
                console.log("USERS_TABLE exists, not creating it");
              });

            //add the local data to the database in case of a crash

            let data = this.getLocalDB();
            if (data.insert.length > 0) {
              this.massInsert(data.insert);
              data.insert = [];
              console.log("Inserted local data into database");
            }

            if (data.update.length > 0) {
              this.massUpdate(data.update);
              data.update = [];
              console.log("Updated local data into database");
            }

            this.saveLocalDB(data);

            return;
          });
      });
  }

  public async getUser(ID: string) {
    let user = this.getUserFromLocalDB(ID);

    //if the user is not in the local database, get it from the database

    if (!user) {
      const dbUser = await this.getUserfromDatabase(ID);

      if (dbUser) {
        this.addUserToUpdate(dbUser);
        user = dbUser
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

  private getUserFromLocalDB(ID: string) {
    let data = this.getLocalDB();

    let user = data.users.find((user: LocalDatabaseUser) => user.ID === ID);

    return user;
  }

  private async getUserfromDatabase(ID: string) {
    const rows = await this.conn.query("SELECT * FROM USERS_TABLE WHERE ID = ?", ID);
    return rows[0];
    }

  private convertToDatabaseUser(user: LocalDatabaseUser): DatabaseUser {
    return [user.ID, user.LEVEL, user.XP, user.TOTAL, user.LAST];
  }

  private convertToDatabaseUserUpdate(user: LocalDatabaseUser) {
    return [user.LEVEL, user.XP, user.TOTAL, user.LAST, user.ID];
  }

  private convertToLocalDatabaseUser(user: DatabaseUser): LocalDatabaseUser {
    return {
      ID: user[0],
      LEVEL: user[1],
      XP: user[2],
      TOTAL: user[3],
      LAST: user[4],
    };
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

    this.conn
      .batch("insert into USERS_TABLE (ID, LEVEL, XP, TOTAL, LAST) values (?, ?, ?, ?, ?)", newData)
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

    this.conn
      .batch("update USERS_TABLE set LEVEL = ?, XP = ?, TOTAL = ? , LAST = ? where ID = ?", newData)
      .catch((err) => {
        console.log("Error updating database");
        console.error(err);
      });
  }
}
