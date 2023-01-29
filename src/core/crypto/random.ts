import { fromHex, toHex } from "../other/bigMath";

const BASE58: readonly string[] = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
]

export const random = (function () {
    try {
        const crypto = eval("window.crypto");

        return function (bytes = 32): bigint {
            if (bytes < 1)
                throw new RangeError(`bytes must be > 0`);

            return fromHex(crypto.getRandomValues(new Uint8Array(bytes)).reduce((o, v) => o + ('00' + v.toString(16)).slice(-2), ''));
        }
    } catch (e) { }

    try {
        const crypto = eval("require('crypto')");

        return function (bytes = 32): bigint {
            if (bytes < 1)
                throw new RangeError(`bytes must be > 0`);

            return fromHex(crypto.randomBytes(bytes).toString('hex'));
        }
    } catch (e) { }

    return function (): bigint {
        throw new Error(`random is not supported`);
    }
})();

export function randomHex(bytes = 32): string {
    return toHex(random(bytes));
}

/*!
 * mulberry32 seeded pseudo random function
 * https://github.com/bryc/code/blob/master/jshash/PRNGs.md#mulberry32
 */
export function randomSeeded(seed: number): number {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

export function randomRanged(max: number, min = 0, seed = Number(random(4))): number {
    return min + Math.floor(randomSeeded(seed) * (max - min + 1));
}

/**
 * Shuffles array in place
 * inspired by https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
 * @param {Array} items items An array containing the items.
 */
export function shuffle<T>(items: readonly T[], seed = Number(random(4))): T[] {
    const result = Object.assign([], items);

    for (let i = items.length - 1; i > 0; --i) {
        const j = randomRanged(i, 0, seed + i);

        [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
}

export function randomPassword(blocks = 3, blocksize = 6): string {
    let result = '';

    for (let i = 0; i < blocks; ++i) {
        if (result.length)
            result += '-';

        for (let j = 0; j < blocksize; ++j)
            result += BASE58[randomRanged(BASE58.length)];
    }

    return result;
}