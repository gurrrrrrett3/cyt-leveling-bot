import Dicord from 'discord.js';
import ButtonHandler from './buttonHandler';
import CommandHandler from './commandHandler';
export default class Bot {
    public Client: Dicord.Client;
    public CommandHandler: CommandHandler;
    public buttonHandler: ButtonHandler;

    constructor(client: Dicord.Client) {
        this.Client = client;
        this.CommandHandler = new CommandHandler(client);
        this.buttonHandler = new ButtonHandler(client);
    }
    
}