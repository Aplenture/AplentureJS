import * as MySQL from "mariadb";
import * as fs from "fs";
import { Event } from "../../core/utils/event";
import { DatabaseConfig } from "../models/databaseConfig";
import { Stopwatch } from "../../core/utils/stopwatch";
import { formatDuration } from "../../core/other/time";
import { decodeString, encodeString } from "../../core/other/text";

type Type = string | number
type Entry = NodeJS.ReadOnlyDict<any>;

const DIRECTORY_UPDATE = 'database';

export class Database {
    public readonly onMessage = new Event<Database, string>('Database.onMessage');

    private pool: MySQL.Pool;

    constructor(
        public readonly name: string,
        private readonly config: DatabaseConfig
    ) { }

    public static async create(config: DatabaseConfig): Promise<void> {
        const connection = await MySQL.createConnection({
            host: config.host,
            user: config.user,
            password: config.password
        });

        return connection.query(`CREATE DATABASE IF NOT EXISTS ${config.database}`)
            .then(() => connection.end())
            .catch(() => connection.end());
    }

    public static async drop(config: DatabaseConfig): Promise<void> {
        const connection = await MySQL.createConnection({
            host: config.host,
            user: config.user,
            password: config.password
        });

        return connection.query(`DROP DATABASE IF EXISTS ${config.database}`)
            .then(() => connection.end())
            .catch(() => connection.end());
    }

    public static async reset(config: DatabaseConfig): Promise<void> {
        await this.drop(config);
        await this.create(config);
    }

    public async init(): Promise<void> {
        if (this.pool)
            throw new Error(`Database is already initialized`);

        this.pool = await MySQL.createPool(this.config);
    }

    public async close(): Promise<void> {
        if (!this.pool)
            throw new Error(`Database is not initialized.`);

        await this.pool.end();

        this.pool = null;
    }

    public async update(directory?: string): Promise<void> {
        const updatePath = `${process.env.PWD}/${directory || DIRECTORY_UPDATE}/${this.name}`;

        await this.query(`CREATE TABLE IF NOT EXISTS \`updates\` (
            \`id\` BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
            \`time\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            \`path\` TEXT NOT NULL
            ) DEFAULT CHARSET=utf8`);

        const folders = fs.readdirSync(updatePath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)
            .sort((a, b) => {
                if (a < b) return -1;
                if (a > b) return 1;

                return 0;
            });

        for (let i = 0; i < folders.length; ++i) {
            const folder = folders[i];
            const files = fs.readdirSync(`${updatePath}/${folder}`);

            for (let j = 0; j < files.length; ++j) {
                const file = files[j];
                const update = `${folder}/${file}`;
                const filePath = `${updatePath}/${update}`;
                const query = fs
                    .readFileSync(filePath)
                    .toString();

                const executedUpdates = await this.query(`SELECT * FROM \`updates\` WHERE \`path\`=?`, [update]);

                if (executedUpdates.length) {
                    this.onMessage.emit(this, `skip update '${update}' (already executed)`);
                    continue;
                }

                this.onMessage.emit(this, `execute update '${update}'`);

                await this.query(query);
                await this.query(`INSERT INTO \`updates\` (\`path\`) VALUES (?)`, [update]);
            }
        }
    }

    public async query(query: string, values: readonly Type[] = []): Promise<any> {
        const stopwatch = new Stopwatch();

        stopwatch.start();

        query = Database.escapeQuery(query, values);

        const connection = await this.pool.getConnection();

        try {
            const result = await connection.query({
                sql: query,
                insertIdAsNumber: true,
                checkDuplicate: false,
                decimalAsNumber: true,
                bigIntAsNumber: true
            });

            stopwatch.stop();
            connection.release();

            if (Array.isArray(result))
                result.forEach(entry => Database.decodeEntry(entry));

            this.onMessage.emit(this, `executed ${query} in ${formatDuration(stopwatch.duration, { seconds: true, milliseconds: true })}`);

            return result;
        } catch (error) {
            stopwatch.stop();
            connection.release();

            this.onMessage.emit(this, error.message);

            throw error;
        }
    }

    public fetch(query: string, callback: (result: Entry, index: number) => Promise<any>, values: readonly Type[] = []): Promise<void> {
        const stopwatch = new Stopwatch();

        stopwatch.start();

        query = Database.escapeQuery(query, values);

        let index = 0;

        return new Promise<void>(async (resolve, reject) => {
            const connection = await this.pool.getConnection();
            const stream = connection.queryStream({
                sql: query,
                insertIdAsNumber: true,
                checkDuplicate: false,
                decimalAsNumber: true,
                bigIntAsNumber: true
            });

            stream.on("error", error => {
                connection.release();
                this.onMessage.emit(this, error.message);
                reject(error);
            });

            stream.on("end", () => {
                stopwatch.stop();
                connection.release();
                resolve();
                this.onMessage.emit(this, `fetched ${query} in ${formatDuration(stopwatch.duration, { seconds: true, milliseconds: true })}`);
            });

            stream.on("data", async entry => {
                try {
                    stream.pause();

                    Database.decodeEntry(entry);

                    await callback(entry as any, index++);

                    stream.resume();
                } catch (error) {
                    stream.destroy(error);
                }
            });
        });
    }

    private static escapeQuery(query: string, values: readonly Type[]): string {
        let result = query;

        values.forEach(value => result = result.replace('?', typeof value === 'string' ? "'" + encodeString(value) + "'" : value.toString()))

        return result;
    }

    private static decodeEntry(entry: Entry): void {
        Object.keys(entry).forEach(key => (entry[key] as any) = typeof entry[key] === 'string' ? decodeString(entry[key] as string) : entry[key]);
    }
}