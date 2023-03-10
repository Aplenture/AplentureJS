import { Repository } from "../utils/repository";
import { AccountEntity } from "../entities/accountEntity";

export class AccountRepository extends Repository {
    public async getByID(id: number): Promise<AccountEntity | null> {
        const result = await this.database.query(`SELECT *, FROM_UNIXTIME(\`created\`) as \`created\` FROM ${this.table} WHERE \`id\`=? LIMIT 1`, [
            id
        ]);

        if (!result.length)
            return null;

        return {
            id: result[0].id,
            created: result[0].created / 1000,
            username: result[0].username,
            key: result[0].key
        };
    }

    public async getByName(username: string): Promise<AccountEntity | null> {
        const result = await this.database.query(`SELECT *, FROM_UNIXTIME(\`created\`) as \`created\` FROM ${this.table} WHERE \`username\`=? LIMIT 1`, [
            username
        ]);

        if (!result.length)
            return null;

        return {
            id: result[0].id,
            created: result[0].created / 1000,
            username: result[0].username,
            key: result[0].key
        };
    }

    public async create(username: string, key: string): Promise<AccountEntity | null> {
        const created = Date.now();
        const result = await this.database.query(`INSERT INTO ${this.table} (\`username\`,\`key\`,\`created\`) VALUES (?,?,FROM_UNIXTIME(?))`, [
            username,
            key,
            created / 1000
        ]);

        return {
            id: result.insertId,
            created,
            username,
            key
        };
    }

    public async changePassword(account: number, key: string): Promise<void> {
        await this.database.query(`UPDATE ${this.table} SET \`key\`=? WHERE \`id\`=?`, [
            key,
            account
        ]);
    }
}