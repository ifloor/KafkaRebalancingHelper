import {ExecDescribeAllPartition} from "../../executors/ExecDescribeAllPartition";
import {ReassigningDocument} from "../../reassign/model/ReassigningDocument";
import {Logger} from "../../utils/Logger";
import {InputHelper} from "../../dataInput/InputHelper";
import {ReassignMenu} from "../reassign/ReassignMenu";
import {ReassignerApplier} from "../../reassign/applying/ReassignerApplier";
import {KafkaTopic} from "../../kafka/model/KafkaTopic";
import {ReassignerUtils} from "../../reassign/ReassignerUtils";
import {ExecListAllBrokers} from "../../executors/ExecListAllBrokers";
import {RandomUtils} from "../../utils/RandomUtils";

export class TopicReplicationFactorChangeMenu {
    private selectedTopic: string | null = null;
    private currentTopics: KafkaTopic[] = [];
    private topics: Map<string, number> = new Map<string, number>();
    private loadingTopicsPromise: Promise<void> | null = null;

    constructor() {
        this.loadTopics();
    }

    private loadTopics(): void {
        this.loadingTopicsPromise = new Promise((resolve, reject) => {
            ExecDescribeAllPartition.exec().then(topics => {
                const topicsMapping = new Map<string, number>();
                topics.forEach(topic => {
                    topicsMapping.set(topic.getName(), topic.getReplicationFactor());
                });

                this.topics = topicsMapping;
                this.currentTopics = topics;
                this.loadingTopicsPromise = null;
                resolve();

            }).catch(error => {
                Logger.error(`Error executing describe topic: ${JSON.stringify(error)}`);
            });
        });
    }

    public run(): void {
        this.menuEntry();
    }

    private menuEntry() {
        if (this.loadingTopicsPromise != null) {
            this.loadingTopicsPromise.then(_ => {
                this.inFactMenuEntry();

            }).catch(_ => {});
        } else {
            this.inFactMenuEntry();
        }
    }

    private inFactMenuEntry() {
        const readline = InputHelper.getInstance().getInput();
        console.log();

        if (this.selectedTopic) {
            this.inputForSelectedPartition();
            readline.question("Which will be the new replication factor?", async (input: string) => {
                await this.typedReplicationFactor(input);
            });
        } else {
            this.printMenu();
            readline.question("", (input: string) => {
                this.typed(input);
            });
        }
    }

    private printMenu(): void {
        console.log(`1) List existing topics and its replication factors`);
        console.log(`2) {{topic_name}} // Select topic name (string)`);
        console.log(`9) Go back`);
    }

    private inputForSelectedPartition(): void {
        console.log(`\nSelected topic [${this.selectedTopic}]. Current ReplicationFactor is: ${this.topics.get(this.selectedTopic!)}`);
    }

    private typed(line: string): void {
        const pieces = line.split(" ");
        switch (pieces[0].toLowerCase().trim()) {
            case "1":
                this.option1();
                this.menuEntry();
                break;

            case "2":
                this.option2(pieces);
                this.menuEntry();
                break;

            case "9":
                this.option9();
                break;

            default:
                console.log("Option not understood. Try again\n");
                this.menuEntry();
        }
    }

    private async typedReplicationFactor(line: string): Promise<void> {
        try {
            const newReplicaFactor = Number.parseInt(line.trim());

            await this.confirmAndApply(newReplicaFactor);
        } catch (error: any) {
            console.log(`Not possible to understand typed replication factor: ${JSON.stringify(error)} - for string: ${line}`);
        }
    }

    private option1() {
        console.log();
        this.topics.forEach((replicaFactor, topic) => {
            console.log(`topic=${topic} - replicaFactor=${replicaFactor}`)
        });
    }

