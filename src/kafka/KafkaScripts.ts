import path from "path";
import {VariablesExtractor} from "../utils/VariablesExtractor";

export class KafkaScripts {
    private static readonly BinFolderPath = `.${path.sep}kafka${path.sep}bin${path.sep}`;
    private static ConfiguredTimeout: string = VariablesExtractor.getTimeoutOnQueries();
    private static CustomConfigCommand: string | undefined;

    public static describeAllTopics(bootstrapServers: string): string {
        // tslint:disable-next-line:max-line-length
        return `${(KafkaScripts.BinFolderPath)}kafka-topics.sh --describe --bootstrap-server ${bootstrapServers} ${this.appendCustomConfigsIfApplicable()}`;
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
