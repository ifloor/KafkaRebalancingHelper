import {ReassigningDocument} from "../model/ReassigningDocument";
import {Logger} from "../../utils/Logger";
import {InputHelper} from "../../dataInput/InputHelper";
import {KafkaScripts} from "../../kafka/KafkaScripts";
import {VariablesExtractor} from "../../utils/VariablesExtractor";
import {CommandRunner} from "../../utils/CommandRunner";
import * as fs from "fs";

export class ReassignerApplier {
    public static async apply(mutatedDocuments: Map<string, ReassigningDocument>): Promise<void> {
        if (! await this.confirmChanges(mutatedDocuments)) {
            Logger.info("Aborted applying");
            return;
        }

        await this.inFactApply(mutatedDocuments);
    }

    private static async inFactApply(mutatedDocuments: Map<string, ReassigningDocument>): Promise<void> {
        const documentsToApply: ReassigningDocument[] = [];
        mutatedDocuments.forEach((document, topic) => {
            for (let partition of document.getPartitions()) {
                if (partition.getChanged()) {
                    documentsToApply.push(document);
                    break;
                }
            }
        });

        for (let i = 0; i < documentsToApply.length; i++) {
            Logger.info(`Applying topic changes - ${i}/${documentsToApply.length} (${(i)/documentsToApply.length * 100}%)`);
            await this.inFactApplyTopicDocument(documentsToApply[i]);
        }
    }

    private static async inFactApplyTopicDocument(document: ReassigningDocument): Promise<void> {
        const assignCommand = KafkaScripts.reassignTopicReplicas(VariablesExtractor.getKafkaBootstrapServers());

        const documentText = JSON.stringify(document);
        fs.writeFileSync(KafkaScripts.ReassignJSonFile, documentText);

        const assignOutput = await CommandRunner.execute(assignCommand);
        Logger.debug(`Reassign output: \n${assignOutput}`);
    }

    private static confirmChanges(mutatedDocuments: Map<string, ReassigningDocument>): Promise<boolean> {
        Logger.info("Do you confirm that you want to apply the changes bellow: ?");
        Logger.info(`What will change specifically: `);
        let lastTopic = "";
        for (let document of mutatedDocuments.values()) {
            document.getPartitions().forEach(partitionDocument => {
                if (partitionDocument.getChanged()) {
                    if (lastTopic != partitionDocument.getTopic()) {
                        console.log(`Topic: ${partitionDocument.getTopic()}`);
                        lastTopic = partitionDocument.getTopic()
                    }
                    console.log(`\tPartition: ${partitionDocument.getPartition()},\tReplicas: ${partitionDocument.getReplicas()}`);
                }
            });
        }

        console.log();
        Logger.info(`The final partitions distribution will be:`);
        for (let document of mutatedDocuments.values()) {
            console.log(`Topic: ${document.getPartitions()[0].getTopic()}`);
            document.getPartitions().forEach(partitionDocument => {
                console.log(`\tPartition: ${partitionDocument.getPartition()},\tReplicas: ${partitionDocument.getReplicas()}`)
            });
        }
        console.log();

        const readline = InputHelper.getInstance().getInput();

        return new Promise((resolve, reject) => {
            readline.question("Do you confirm? Y/N", (input: string) => {
                resolve(input.trim().toLowerCase() === "y");
            });
        });
    }
}
