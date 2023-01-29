import { expect } from "chai";
import { Singleton } from "../src/utils";

describe("Singleton", () => {
    it("instantiates", () => {
        const singleton = new Singleton(TestClass);

        expect(singleton.instance.constructor.name).equals("TestClass");
        expect(singleton.instance.get).is.a('function');
    });

    it("instantiates with arguments", () => {
        const singleton = new Singleton(TestClass, 1, 2, 3);

        expect(singleton.instance.get(0)).equals(1);
        expect(singleton.instance.get(1)).equals(2);
        expect(singleton.instance.get(2)).equals(3);
    });
    
    it("emits instantiation once", () => {
        const singleton = new Singleton(TestClass, 1, 2, 3);
        
        let counter = 0;
        let emittedInstance: TestClass | null = null;
        
        Singleton.onInstantiated.on(() => counter++);
        Singleton.onInstantiated.on(instance => emittedInstance = instance);

        singleton.instance;
        singleton.instance;

        expect(singleton.instance).equals(emittedInstance);
        expect(counter).equals(1);
    });
});

class TestClass {
    private readonly values: any[];

    constructor(...values: any[]) {
        this.values = values;
    }

    public get(index: number) { return this.values[index]; }
}