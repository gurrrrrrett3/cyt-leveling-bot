import Discord from 'discord.js';
import mariadb from 'mariadb';

import auth from './data/auth.json';
import Bot from './modules/bot';

const pool = mariadb.createPool({
    host: auth.database.host,
    user: auth.database.user,
    password: auth.database.password,
    })

    pool.getConnection().then(conn => {
     
        console.log("Connected to database");
        
        conn.query("use USERS").then(rows => {
            console.log("Using database USERS");
        }).catch(err => {
            console.log("USERS database not found, creating it");
            conn.query("create database USERS").then(rows => {
                console.log("Created database USERS");
            })
        }).then(() => {
            conn.query("create table USERS_TABLE (ID CHAR(18) not null primary key, LEVEL int not null, XP int not null, TOTAL int not null, LAST bigint not null)").then(rows => {
                console.log(rows);
            }).catch(err => {
                console.log("USERS_TABLE exists, not creating it")
            })
            .then(() => {

                //Log in to discord

                console.log("Database connection initialized, logging in to discord");

                const Client = new Discord.Client({intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_MESSAGE_REACTIONS', 'GUILD_MESSAGE_TYPING', 'DIRECT_MESSAGES']});

                Client.login(auth.discord.token);

                Client.once('ready', () => {

                    console.log(`Logged in as ${Client.user?.tag}`);

                    Client.user?.setActivity("on CYT | craftyour.town | !help" , {type: "PLAYING"});

                    //Initialize the bot
                    
                    const bot = new Bot(Client, conn);

                });

                

            })
        })
    }).catch(err => {
        console.log(`Error connecting to database. Please check your credentials.`);
        console.error(err);
        process.exit(-1);
});

