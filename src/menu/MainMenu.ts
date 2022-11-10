import {Logger} from "../utils/Logger";
import {InputHelper} from "../dataInput/InputHelper";
import {
    ShowingCurrentPartitionsSpecification
} from "./currentPartitionsSpecification/ShowingCurrentPartitionsSpecifications";
import {ShowingByBrokerPartitionsDetails} from "./byBroker/ShowingByBrokerPartitionsDetails";

export class MainMenu {

    public static run() {
        Logger.info("Running");
        this.menuEntry();
    }

    private static menuEntry() {
        const readline = InputHelper.getInstance().getInput();


        this.printMenu();
        readline.question("", (input: string) => {
            this.typed(input);
        });
    }

    private static printMenu(): void {
        console.log(`1) Show current partitions specification`);
        console.log(`2) Show live partitions statistics`);
        console.log(`3) Show brokers with partitions`);
        console.log(`9) Exit`);
    }

    private static typed(line: string): void {
        switch (line.toLowerCase().trim()) {
            case "1":
                ShowingCurrentPartitionsSpecification.run();
                break;
            case "2":
                console.log("option 2");
                this.menuEntry()
                break;

            case "3":
                console.log("option 3");
                ShowingByBrokerPartitionsDetails.run();
                break;

            case "9":
                console.log("Exiting");
                process.exit(0);
                break;

            default:
                console.log("Option not understood. Try again\n");
                this.menuEntry();
        }
    }

}
