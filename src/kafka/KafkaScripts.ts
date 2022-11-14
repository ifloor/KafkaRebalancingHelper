import path from "path";
import {VariablesExtractor} from "../utils/VariablesExtractor";

export class KafkaScripts {
    public static readonly ReassignJSonFile = "reassigningTopic.js";
    private static readonly BinFolderPath = `.${path.sep}kafka${path.sep}bin${path.sep}`;
    private static CustomConfigCommand: string | undefined;

    public static describeAllTopics(bootstrapServers: string): string {
        return `${(KafkaScripts.BinFolderPath)}kafka-topics.sh --describe --bootstrap-server ${bootstrapServers} ${this.appendCustomConfigsIfApplicable()}`;
    }

    public static describeAllBrokers(bootstrapServers: string): string {
        return `${(KafkaScripts.BinFolderPath)}kafka-broker-api-versions.sh --bootstrap-server ${bootstrapServers} ${this.appendCustomConfigsIfApplicable()}`;
    }

    public static reassignTopicReplicas(bootstrapServers: string): string {
        return `${(KafkaScripts.BinFolderPath)}kafka-reassign-partitions.sh --bootstrap-server ${bootstrapServers} ${this.appendCustomConfigsIfApplicable()} --execute --reassignment-json-file ${this.ReassignJSonFile}`;
    }

    public static verifyReassignTopicReplicas(bootstrapServers: string): string {
        return `${(KafkaScripts.BinFolderPath)}kafka-reassign-partitions.sh --bootstrap-server ${bootstrapServers} ${this.appendCustomConfigsIfApplicable()} --verify --reassignment-json-file ${this.ReassignJSonFile}`;
    }

    private static appendCustomConfigsIfApplicable(): string {
        if (this.CustomConfigCommand === undefined) {
            const customConfigFilePath = VariablesExtractor.getConfigPropertiesFilePath();
            if (customConfigFilePath.trim().length === 0) {
                this.CustomConfigCommand = "";
            } else {
                this.CustomConfigCommand = `--command-config ${customConfigFilePath}`;
            }
        }

        return this.CustomConfigCommand;
    }
}
