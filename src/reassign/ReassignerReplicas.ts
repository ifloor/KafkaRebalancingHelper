import {ReassigningDocument} from "./model/ReassigningDocument";
import {Logger} from "../utils/Logger";
import {ReassignerUtils} from "./ReassignerUtils";
import {RandomUtils} from "../utils/RandomUtils";
import {ReassigningPartition} from "./model/ReassigningPartition";

export class ReassignerReplicas {
    private static async checkBalancingReplicas(brokerIDToCheck: string, idealNumbers: Map<string, number>, partitionDocuments: Map<string, ReassigningDocument>): Promise<void> {
        const idealReplicas = idealNumbers.get(brokerIDToCheck);
        if (! idealReplicas) {
            Logger.error(`${brokerIDToCheck} has no ideal number...`);
            return;
        }

        let brokerReplications = this.countPartitionsThatBrokerReplicates(brokerIDToCheck, partitionDocuments);
        while (brokerReplications > idealReplicas) { // Reduce this broker replications
            // move
            const otherBrokerTries = this.buildOtherBrokersTries(idealNumbers, brokerIDToCheck);
            let otherBrokerToMoveTo: string | null = null;
            let partitionToMove: ReassigningPartition | null = null;
            while (partitionToMove === null) {
                const otherRandomBroker = this.randomlyChooseAndCutNextBroker(otherBrokerTries);
                if (otherRandomBroker === null) {
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
            }

            if (otherBrokerToMoveTo === null || partitionToMove === null) {
                Logger.error(`Impossible to find another partition to move replica.`);
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
                if (reassigningPartition.getReplicas().indexOf(brokerAsNumber) >= 0) totalReplications += 1;
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
        let selectedIndex = -1;
        for (let i = 0; i < 30; i++) {
            selectedIndex = RandomUtils.getRandomInt(0, otherBrokersTries.size - 1);
        }

        const otherRandomBroker =  Array.from(otherBrokersTries.values())[selectedIndex]; // the other random broker ;);
        otherBrokersTries.delete(otherRandomBroker);
        return otherRandomBroker;
    }
}
