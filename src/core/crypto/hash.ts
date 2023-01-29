import { fromHex } from "../other/bigMath";

export type Hash = string;
export type HashInt = bigint;

/*!
 * Crypto-JS v2.5.4	SHA256.js
 * http://code.google.com/p/crypto-js/
 * Copyright (c) 2009-2013, Jeff Mott. All rights reserved.
 * http://code.google.com/p/crypto-js/wiki/License
 */
export const sha256 = (function () {
    // Global Crypto object
    const Crypto: any = {};

    const base64map = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    // Crypto utilities
    const util = Crypto.util = {

        // Bit-wise rotate left
        rotl: function (n, b) {
            return (n << b) | (n >>> (32 - b));
        },

        // Bit-wise rotate right
        rotr: function (n, b) {
            return (n << (32 - b)) | (n >>> b);
        },

        // Swap big-endian to little-endian and vice versa
        endian: function (n) {

            // If number given, swap endian
            if (n.constructor == Number) {
                return util.rotl(n, 8) & 0x00FF00FF |
                    util.rotl(n, 24) & 0xFF00FF00;
            }

            // Else, assume array and swap all items
            for (let i = 0; i < n.length; i++)
                n[i] = util.endian(n[i]);
            return n;

        },

        // Generate an array of any length of random bytes
        randomBytes: function (n) {
            let bytes = [];

            for (; n > 0; n--)
                bytes.push(Math.floor(Math.random() * 256));

            return bytes;
        },

        // Convert a byte array to big-endian 32-bit words
        bytesToWords: function (bytes) {
            let words = [];

            for (let i = 0, b = 0; i < bytes.length; i++, b += 8)
                words[b >>> 5] |= (bytes[i] & 0xFF) << (24 - b % 32);

            return words;
        },

        // Convert big-endian 32-bit words to a byte array
        wordsToBytes: function (words) {
            let bytes = [];

            for (let b = 0; b < words.length * 32; b += 8)
                bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);

            return bytes;
        },

        // Convert a byte array to a hex string
        bytesToHex: function (bytes) {
            let hex = [];

            for (let i = 0; i < bytes.length; i++) {
                hex.push((bytes[i] >>> 4).toString(16));
                hex.push((bytes[i] & 0xF).toString(16));
            }

            return hex.join("");
        },

        // Convert a hex string to a byte array
        hexToBytes: function (hex) {
            let bytes = [];

            for (let c = 0; c < hex.length; c += 2)
                bytes.push(parseInt(hex.substr(c, 2), 16));

            return bytes;
        },

        // Convert a byte array to a base-64 string
        bytesToBase64: function (bytes) {
            let base64 = [];

            for (let i = 0; i < bytes.length; i += 3) {
                let triplet = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
                for (let j = 0; j < 4; j++) {
                    if (i * 8 + j * 6 <= bytes.length * 8)
                        base64.push(base64map.charAt((triplet >>> 6 * (3 - j)) & 0x3F));
                    else base64.push("=");
                }
            }

            return base64.join("");
        },

        // Convert a base-64 string to a byte array
        base64ToBytes: function (base64) {
            // Remove non-base-64 characters
            base64 = base64.replace(/[^A-Z0-9+\/]/ig, "");

            let bytes = [];

            for (let i = 0, imod4 = 0; i < base64.length; imod4 = ++i % 4) {
                if (imod4 == 0) continue;
                bytes.push(((base64map.indexOf(base64.charAt(i - 1)) & (Math.pow(2, -2 * imod4 + 8) - 1)) << (imod4 * 2)) |
                    (base64map.indexOf(base64.charAt(i)) >>> (6 - imod4 * 2)));
            }

            return bytes;
        }

    };

    // Crypto character encodings
    let charenc: any = Crypto.charenc = {};

    // UTF-8 encoding
    let UTF8 = charenc.UTF8 = {

        // Convert a string to a byte array
        stringToBytes: function (str) {
            return Binary.stringToBytes(unescape(encodeURIComponent(str)));
        },

        // Convert a byte array to a string
        bytesToString: function (bytes) {
            return decodeURIComponent(escape(Binary.bytesToString(bytes)));
        }

    };

    // Binary encoding
    let Binary = charenc.Binary = {

        // Convert a string to a byte array
        stringToBytes: function (str) {
            let bytes = [];

            for (let i = 0; i < str.length; i++)
                bytes.push(str.charCodeAt(i) & 0xFF);

            return bytes;
        },

        // Convert a byte array to a string
        bytesToString: function (bytes) {
            let str = [];

            for (let i = 0; i < bytes.length; i++)
                str.push(String.fromCharCode(bytes[i]));

            return str.join("");
        }

    };

    // Constants
    let K = [0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5,
        0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
        0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3,
        0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174,
        0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC,
        0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
        0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7,
        0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967,
        0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13,
        0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85,
        0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3,
        0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
        0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5,
        0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
        0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208,
        0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2];

    // Public API
    let SHA256: any = Crypto.SHA256 = function (message, options) {
        let digestbytes = util.wordsToBytes(SHA256._sha256(message));
        return options && options.asBytes ? digestbytes :
            options && options.asString ? Binary.bytesToString(digestbytes) :
                util.bytesToHex(digestbytes);
    };

    // The core
    SHA256._sha256 = function (message) {

        // Convert to byte array
        if (message.constructor == String) message = UTF8.stringToBytes(message);
        /* else, assume byte array already */

        let m = util.bytesToWords(message),
            l = message.length * 8,
            H = [0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A,
                0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19],
            w = [],
            a, b, c, d, e, f, g, h, i, j,
            t1, t2;

        // Padding
        m[l >> 5] |= 0x80 << (24 - l % 32);
        m[((l + 64 >> 9) << 4) + 15] = l;

        for (let i = 0; i < m.length; i += 16) {

            a = H[0];
            b = H[1];
            c = H[2];
            d = H[3];
            e = H[4];
            f = H[5];
            g = H[6];
            h = H[7];

            for (let j = 0; j < 64; j++) {

                if (j < 16) w[j] = m[j + i];
                else {

                    let gamma0x = w[j - 15],
                        gamma1x = w[j - 2],
                        gamma0 = ((gamma0x << 25) | (gamma0x >>> 7)) ^
                            ((gamma0x << 14) | (gamma0x >>> 18)) ^
                            (gamma0x >>> 3),
                        gamma1 = ((gamma1x << 15) | (gamma1x >>> 17)) ^
                            ((gamma1x << 13) | (gamma1x >>> 19)) ^
                            (gamma1x >>> 10);

                    w[j] = gamma0 + (w[j - 7] >>> 0) +
                        gamma1 + (w[j - 16] >>> 0);

                }

                let ch = e & f ^ ~e & g,
                    maj = a & b ^ a & c ^ b & c,
                    sigma0 = ((a << 30) | (a >>> 2)) ^
                        ((a << 19) | (a >>> 13)) ^
                        ((a << 10) | (a >>> 22)),
                    sigma1 = ((e << 26) | (e >>> 6)) ^
                        ((e << 21) | (e >>> 11)) ^
                        ((e << 7) | (e >>> 25));


                t1 = (h >>> 0) + sigma1 + ch + (K[j]) + (w[j] >>> 0);
                t2 = sigma0 + maj;

                h = g;
                g = f;
                f = e;
                e = (d + t1) >>> 0;
                d = c;
                c = b;
                b = a;
                a = (t1 + t2) >>> 0;

            }

            H[0] += a;
            H[1] += b;
            H[2] += c;
            H[3] += d;
            H[4] += e;
            H[5] += f;
            H[6] += g;
            H[7] += h;

        }

        return H;

    };

    // Package private blocksize
    SHA256._blocksize = 16;

    SHA256._digestsize = 32;

    return Crypto.SHA256 as (text: string) => Hash;
})();

export const toHash = sha256;

export function toHashInt(value: string): HashInt {
    return fromHex(toHash(value));
}

export function createSign(message: string, secret: string): string {
    return toHash(message + secret);
}