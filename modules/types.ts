export type Command = {
    getCommandData(): CommandData,
    run(args: string[]): Promise<void>
};


export type CommandData = {
    name: string;
    description: string;
    usage: string;
    category: string;
    aliases: string[];
}

export type DatabaseUser = [string, number, number, number, number]
export type LocalDatabaseUser = {
    ID: string;
    XP: number;
    LEVEL: number;
    TOTAL: number;
    LAST: number;
}

export type LocalDatabase = {
    users: LocalDatabaseUser[];
    insert: LocalDatabaseUser[];
    update: LocalDatabaseUser[];
}

