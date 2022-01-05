import fs from "fs";
import Database from "./database";
import User from "./user";

export default async function onFirstRun(db: Database): Promise<void> {
  let localDB = JSON.parse(fs.readFileSync("./data/localdb.json").toString());

  if (localDB.firstRun == undefined || localDB.firstRun == true) {
    localDB.firstRun = false;

    console.log("First run detected, fixing code that I fucked up :(");

    fs.writeFileSync("./data/localdb.json", JSON.stringify(localDB));

    //Fix issues caused by old pushes
    //Luke

    let luke = await db.getUser("176413006245134337")
    luke.LEVEL = 8
    luke.XP = 754
    luke.TOTAL = 3554

    db.saveUser(new User(luke))

    //Lucy

    let lucy = await db.getUser("334011089232592906")
    lucy.LEVEL = 11
    lucy.XP = 739
    lucy.TOTAL = 6414

    db.saveUser(new User(lucy))

    //Garrett

    let garrett = await db.getUser("232510731067588608")
    garrett.LEVEL = 13
    garrett.XP = 95
    garrett.TOTAL = 8445

    db.saveUser(new User(garrett))
}
}
