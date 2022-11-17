import {ReassigningDocument} from "./model/ReassigningDocument";
import {Logger} from "../utils/Logger";
import {ReassignerUtils} from "./ReassignerUtils";
import {RandomUtils} from "../utils/RandomUtils";
import {ReassigningPartition} from "./model/ReassigningPartition";
import {KafkaTopic} from "../kafka/model/KafkaTopic";

export class ReassignerReplicas {
    public static async reassignReplicas(topics: KafkaTopic[], idealNumbers: Map<string, number>, partitionDocuments: Map<string, ReassigningDocument>): Promise<void> {
        for (let brokerToFix of idealNumbers.keys()) {
            await this.checkBalancingReplicas(brokerToFix, idealNumbers, partitionDocuments);
        }
    }

    private static async checkBalancingReplicas(brokerIDToCheck: string, idealNumbers: Map<string, number>, partitionDocuments: Map<string, ReassigningDocument>): Promise<void> {
        const idealReplicas = idealNumbers.get(brokerIDToCheck);
        if (idealReplicas === null || idealReplicas === undefined) {
            Logger.error(`${brokerIDToCheck} has no ideal number...`);
            return;
        }

        let brokerReplications = this.countPartitionsThatBrokerReplicates(brokerIDToCheck, partitionDocuments);
        while (brokerReplications > idealReplicas) { // Reduce this broker replications
            Logger.debug(`Broker [${brokerIDToCheck}] has [${brokerReplications}] replicas, but the ideal number is: [${idealReplicas}]`);
            // move
            const otherBrokerTries = this.buildOtherBrokersTries(idealNumbers, brokerIDToCheck);
            let otherBrokerToMoveTo: string | null = null;
            let partitionToMove: ReassigningPartition | null = null;
            while (partitionToMove === null) {
                const otherRandomBroker = this.randomlyChooseAndCutNextBroker(otherBrokerTries);
                if (otherRandomBroker === null || otherRandomBroker === undefined) {
                    Logger.error(`otherRandomBroker: ${otherRandomBroker}`);
                    Logger.error(`Impossible to find another broker to move the partition replica to. Exiting...`);
                    process.exit(-1);
                }

                const otherBrokerReplicasIdealNumber = idealNumbers.get(otherRandomBroker!) ?? Number.MAX_SAFE_INTEGER;
                const otherBrokerRealReplicasNumber = this.countPartitionsThatBrokerReplicates(otherRandomBroker!, partitionDocuments);
                if (otherBrokerReplicasIdealNumber > otherBrokerRealReplicasNumber) { // Has fewer replicas than ideal
                    const possiblePartitionToMove = ReassignerUtils.canMoveReplicaToAnotherBroker(brokerIDToCheck, otherRandomBroker, partitionDocuments);
                    if (possiblePartitionToMove !== null) {
                        partitionToMove = possiblePartitionToMove;
                        otherBrokerToMoveTo = otherRandomBroker;
                    }
                }

                if (otherBrokerToMoveTo === null || otherBrokerToMoveTo === undefined) {
                    Logger.debug(`other broker: ${otherRandomBroker} is not an option when moving my partition to it`);
                }
            }

            if (otherBrokerToMoveTo === undefined || otherBrokerToMoveTo === null) {
                Logger.error(`Impossible to find another partition to move replica (otherBrokerToMoveTo).`);
                process.exit(-1);
            }

            if (partitionToMove === undefined || partitionToMove === null) {
                Logger.error(`Impossible to find another partition to move replica (partitionToMove).`);
                process.exit(-1);
            }

            Logger.debug(`Found that I should move a partition replica from me (broker:${brokerIDToCheck}) to broker: ${otherBrokerToMoveTo}, partition: ${partitionToMove.getTopic()}:${partitionToMove.getPartition()}`);
            ReassignerUtils.moveReplica(brokerIDToCheck, otherBrokerToMoveTo, partitionToMove);
            brokerReplications = this.countPartitionsThatBrokerReplicates(brokerIDToCheck, partitionDocuments); // re-count
        }
    }

    private static countPartitionsThatBrokerReplicates(broker: string, partitionDocuments: Map<string, ReassigningDocument>): number {
        const brokerAsNumber = Number.parseInt(broker);
        let totalReplications = 0;
        partitionDocuments.forEach(partitionDocument => {
            partitionDocument.getPartitions().forEach((reassigningPartition, index) => {
                if (reassigningPartition.getReplicas().includes(brokerAsNumber)) totalReplications += 1;
            });
        });

        return totalReplications;
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
        let selectedIndex = RandomUtils.getRandomInt(0, otherBrokersTries.size - 1);
        Logger.debug(`Selected index: ${selectedIndex} among other broker tries: ${otherBrokersTries.size}`);

        const otherRandomBroker =  Array.from(otherBrokersTries.values())[selectedIndex]; // the other random broker ;);
        otherBrokersTries.delete(otherRandomBroker);
        return otherRandomBroker;
    }
}
