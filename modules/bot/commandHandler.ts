import { RESTPostAPIApplicationCommandsJSONBody, Routes } from "discord-api-types/v9";
import { REST } from "@discordjs/rest";
import Discord, { Collection } from "discord.js";
import fs from "fs";
import path from "path";
import { Command } from "./botTypes";
import config from "../../config.json";
import lang from "../../lang.json";
import Util from "../util";
export default class CommandHandler {
  public client: Discord.Client;
  public commands: Collection<string, Command> = new Collection();

  constructor(client: Discord.Client) {
    this.client = client;

    this.client.once("ready", async () => {
      const applicationId = this.client.application?.id ?? this.client.user?.id ?? "unknown";

      let commandsToDeploy: RESTPostAPIApplicationCommandsJSONBody[] = [];
      const commandFiles = fs
        .readdirSync(path.resolve("./dist/modules/bot/commands"))
        .filter((file) => file.endsWith(".js"));

      console.log(`Deploying ${commandFiles.length} commands`);

      for (const file of commandFiles) {
        const command: Command = require(`./commands/${file}`);
        this.commands.set(command.data.name, command);
        commandsToDeploy.push(command.data);
      }

      const rest = new REST({ version: "9" }).setToken(this.client.token ?? "");

      this.client.application?.commands.set([]);

      rest                                                                             //yes this looks stupid but it's so I can develop on my server
        .put(Routes.applicationGuildCommands(applicationId, this.client.user?.id == "874218421569593364" ? "909808939045113887" : config.settings.general.SERVER_ID), {
          body: commandsToDeploy,
        })
        .then(() => {
          console.log(`${this.commands.size} commands deployed`);
        })
        .catch((err) => {
          console.error(err);
        });
    });

    this.client.on("interactionCreate", (interaction) => {
      if (!interaction.channel) return; // Ignore DM interactions
      if (!interaction.isCommand()) return; // Ignore non-command interactions
      if (interaction.replied) return; // Ignore interactions that have already been replied to

      if (!config.settings.general.ALLOWED_CHANNELS.includes(interaction.channel.id)) {
        interaction.reply({
          embeds: [
            Util.genEmbed(
              lang.general.general_error_embed_title,
              lang.general.general_channel_not_allowed,
              0xff0000
            ),
          ],
          ephemeral: true,
        });
        return;
      }

      const command = this.commands.get(interaction.commandName);
      console.log(`Executing command ${command?.data.name}`);
      command?.execute(interaction);
    });
  }
}
