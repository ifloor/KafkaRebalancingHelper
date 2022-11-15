import {KafkaScripts} from "../kafka/KafkaScripts";
import {VariablesExtractor} from "../utils/VariablesExtractor";
import {CommandRunner} from "../utils/CommandRunner";
import {Logger} from "../utils/Logger";
import {PoweredReplacer} from "../utils/PoweredReplacer";
import {KafkaConsumerLag} from "../kafka/model/KafkaConsumerLag";
import {KafkaConsumerPartitionLag} from "../kafka/model/KafkaConsumerPartitionLag";

export class ExecGetLagOfGroup {
    public static async exec(group: string): Promise<KafkaConsumerLag> {
        const command = KafkaScripts.getLagOfGroup(VariablesExtractor.getKafkaBootstrapServers(), group);
        const commandOutput = await CommandRunner.execute(command);
        Logger.debug(`Get lag of group output: ${commandOutput}`);
        let lags = this.parse(commandOutput);
        lags = lags.sort((a, b) => {
           return a.topic.localeCompare(b.topic);
        });

        let groupName: string;
        if (lags.length > 0) {
            groupName = lags[0].group;
        } else {
            groupName = group;
        }

        const consumerLag = new KafkaConsumerLag(groupName);
        consumerLag.setPartitionLags(lags);

        return consumerLag;
    }

    private static parse(commandOutput: string): KafkaConsumerPartitionLag[] {
        const partitionLags: KafkaConsumerPartitionLag[] = [];

        const commandLines = commandOutput.split("\n");
        let outputLineNumber = 0;
        for (let lineOutput of commandLines) {
            if (lineOutput.trim().length === 0) {
                continue;
            }
            outputLineNumber++;
            if (outputLineNumber === 1) {
                continue; // Header line
            }

            lineOutput = PoweredReplacer.replaceUntilTheEnd(lineOutput, "\t", " ");
            lineOutput = PoweredReplacer.replaceUntilTheEnd(lineOutput, "  ", " ");
            const lagLinePieces = lineOutput.split(" ");
            const group = lagLinePieces[0];
            const topic = lagLinePieces[1];
            const partition = lagLinePieces[2];
            const currentOffset = lagLinePieces[3];
            const logEndOffset = lagLinePieces[4];
            const lag = lagLinePieces[5];
            const consumerID = lagLinePieces[6];
            const host = lagLinePieces[7];
            const clientID = lagLinePieces[8];
            const partitionLag = new KafkaConsumerPartitionLag(
                group,
                topic,
                Number.parseInt(partition),
                Number.parseInt(currentOffset),
                Number.parseInt(logEndOffset),
                Number.parseInt(lag),
                consumerID,
                host,
                clientID,
            );

            partitionLags.push(partitionLag);
        }

        return partitionLags;
    }
}
