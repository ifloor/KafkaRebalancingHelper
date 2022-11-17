import {InputHelper} from "../../dataInput/InputHelper";
import {Logger} from "../../utils/Logger";
import {ReassigningPartition} from "../../reassign/model/ReassigningPartition";
import {ExecDescribeAllPartition} from "../../executors/ExecDescribeAllPartition";
import {ReassigningDocument} from "../../reassign/model/ReassigningDocument";
import {ReassignerUtils} from "../../reassign/ReassignerUtils";
import {ReassignMenu} from "./ReassignMenu";
import {ReassignerApplier} from "../../reassign/applying/ReassignerApplier";

export class ReplicaConfigurationMenu {
    private selectedPartition: ReassigningPartition | null = null;
    private partitions: ReassigningPartition[] = [];
    private loadingPartitionsPromise: Promise<void> | null = null;

    constructor() {
        this.loadPartitions();
    }

    private loadPartitions(): void {
        this.loadingPartitionsPromise = new Promise((resolve, reject) => {
            ExecDescribeAllPartition.exec().then(topics => {
                const partitionDocuments: Map<string, ReassigningDocument> = ReassignerUtils.mapExisting(topics);
                this.partitions = [];
                for (let document of partitionDocuments.values()) {
                    document.getPartitions().forEach(partitionDocument => {
                        this.partitions.push(partitionDocument);
                    });
                }
                this.loadingPartitionsPromise = null;
                resolve();

            }).catch(error => {
                Logger.error(`Error executing describe: ${JSON.stringify(error)}`);
            });
        });
    }

    public run(): void {
        this.menuEntry();
    }

    private menuEntry() {
        if (this.loadingPartitionsPromise != null) {
            this.loadingPartitionsPromise.then(_ => {
                this.inFactMenuEntry();

            }).catch(_ => {});
        } else {
            this.inFactMenuEntry();
        }
    }

    private inFactMenuEntry() {
        const readline = InputHelper.getInstance().getInput();
        console.log();

        if (this.selectedPartition) {
            this.inputForSelectedPartition();
            readline.question("", async (input: string) => {
                await this.typedReplicas(input);
            });
        } else {
            this.printMenu();
            readline.question("", (input: string) => {
                this.typed(input);
            });
        }
    }

    private printMenu(): void {
        console.log(`1) List existing partitions (with partition_entry_id)`);
        console.log(`2) {{partition_entry_id}} // Select partition entry (number)`);
        console.log(`9) Go back`);
    }

    private inputForSelectedPartition(): void {
        console.log(`\nSelected partition [${this.selectedPartition?.getTopic()}:${this.selectedPartition?.getPartition()}]. Current Replicas for this partition is: ${this.selectedPartition?.getReplicas()}. Please type the next replicas setting...`);
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

    private async typedReplicas(line: string): Promise<void> {
        try {
            let replicas: number[] = [];
            const replicasString: string[] = line.split(",");
            for (let replicaString of replicasString) {
                replicas.push(Number.parseInt(replicaString));
            }

            await this.confirmAndApply(replicas);
        } catch (error: any) {
            console.log(`Not possible to understand typed replicas: ${JSON.stringify(error)} - for string: ${line}`);
        }
    }

    private option1() {
        console.log();
        for (let i = 0; i < this.partitions.length; i++) {
            const partition = this.partitions[i];
            console.log(`[${i+1}]\t${partition.getTopic()}:${partition.getPartition()} -> ${partition.getReplicas()}`);
        }
    }

    private option2(inputLinePieces: string[]) {
        if (inputLinePieces.length <= 1) {
            Logger.error("Error: partition entry id not specified. Type: 2 {{partition_entry_id}}")
            return;
        }

        const partitionEntryIDString = inputLinePieces[1];
        let partitionEntryID = -1;
        try {
            partitionEntryID = Number.parseInt(partitionEntryIDString) - 1;
        } catch (error: any)  {
            Logger.error(`Error parsing partition replicas: ${JSON.parse(error)} - input: ${inputLinePieces}`);
        }

        if (partitionEntryID >= 0 && partitionEntryID < this.partitions.length) {
            this.selectedPartition = this.partitions[partitionEntryID];
        } else {
            Logger.error(`Option not understood: ${inputLinePieces}`);
        }
    }

    private option9() {
        ReassignMenu.run();
    }

    private async confirmAndApply(replicas: number[]): Promise<void> {
        console.log();

        const document = new ReassigningDocument();
        this.selectedPartition?.setReplicas(replicas);
        document.addReassigningPartition(this.selectedPartition!);

        const mappedDocument: Map<string, ReassigningDocument> = new Map<string, ReassigningDocument>();
        mappedDocument.set(this.selectedPartition?.getTopic() ?? "", document);

        await ReassignerApplier.apply(mappedDocument);
        this.selectedPartition = null;
        this.loadPartitions();
        this.menuEntry();
    }
}
