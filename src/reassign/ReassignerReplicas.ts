import {KafkaTopic} from "../kafka/model/KafkaTopic";
import {ReassigningDocument} from "./model/ReassigningDocument";
import {KafkaPartition} from "../kafka/model/KafkaPartition";
import {Logger} from "../utils/Logger";
import {ReassignerUtils} from "./ReassignerUtils";

export class ReassignerReplicas {
    public static async reassignReplicas(topics: KafkaTopic[], idealNumbers: Map<string, number>, partitionDocuments: Map<string, ReassigningDocument>): Promise<void> {
        const brokersLeading: Map<string, KafkaPartition[]> = new Map();

        /*topics.forEach(topic => {
            topic.getPartitions().forEach(partition => {
                const replicas = partition.getReplicasStatus().split(",");
                const idealLeader = replicas[0];
                this.addToMap(brokersLeading, idealLeader, partition);
            });
        });*/

        for (let brokerToFix of idealNumbers.keys()) {
            await this.checkBalancingReplicas(brokerToFix, idealNumbers, partitionDocuments);
        }
    }

    private static async checkReplicationFactor(brokerIDToCheck: string, idealNumbers: Map<string, number>, partitionDocuments: Map<string, ReassigningDocument>): Promise<void> {

    }

    private static async checkBalancingReplicas(brokerIDToCheck: string, idealNumbers: Map<string, number>, partitionDocuments: Map<string, ReassigningDocument>): Promise<void> {
        const idealReplicas = idealNumbers.get(brokerIDToCheck);
        if (! idealReplicas) {
            Logger.error(`${brokerIDToCheck} has no ideal number...`);
            return;
        }

        /*let brokerPartitions = this.countPartitionsThatBrokerIsLeader(brokerIDToCheck, partitionDocuments);
        while (idealReplicas < brokerPartitions) { // Reduce this broker number of leadership
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
        }*/
    }
}
