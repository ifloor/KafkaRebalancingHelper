import {InputHelper} from "../../dataInput/InputHelper";
import {ExecListAllBrokers} from "../../executors/ExecListAllBrokers";
import {Reassigner} from "../../reassign/Reassigner";
import {BrokerWeightSelectionMenu} from "./BrokerWeightSelectionMenu";
import {BrokerWeightSpecification} from "../../reassign/BrokerWeightSpecification";
import {MainMenu} from "../MainMenu";
import {ReplicaConfigurationMenu} from "./ReplicaConfigurationMenu";

export class ReassignMenu {
    public static run() {
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
        console.log(`1) Move partitions between brokers evenly (all with same weight)`);
        console.log(`2) Move partitions between brokers using different weights for each broker`);
        console.log(`3) Set replicas for a partition manually (be careful, you should know what you are doing)`);
        console.log(`9) Go back`);
    }

    private static typed(line: string): void {
        switch (line.toLowerCase().trim()) {
            case "1":
                const _ = this.option1();
                break;

            case "2":
                this.option2();
                break;

            case "3":
                this.option3();
                break;

            case "9":
                console.log("Moving to previous menu");
                MainMenu.run();
                break;

            default:
                console.log("Option not understood. Try again\n");
                this.menuEntry();
        }
    }

    private static async option1() {
        await Reassigner.reassignEvenly();
        console.log(`Got back`);
        this.menuEntry();
    }

    private static option2() {
        ExecListAllBrokers.exec().then(brokers => {
            const brokerIDs: string[] = brokers.map((broker) => broker.brokerID);

            const weightSelectionMenu = new BrokerWeightSelectionMenu(brokerIDs);
            weightSelectionMenu.run().then((weightSelections) => {
                const weightSpecifications: BrokerWeightSpecification[] = [];
                weightSelections.forEach((weight, brokerID) => {
                   weightSpecifications.push(new BrokerWeightSpecification(brokerID, weight));
                });
                Reassigner.reassignByWeight(weightSpecifications).then(_ => {
                    this.menuEntry();
                }).catch((error: any) => {
                    console.log(`Error when reassign with custom weights: ${JSON.stringify(error)}`);
                });
            }).catch((error: any) => {
                console.log(`Error when weight selection menu waiting: ${JSON.stringify(error)}`);
            });
        }).catch((error: any) => {
            console.log(`Error when executing execListAllBrokers: ${JSON.stringify(error)}`);
        });
    }

    private static option3() {
        new ReplicaConfigurationMenu().run();
    }
}
