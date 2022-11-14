import {KafkaScripts} from "../kafka/KafkaScripts";
import {VariablesExtractor} from "../utils/VariablesExtractor";
import {CommandRunner} from "../utils/CommandRunner";
import {Logger} from "../utils/Logger";
import {KafkaBroker} from "../kafka/model/KafkaBroker";

export class ExecListAllBrokers {
    public static async exec(): Promise<Array<KafkaBroker>> {
        const script = KafkaScripts.describeAllBrokers(VariablesExtractor.getKafkaBootstrapServers());
        const descriptionOutput = await CommandRunner.execute(script);
        Logger.debug(`ExecListAllBrokers Output: ${descriptionOutput}`);
        return this.parse(descriptionOutput);
    }

    private static parse(output: string): KafkaBroker[] {
        const parsedBrokers: KafkaBroker[] = [];
        const lines = output.split("\n");
        lines.forEach(line => {
           if (line.includes("-> (")) {
               const parsingBrokerAttempt = this.parseBrokerLine(line);
               if (parsingBrokerAttempt) parsedBrokers.push(parsingBrokerAttempt);
           }
        });

        return parsedBrokers;
    }

    private static parseBrokerLine(brokerLine: string): KafkaBroker | null {
        try {
            const linePieces = brokerLine.split(" ");
            const listeningEndpoint = linePieces[0];
            const brokerID = linePieces[2];
            let rackID = linePieces[4];
            rackID = rackID.substring(0, rackID.indexOf(")"));

            return new KafkaBroker(listeningEndpoint, brokerID,rackID);
        } catch (error: any) {
            Logger.error(`Error trying to parse broker line: ${brokerLine} \n${JSON.stringify(error)}`);
        }

        return null;
    }
}
