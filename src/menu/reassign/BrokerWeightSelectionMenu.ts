import {InputHelper} from "../../dataInput/InputHelper";
import {Logger} from "../../utils/Logger";

export class BrokerWeightSelectionMenu {
    private selectedWeights: Map<string, number | null> = new Map<string, number | null>();
    private selectedBrokerID: string | null = null;
    private promiseResolve: any;
    private promiseReject: any;

    constructor(existingBrokerIDs: string[]) {
        existingBrokerIDs.forEach(brokerID => {
            this.selectedWeights.set(brokerID, null);
        });
    }

    public run(): Promise<Map<string, number>> {
        return new Promise((resolve, reject) => {
            this.promiseResolve = resolve;
            this.promiseReject = reject;
            this.menuEntry();
        });
    }

    private menuEntry() {
        const readline = InputHelper.getInstance().getInput();

        if (this.selectedBrokerID) {
            this.inputForWeightSelection();
            readline.question("", (input: string) => {
                this.typedWeight(input);
            });
        } else {
            this.printMenu();
            readline.question("", (input: string) => {
                this.typed(input);
            });
        }
    }

    private printMenu(): void {
        let brokersLine = "\n";
        this.selectedWeights.forEach((weight, brokerID) => {
            brokersLine += `${brokerID} -> ${weight ?? '?'}, `;
        });
        brokersLine = brokersLine.substring(0, brokersLine.length - 2); // last two chars are ' ,', which aren't needed
        console.log(brokersLine);
        console.log(`1) {{broker id}} // Select broker for weight definition`);
        console.log(`9) Finished weights definition`);
    }

    private inputForWeightSelection(): void {
        console.log(`\nSelected broker with id [${this.selectedBrokerID}]. Which weight should this broker have? Type the weight (number/integer)`);
    }

    private typed(line: string): void {
        const pieces = line.split(" ");
        switch (pieces[0].toLowerCase().trim()) {
            case "1":
                const _ = this.option1(pieces);
                this.menuEntry();
                break;

            case "9":
                this.option9();
                break;

            default:
                console.log("Option not understood. Try again\n");
                this.menuEntry();
        }
    }

    private typedWeight(line: string): void {
        try {
            const weight = Number.parseInt(line);

            if (weight < 0) {
                Logger.info("Typed weight cannot be negative")
                this.menuEntry();
                return;
            }

            this.selectedWeights.set(this.selectedBrokerID!, weight);
            this.selectedBrokerID = null;
            this.menuEntry();
        } catch (error: any) {
            console.log(`Not possible to understand typed weight: ${JSON.stringify(error)} - for string: ${line}`);
        }
    }

    private async option1(inputLinePieces: string[]) {
        if (inputLinePieces.length <= 1) {
            console.log("Error: broker id not specified. Type: 1 {{brokerID}}")
            return;
        }

        const inputBrokerID = inputLinePieces[1];
        if (! this.selectedWeights.has(inputBrokerID)) {
            console.log(`No broker for ID: ${inputBrokerID}`);
            return;
        }

        this.selectedBrokerID = inputBrokerID;
    }

    private option9() {
        const finalMap: Map<string, number> = new Map<string, number>();
        let allBrokersSpecified = true;
        for (let brokerID of this.selectedWeights.keys()) {
          const weight = this.selectedWeights.get(brokerID);
            if (weight == null)  {
                allBrokersSpecified = false;
                break;
            }

            finalMap.set(brokerID, weight!);
        }

        if (! allBrokersSpecified) {
            console.log("Not all brokers have a weight specified. Not possible to exit yet");
            this.menuEntry();
            return;
        }

        this.promiseResolve(finalMap);
    }
}
