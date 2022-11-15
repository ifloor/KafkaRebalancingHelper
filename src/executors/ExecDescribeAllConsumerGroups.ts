import {KafkaScripts} from "../kafka/KafkaScripts";
import {VariablesExtractor} from "../utils/VariablesExtractor";
import {CommandRunner} from "../utils/CommandRunner";
import {Logger} from "../utils/Logger";

export class ExecDescribeAllConsumerGroups {
    public static async exec(): Promise<string[]> {
        let currentGroups: string[] = [];

        const describeGroupsCommand = KafkaScripts.getAllConsumerGroups(VariablesExtractor.getKafkaBootstrapServers());
        const output = await CommandRunner.execute(describeGroupsCommand);
        Logger.debug(`Describe all consumer groups output: ${output}`);
        const outputLines = output.split("\n");
        outputLines.forEach(outputLine => {
            if (outputLine.trim().length > 0) {
                currentGroups.push(outputLine);
            }
        });

        currentGroups = currentGroups.sort((a, b) => {
           return a.localeCompare(b);
        });

        return currentGroups;
    }
}
