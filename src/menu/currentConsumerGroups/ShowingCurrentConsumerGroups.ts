import {InputHelper} from "../../dataInput/InputHelper";
import {MainMenu} from "../MainMenu";
import {ExecDescribeAllConsumerGroups} from "../../executors/ExecDescribeAllConsumerGroups";
import {ExecGetLagOfGroup} from "../../executors/ExecGetLagOfGroup";

export class ShowingCurrentConsumerGroups {
    public static run() {
        this.menuEntry();
    }

    private static menuEntry() {
        const readline = InputHelper.getInstance().getInput();

        this.printMenu();
        readline.question("", (input: string) => {
            const _ = this.typed(input);
        });
    }

    private static printMenu(): void {
        console.log("");
        console.log(`1) Show current consumer groups`);
        console.log(`2) Show current lag for all current groups`);
        console.log(`9) Go back to previous menu`);
    }

    private static async typed(line: string) {
        switch (line.toLowerCase().trim()) {
            case "1":
                await this.option1();
                this.menuEntry()
                break;

            case "2":
                await this.option2();
                this.menuEntry()
                break;

            case "9":
                MainMenu.run();
                break;

            default:
                console.log("Option not understood. Try again\n");
                this.menuEntry()
        }
    }

    private static async option1() {
        const groups = await ExecDescribeAllConsumerGroups.exec();
        console.log();
        console.log(`Existing consumer groups:`);
        groups.forEach(consumerGroup => {
           console.log(consumerGroup);
        });
    }

    private static async option2() {
        const groups = await  ExecDescribeAllConsumerGroups.exec();
        for (const group of groups) {
            const consumerLag = await ExecGetLagOfGroup.exec(group);
            console.log();
            console.log(`ConsumerGroup: [${consumerLag.getGroupName()}]`)
            consumerLag.getPartitionLags().forEach(partitionLag => {
                console.log(`\t${partitionLag.topic}:${partitionLag.partition}\tlag: ${partitionLag.lag}\tclientID: ${partitionLag.clientID}`);
            });
        }
    }
}
