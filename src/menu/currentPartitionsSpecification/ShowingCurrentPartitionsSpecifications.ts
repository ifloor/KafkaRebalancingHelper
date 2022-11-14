import {InputHelper} from "../../dataInput/InputHelper";
import {MainMenu} from "../MainMenu";
import {ExecDescribeAllPartition} from "../../executors/ExecDescribeAllPartition";
import {Logger} from "../../utils/Logger";
import {JSonizer} from "../../utils/JSonizer";

export class ShowingCurrentPartitionsSpecification {
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
        console.log(`1) Show current partitions specifications (output as json)`);
        console.log(`2) Show current partitions simplified (output formatted)`);
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
        const topics = await ExecDescribeAllPartition.exec();
        console.log(`Partitions: ${JSonizer.toJSonWithoutCircularRefs(topics)}`);
    }

    private static async option2() {
        const topics = await ExecDescribeAllPartition.exec();
        topics.forEach(topic => {
            console.log(`Topic: ${topic.getName()},\treplicationFactor: ${topic.getReplicationFactor()},\tconfigs: ${topic.getConfigs()}`);
            topic.getPartitions().forEach(partition => {
                console.log(`\tpartition: ${partition.getPartitionNumber()},\tleader: ${partition.getBrokerLeader()}` +
                `,\treplicas: ${partition.getReplicasStatus()},\tisr: ${partition.getInSyncReplicasStatus()}`)
            });
        })
    }
}
