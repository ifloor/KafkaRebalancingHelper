import {InputHelper} from "../../dataInput/InputHelper";
import {MainMenu} from "../MainMenu";
import {ExecDescribeAllPartition} from "../../executors/ExecDescribeAllPartition";
import {Logger} from "../../utils/Logger";
import {JSonizer} from "../../utils/JSonizer";
import {BrokerWithSimplifiedInfo} from "../../reports/BrokerWithSimplifiedInfo";
import {ByBrokersReports} from "../../reports/ByBrokersReports";
import {KafkaTopic} from "../../kafka/model/KafkaTopic";
import {KafkaPartition} from "../../kafka/model/KafkaPartition";

export class ShowingByBrokerPartitionsDetails {
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
        console.log(`1) Show partitions by broker (simplified)`);
        console.log(`2) Show partitions by broker (detailed)`);
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
        await this.calculateSimplifiedInfo();
    }

    private static async option2() {
        const topics = await ExecDescribeAllPartition.exec();
        const mappedPartitions: Map<string, KafkaPartition[]> = new Map<string, KafkaPartition[]>();

        topics.forEach(topic => {
            topic.getPartitions().forEach(partition => {
                const leader = partition.getBrokerLeader().toString();

                let partitionsList: KafkaPartition[];
                if (! mappedPartitions.has(leader)) {
                    partitionsList = [];
                    mappedPartitions.set(leader, partitionsList);
                } else {
                    partitionsList = mappedPartitions.get(leader)!;
                }

                partitionsList.push(partition);
            });
        });

        const report = await ByBrokersReports.gen(topics);
        report.brokerReports.forEach(brokerInfo => {
            this.printBroker(brokerInfo);
            const partitionsOfBroker: KafkaPartition[] = mappedPartitions.get(brokerInfo.getId()) ?? [];
            partitionsOfBroker.forEach(partition => {
                console.log(`\ttopic: ${partition.getTopic().getName()},\tpartition: ${partition.getPartitionNumber()},\tleader: ${partition.getBrokerLeader()}` +
                    `,\treplicas: ${partition.getReplicasStatus()},\tisr: ${partition.getInSyncReplicasStatus()}`)
            });
        });
    }

    private static async calculateSimplifiedInfo() {
        const topics = await ExecDescribeAllPartition.exec();
        const report = await ByBrokersReports.gen(topics);

        console.log(`Total partitions: ${report.totalPartitions}`);
        let onlinePartitions = 0;
        report.brokerReports.forEach(brokerInfo => {
            onlinePartitions += brokerInfo.getIsPreferredLeaderCount() + brokerInfo.getServingNotPreferredPartitionsCount();
            this.printBroker(brokerInfo);
        });

        console.log(`Offline partitions: ${report.offlinePartitions}`);
    }

    private static printBroker(brokerInfo: BrokerWithSimplifiedInfo): void {
        const shouldBeLeader = brokerInfo.getShouldBeTheLeaderPartitionsCount();
        const isPreferred = brokerInfo.getIsPreferredLeaderCount();
        const isNotPreferred = brokerInfo.getIsNotPreferredLeaderCount();
        const servingNotPreferred = brokerInfo.getServingNotPreferredPartitionsCount();
        const responsibleForReplicas = brokerInfo.getResponsibleForPartitionReplicasCount();
        const inSyncReplicas = brokerInfo.getIsInSyncPartitionReplicasCount();
        console.log(`BrokerID: ${brokerInfo.getId()},\tshouldBeLeader: ${shouldBeLeader},\tisPreferredBroker: ${isPreferred}/${(isPreferred+isNotPreferred)} (${isPreferred/(isPreferred+isNotPreferred)*100}%),` +
            `\tservingNotPreferredPartitions: ${servingNotPreferred},\tresponsibleForReplicas: ${responsibleForReplicas},` +
            `\tinSyncReplicas: ${inSyncReplicas}`);
    }
}
