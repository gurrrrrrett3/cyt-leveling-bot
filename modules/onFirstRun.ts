import fs from "fs";
import Database from "./database";
import User from "./user";

export default async function onFirstRun(db: Database): Promise<void> {
  let localDB = JSON.parse(fs.readFileSync("./data/localdb.json").toString());

  if (localDB.firstRun == undefined || localDB.firstRun == true) {
    localDB.firstRun = false;

    console.log("First run detected, fixing code that I fucked up :(");

    fs.writeFileSync("./data/localdb.json", JSON.stringify(localDB));
  }  
}
