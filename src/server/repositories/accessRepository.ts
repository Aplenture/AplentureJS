import { random } from "../../core/crypto/random";
import { toHex } from "../../core/other/bigMath";
import { AccessEntity } from "../entities/accessEntity";
import { Repository } from "../utils/repository";

export class AccessRepository extends Repository {
    public async hasAccess(api: string): Promise<boolean> {
        const result = await this.database.query(`SELECT UNIX_TIMESTAMP(\`expiration\`) FROM ${this.table} WHERE \`api\`=?`, [api]);

        if (!result.length)
            return false;

        const now = Date.now();
        const expiration = result[0].expiration * 1000;

        if (expiration <= now)
            return false;

        return true;
    }

    public async getByAPI(api: string): Promise<AccessEntity | null> {
        const result = await this.database.query(`SELECT *, UNIX_TIMESTAMP(\`created\`) as \`created\`, UNIX_TIMESTAMP(\`expiration\`) as \`expiration\` FROM ${this.table} WHERE \`api\`=? LIMIT 1`, [api]);

        if (!result.length)
            return null;

        return {
            id: result[0].id,
            created: result[0].created * 1000,
            expiration: result[0].expiration * 1000,
            account: result[0].account,
            api: result[0].api,
            secret: result[0].secret,
            label: result[0].label
        };
    }

    public async create(account: number, label: string, expirationDuration?: number): Promise<AccessEntity> {
        const api = toHex(random(32));
        const secret = toHex(random(32));
        const created = Date.now();
        const expiration = expirationDuration
            ? created + expirationDuration
            : undefined;

        const keys = ['`created`', '`account`', '`api`', '`secret`', '`label`'];
        const values = ['FROM_UNIXTIME(?)', '?', '?', '?', '?'];

        const args = [
            created / 1000,
            account,
            api,
            secret,
            label
        ];

        if (expiration) {
            keys.push('`expiration`');
            values.push('FROM_UNIXTIME(?)');
            args.push(expiration / 1000);
        }

        const result = await this.database.query(`INSERT INTO ${this.table} (${keys.join(',')}) VALUES (${values.join(',')})`, args);

        return {
            id: result.insertId,
            created,
            account,
            api,
            secret,
            expiration,
            label
        };
    }

    public async delete(id: number): Promise<void> {
        await this.database.query(`DELETE FROM ${this.table} WHERE \`id\`=?`, [id]);
    }
}