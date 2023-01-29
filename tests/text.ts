import { expect } from "chai";
import { parseToBool, parseToNumber, parseToString, parseToTime, parseToJSON, toFirstUpperCase, parseArgs } from "../src/other/text"

describe("Text", () => {
    describe("Parse Time", () => {
        it("parses text", () => expect(parseToTime("2020-01-01 13:37")).equals(1577882220000));
        it("parses number", () => expect(parseToTime(1577882220000)).equals(1577882220000));
        it("catches wrong format", () => expect(() => parseToTime("hello world")).throw(Error));
        it("catches undefined", () => expect(() => parseToTime(undefined)).throw(Error));
    });

    describe("Parse String", () => {
        it("parses text", () => expect(parseToString("8")).equals("8"));
        it("parses number", () => expect(parseToString(8)).equals("8"));

        it("parses true", () => expect(parseToString(true)).equals("true"));
        it("parses false", () => expect(parseToString(false)).equals("false"));

        it("catches undefined", () => expect(() => parseToString(undefined)).throw(Error));
        it("catches empty", () => expect(() => parseToString('')).throw(Error));
    });

    describe("Parse Number", () => {
        it("parses text number", () => expect(parseToNumber("8")).equals(8));
        it("catches text", () => expect(() => parseToNumber("hello world")).throw(Error));
        it("catches undefined", () => expect(() => parseToNumber(undefined)).throw(Error));
    });

    describe("Parse Bool", () => {
        it("parses 'true' to true", () => expect(parseToBool("true")).true);
        it("parses 'false' to false", () => expect(parseToBool("false")).false);
        it("parses text to true", () => expect(parseToBool("hello world")).true);

        it("parses a positive number to true", () => expect(parseToBool(7)).true);
        it("parses a negative number to true", () => expect(parseToBool(-7)).true);
        it("parses zero to false", () => expect(parseToBool(0)).false);

        it("catches undefined", () => expect(() => parseToBool(undefined)).throw(Error));
    });

    describe("Parse JSON", () => {
        const def = { hello: "world" };

        it("parses object", () => expect(parseToJSON('{"hello":"world"}')).deep.equal(def));
        it("returns default by error", () => expect(parseToJSON('hello world', def)).deep.equal(def));
    });

    describe("Upper first case", () => {
        it("parses lower case", () => expect(toFirstUpperCase('hello')).equals('Hello'));
        it("parses upper case", () => expect(toFirstUpperCase('WORLD')).equals('World'));
    });

    describe("parse args", () => {
        it("parses single word", () => expect(parseArgs("--hello world")).deep.contains({ hello: 'world' }));
        it("parses sentence", () => expect(parseArgs("--sentence hello world")).deep.contains({ sentence: 'hello world' }));
        it("parses true", () => expect(parseArgs("--trueValue")).deep.contains({ trueValue: '1' }));
        it("parses false", () => expect(parseArgs("--falseValue 0")).deep.contains({ falseValue: '0' }));
        it("parses array", () => expect(parseArgs("--arrayValue one --arrayValue 2 --arrayValue")).deep.contains({ arrayValue: ['one', '2', '1'] }));
        it("parses multiple args", () => expect(parseArgs("command --simple hello --text hello world --true --false 0 --array 1 --array 2")).deep.contains({
            command: '1',
            simple: 'hello',
            text: "hello world",
            true: '1',
            false: '0',
            array: ['1', '2']
        }));
    });
});