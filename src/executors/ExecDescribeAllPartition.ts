import {KafkaScripts} from "../kafka/KafkaScripts";
import {VariablesExtractor} from "../utils/VariablesExtractor";
import {CommandRunner} from "../utils/CommandRunner";
import {Logger} from "../utils/Logger";
import {KafkaTopic} from "../kafka/model/KafkaTopic";
import {PoweredReplacer} from "../utils/PoweredReplacer";
import {KafkaPartition} from "../kafka/model/KafkaPartition";

export class ExecDescribeAllPartition {
    public static async exec(): Promise<Array<KafkaTopic>> {
        const script = KafkaScripts.describeAllTopics(VariablesExtractor.getKafkaBootstrapServers());
        const descriptionOutput = await CommandRunner.execute(script);
        Logger.debug(`ExecDescribeAllPartition Output: ${descriptionOutput}`);
        return this.parse(descriptionOutput);
    }

    private static parse(output: string): KafkaTopic[] {
        const lines = output.split("\n");

        const parsedTopics: KafkaTopic[] = [];
        let currentTopic: KafkaTopic | null = null;
        for (let i = 0; i < lines.length; i++) {
            const line: string = lines[i];
            if (! line.includes("Topic")) {
                continue;
            }

            // New topic line
            if (line.includes("ReplicationFactor")) {
                currentTopic = this.parseTopicLine(line);
                parsedTopics.push(currentTopic);
            } else if (line.includes("Leader:")) { // Topic partition line
                const newPartition = this.parsePartitionLine(line);
                if (newPartition != null) newPartition.setTopic(currentTopic!);
                currentTopic?.getPartitions().push(newPartition);
            }

        }

        return parsedTopics;
    }

    private static parseTopicLine(topicLine: string): KafkaTopic {
        let cleanedLine = PoweredReplacer.replaceUntilTheEnd(topicLine, "\t", " ");
        cleanedLine = PoweredReplacer.replaceUntilTheEnd(cleanedLine, "  ", " ");
        cleanedLine = cleanedLine.replaceAll(": ", ":");
        const newTopic = new KafkaTopic();

        const linePieces = cleanedLine.split(" ");
        for (let i = 0; i < linePieces.length; i++) {
            const linePiece = linePieces[i];
            if (! linePiece.includes(":")) {
                continue;
            }

            this.fillTopicInfo(linePiece, newTopic);
        }
        Logger.debug(`Parsed kafka topic line: ${JSON.stringify(newTopic)}`);

        return newTopic;
    }
    private static fillTopicInfo(piece: string, topic: KafkaTopic): void {
        const keyValuePieces = piece.split(":");
        if (keyValuePieces.length != 2) {
            Logger.error(`piece: [${piece}] is not a key value pair`);
            return;
        }

        const key = keyValuePieces[0];
        const value = keyValuePieces[1];
        switch (key.toLowerCase()) {
            case "topic":
                topic.setName(value);
                break;

            case "topicid":
                topic.setId(value);
                break;

            case "partitioncount":
                topic.setPartitionCount(Number.parseInt(value));
                break;

            case "replicationfactor":
                topic.setReplicationFactor(Number.parseInt(value));
                break;

            case "configs":
                topic.setConfigs(value);
                break;
        }
    }

    private static parsePartitionLine(partitionLine: string): KafkaPartition {
        let cleanedLine = PoweredReplacer.replaceUntilTheEnd(partitionLine, "\t", " ");
        cleanedLine = PoweredReplacer.replaceUntilTheEnd(cleanedLine, "  ", " ");
        cleanedLine = cleanedLine.replaceAll(": ", ":");
        const newPartition = new KafkaPartition();

        const linePieces = cleanedLine.split(" ");
        for (let i = 0; i < linePieces.length; i++) {
            const linePiece = linePieces[i];
            if (! linePiece.includes(":")) {
                continue;
            }

            this.fillPartitionInfo(linePiece, newPartition);
        }
        Logger.debug(`Parsed kafka partition line: ${JSON.stringify(newPartition)}`);
        return newPartition
    }

    private static fillPartitionInfo(piece: string, partition: KafkaPartition): void {
        const keyValuePieces = piece.split(":");
        if (keyValuePieces.length != 2) {
            Logger.error(`piece: [${piece}] is not a key value pair`);
            return;
        }

        const key = keyValuePieces[0];
        const value = keyValuePieces[1];
        switch (key.toLowerCase()) {
            case "partition":
                partition.setPartitionNumber(Number.parseInt(value));
                break;

            case "leader":
                partition.setBrokerLeader(Number.parseInt(value));
                break;

            case "replicas":
                partition.setReplicasStatus(value);
                break;

            case "isr":
                partition.setInSyncReplicasStatus(value);
                break;
        }
    }
}