    private option2(inputLinePieces: string[]) {
        if (inputLinePieces.length <= 1) {
            console.log("Error: topic not specified. Type: 2 {{topic_name}}")
            return;
        }

        const topicName = inputLinePieces[1];
        if (this.topics.has(topicName)) {
            this.selectedTopic = topicName;
        } else {
            Logger.error(`Topic not found: ${inputLinePieces}`);
        }
    }

    private option9() {
        ReassignMenu.run();
    }

    private async confirmAndApply(newReplicationFactor: number): Promise<void> {
        console.log();

        const currentReplicationFactor = this.topics.get(this.selectedTopic!) ?? -1;

        if (currentReplicationFactor < 0) {
            Logger.error(`Impossible to work with current replication factor: ${currentReplicationFactor}. Exiting...`);
            process.exit(-1);
            return;
        }

        if (newReplicationFactor === currentReplicationFactor) {
            Logger.info(`New replication factor is the same than current replication factor. Nothing to do...`);
            this.restartTopicSelection();
            return;
        }

        let mutatedDocument: ReassigningDocument | null = null;
        if (newReplicationFactor > currentReplicationFactor) {
            mutatedDocument = await this.increaseFactor(newReplicationFactor, this.selectedTopic!);
        } else if (newReplicationFactor < currentReplicationFactor) {
            mutatedDocument = this.shrinkFactor(newReplicationFactor, this.selectedTopic!);
        }

        await ReassignerApplier.applyList(Array.of(mutatedDocument!));
        this.restartTopicSelection();
    }

    private shrinkFactor(to: number, onTopic: string): ReassigningDocument {
        const reassigningDocuments = ReassignerUtils.mapExisting(this.currentTopics);
        const reassigningDocument: ReassigningDocument = reassigningDocuments.get(onTopic)!;
        reassigningDocument.getPartitions().forEach(topicPartition => {
            let replicas = topicPartition.getReplicas();
            replicas.splice(to, replicas.length - to);
            topicPartition.setReplicas(replicas);
        });

        return reassigningDocument;
    }

    private async increaseFactor(to: number, onTopic: string): Promise<ReassigningDocument> {
        const reassigningDocuments = ReassignerUtils.mapExisting(this.currentTopics);
        const reassigningDocument: ReassigningDocument = reassigningDocuments.get(onTopic)!;
        const brokerIDs = await this.fetchExistingBrokerIDs();

        for (let topicPartition of reassigningDocument.getPartitions()) {
            let brokersToTry = Array.from(brokerIDs.values());
            Logger.debug(`increasing partition: ${topicPartition.getTopic()}:${topicPartition.getPartition()}`);

            while (topicPartition.getReplicas().length < to && brokersToTry.length > 0) {
                const brokerToTryIndex: number = RandomUtils.getRandomInt(0, brokersToTry.length - 1);
                const brokerToTry = brokersToTry[brokerToTryIndex];
                brokersToTry.splice(brokerToTryIndex, 1);

                let brokerAlreadyReplicating = false;
                for (let i = 0; i < topicPartition.getReplicas().length; i++) {
                    if (topicPartition.getReplicas()[i].toString() === brokerToTry) {
                        brokerAlreadyReplicating = true;
                        break;
                    }
                }
                
                if (! brokerAlreadyReplicating) {
                    const replicas = topicPartition.getReplicas()
                    replicas.push(Number.parseInt(brokerToTry));
                    topicPartition.setReplicas(replicas);
                }
            }

            if (topicPartition.getReplicas().length < to) {
                Logger.error(`Something happened, but I cannot find a broker to make the partition replicas big enough`);
            }
        }

        return reassigningDocument;
    }

    private async fetchExistingBrokerIDs(): Promise<Set<string>> {
        const brokers = await ExecListAllBrokers.exec();
        const brokerSet = new Set<string>();
        brokers.forEach(broker => {
            brokerSet.add(broker.brokerID);
        });
        return brokerSet;
    }

    private restartTopicSelection(): void {
        this.selectedTopic = null;
        this.loadTopics();
        this.menuEntry();
    }
}
