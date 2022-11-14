import {ReassigningDocument} from "./model/ReassigningDocument";
import {KafkaTopic} from "../kafka/model/KafkaTopic";
import {RandomUtils} from "../utils/RandomUtils";
import {Logger} from "../utils/Logger";

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
