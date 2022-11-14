import {BrokerWeightSpecification} from "./BrokerWeightSpecification";
import {ExecListAllBrokers} from "../executors/ExecListAllBrokers";
import {ExecDescribeAllPartition} from "../executors/ExecDescribeAllPartition";
import {KafkaTopic} from "../kafka/model/KafkaTopic";
import {AssignerDistributor} from "./AssignerDistributor";
import {Logger} from "../utils/Logger";
import {KafkaPartition} from "../kafka/model/KafkaPartition";
import {ReassigningDocument} from "./model/ReassigningDocument";
import {ReassignerUtils} from "./ReassignerUtils";
import {RandomUtils} from "../utils/RandomUtils";
import {ReassignerApplier} from "./applying/ReassignerApplier";

export class Reassigner {
    public static async reassignEvenly() {
        const brokers = await ExecListAllBrokers.exec();
        console.log(`brokers: ${brokers.length}`);
        const brokerWeights: BrokerWeightSpecification[] = [];
        brokers.forEach(broker => {
            brokerWeights.push(new BrokerWeightSpecification(broker.brokerID, 1));
        });

        await this.reassignByWeight(brokerWeights);
    }

    public static async reassignByWeight(brokerWeights: BrokerWeightSpecification[]) {
        Logger.debug(`Reassigning using weights: ${JSON.stringify(brokerWeights)}`);
        const topics: KafkaTopic[] = await ExecDescribeAllPartition.exec();
        let totalPartitions = 0;
        let totalReplicas = 0;

        topics.forEach((topic) => {
            totalPartitions += topic.getPartitions().length;
            totalReplicas += topic.getReplicationFactor();
        });

        const idealLeaderNumbers = AssignerDistributor.calculateIdealProportion(brokerWeights, totalPartitions);
        this.logProportionFound(idealLeaderNumbers, "leaders", "partition(s)");

        const partitionDocuments: Map<string, ReassigningDocument> = ReassignerUtils.mapExisting(topics);

        await this.reassignLeaders(topics, idealLeaderNumbers, partitionDocuments);

        // count
        const topicsToReassign = ReassignerUtils.countTopicsToReassign(partitionDocuments);
        if (topicsToReassign == 0) {
            Logger.info(`No topic changes. Nothing to do...`);
            return;
        }

        await ReassignerApplier.apply(partitionDocuments);
    }

    private static async reassignLeaders(topics: KafkaTopic[], idealNumbers: Map<string, number>, partitionDocuments: Map<string, ReassigningDocument>): Promise<void> {
        const brokersLeading: Map<string, KafkaPartition[]> = new Map();

        topics.forEach(topic => {
            topic.getPartitions().forEach(partition => {
                const replicas = partition.getReplicasStatus().split(",");
                const idealLeader = replicas[0];
                this.addToMap(brokersLeading, idealLeader, partition);
            });
        });

        for (let brokerToFix of idealNumbers.keys()) {
            await this.checkBalancingLeadership(brokerToFix, idealNumbers, partitionDocuments);
        }
    }

    private static async checkBalancingLeadership(brokerIDToCheck: string, idealNumbers: Map<string, number>, partitionDocuments: Map<string, ReassigningDocument>): Promise<void> {
        const idealLeadershipPartitions = idealNumbers.get(brokerIDToCheck);
        if (! idealLeadershipPartitions) {
            Logger.error(`${brokerIDToCheck} has no ideal number...`);
            return;
        }

        let brokerPartitions = this.countPartitionsThatBrokerIsLeader(brokerIDToCheck, partitionDocuments);
        while (idealLeadershipPartitions < brokerPartitions) { // Reduce this broker number of leadership
            // move
            const otherBrokerTries = this.buildOtherBrokersTries(idealNumbers, brokerIDToCheck);
            let otherBrokerToMoveTo: string | null = null;
            while (otherBrokerToMoveTo === null) {
                const otherRandomBroker = this.randomlyChooseAndCutNextBroker(otherBrokerTries);
                if (otherRandomBroker === null) {
                    Logger.error(`Impossible to find another broker to move the partition leadership to. Exiting...`);
                    process.exit(-1);
                }

                const otherBrokerLeaderIdealPartitionsNumber = idealNumbers.get(otherRandomBroker!) ?? Number.MAX_SAFE_INTEGER;
                const otherBrokerRealPartitions = this.countPartitionsThatBrokerIsLeader(otherRandomBroker!, partitionDocuments);
                if (otherBrokerRealPartitions < otherBrokerLeaderIdealPartitionsNumber) {
                    otherBrokerToMoveTo = otherRandomBroker;
                }
            }

            Logger.debug(`Found that I should move a partition leadership from me (broker:${brokerIDToCheck}) to broker: ${otherBrokerToMoveTo}`);
            ReassignerUtils.moveLeadership(brokerIDToCheck, otherBrokerToMoveTo, partitionDocuments);
            brokerPartitions = this.countPartitionsThatBrokerIsLeader(brokerIDToCheck, partitionDocuments); // re-count
            // await Sleeping.sleep(1000); TODO
        }
    }

    private static countPartitionsThatBrokerIsLeader(broker: string, partitionDocuments: Map<string, ReassigningDocument>): number {
        let totalPartitions = 0;
        partitionDocuments.forEach(partitionDocument => {
            partitionDocument.getPartitions().forEach((reassigningPartition, index) => {
               if (broker === reassigningPartition.getReplicas()[0].toString()) totalPartitions += 1;
            });
        });

        return totalPartitions;
    }

    private static addToMap(map: Map<string, KafkaPartition[]>, forKey: string, partition: KafkaPartition): void {
        let partitions: KafkaPartition[];
        if (! map.has(forKey)) {
            partitions = [];
            map.set(forKey, partitions);
        } else {
            partitions = map.get(forKey)!;
        }

        partitions.push(partition);
    }

    private static logProportionFound(proportionFound: Map<string, number>, context: string, objectName: string): void {
        Logger.info(`When looking for ${context}, calculated the following proportion for the brokers:`);
        proportionFound.forEach((number, brokerID) => {
           Logger.info(`Broker[${brokerID}]: [${number}] ${objectName}`);
        });
    }

    private static buildOtherBrokersTries(idealNumbers: Map<string, number>, thisBrokerID: string): Set<string> {
        const allOtherBrokers: Set<string> = new Set<string>();
        idealNumbers.forEach((value, brokerID) => {
            if (brokerID !== thisBrokerID) {
                allOtherBrokers.add(brokerID);
            }
        });

        return allOtherBrokers;
    }

    private static randomlyChooseAndCutNextBroker(otherBrokersTries: Set<string>): string | null {
        let selectedIndex = -1;
        for (let i = 0; i < 30; i++) {
            selectedIndex = RandomUtils.getRandomInt(0, otherBrokersTries.size - 1);
        }

        const otherRandomBroker =  Array.from(otherBrokersTries.values())[selectedIndex]; // the other random broker ;);
        otherBrokersTries.delete(otherRandomBroker);
        return otherRandomBroker;
    }
}
