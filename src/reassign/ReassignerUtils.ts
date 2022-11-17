import {ReassigningDocument} from "./model/ReassigningDocument";
import {KafkaTopic} from "../kafka/model/KafkaTopic";
import {RandomUtils} from "../utils/RandomUtils";
import {Logger} from "../utils/Logger";
import {ReassigningPartition} from "./model/ReassigningPartition";

export class ReassignerUtils {
    public static mapExisting(topics: KafkaTopic[]): Map<string, ReassigningDocument> {
        const mapped: Map<string, ReassigningDocument> = new Map<string, ReassigningDocument>();
        topics.forEach(topic => {
            topic.getPartitions().forEach(partition => {
                let reassigningDocument: ReassigningDocument;
                if (mapped.has(partition.getTopic().getName())) {
                    reassigningDocument = mapped.get(partition.getTopic().getName())!;
                } else {
                    reassigningDocument = new ReassigningDocument();
                    mapped.set(partition.getTopic().getName(), reassigningDocument);
                }

                reassigningDocument.add(partition);
            });
        });

        return mapped;
    }

    public static moveLeadership(fromBrokerID: string, toBrokerID: string, documents: Map<string, ReassigningDocument>): void {
        const documentsArray: ReassigningDocument[] = Array.from(documents.values());

        let moveDone = false;
        while (documentsArray.length > 0 && !moveDone) {
            const randomDocumentIndex = RandomUtils.getRandomInt(0, documentsArray.length - 1);
            const document = documentsArray[randomDocumentIndex];
            documentsArray.splice(randomDocumentIndex, 1);

            for (let partition of document.getPartitions()) {
                if (partition.getReplicas()[0].toString() === fromBrokerID) {
                    // The leader is the broker I want to move from.
                    Logger.debug(`Topic: ${partition.getTopic()}, Partition: ${partition.getPartition()}`);
                    Logger.debug(`Replicas before changing: ${JSON.stringify(partition.getReplicas())}`);
                    partition.setLeaderTo(toBrokerID);
                    moveDone = true;
                    Logger.debug(`Replicas after changing: ${JSON.stringify(partition.getReplicas())}`);
                    break;
                }
            }
        }


        if (! moveDone) {
            Logger.error(`Cannot move leadership from ${fromBrokerID} to ${toBrokerID}. Impossible to continue`);
            process.exit(-1);
        }
    }

    public static canMoveReplicaToAnotherBroker(fromBrokerID: string, toBrokerID: string, documents: Map<string, ReassigningDocument>): ReassigningPartition | null {
        const fromID: number = Number.parseInt(fromBrokerID);
        const toID: number = Number.parseInt(toBrokerID);
        let foundPartition: ReassigningPartition | null = null;

        for (let document of documents.values()) {
            if (foundPartition != null) break;

            for (let partition of document.getPartitions()) {
                if (partition.getReplicas().includes(fromID) && ! partition.getReplicas().includes(toID)) {
                    foundPartition = partition;
                    break;
                }
            }
        }

        return foundPartition;
    }

    public static moveReplica(fromBrokerID: string, toBrokerID: string, partitionToMove: ReassigningPartition): void {
        const fromID: number = Number.parseInt(fromBrokerID);
        const toID: number = Number.parseInt(toBrokerID);
        const replicas = partitionToMove.getReplicas();
        replicas[replicas.indexOf(fromID)] = toID;
        partitionToMove.setChanged();
    }

    public static countTopicsToReassign(documents: Map<string, ReassigningDocument>): number {
        let topicsToReassign = 0;

        documents.forEach((document, topic) => {
            for (let partition of document.getPartitions()) {
                if (partition.getChanged()) {
                    topicsToReassign++;
                    break;
                }
            }
        });

        return topicsToReassign;
    }
}
