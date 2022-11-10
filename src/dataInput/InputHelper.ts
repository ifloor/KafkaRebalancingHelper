import readline, {Interface} from "readline";

export class InputHelper {
    private static instance: InputHelper | null = null;
    private readonly readlineInterface: Interface;

    private constructor() {
        // readline
        const readline = require('readline');
        const readlineInterface: Interface = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.readlineInterface = readlineInterface;
    }

    public getInput(): Interface {
        return this.readlineInterface;
    }

    public static getInstance(): InputHelper {
        if (this.instance === null) {
            this.instance = new InputHelper();
        }

        return this.instance;
    }
}
