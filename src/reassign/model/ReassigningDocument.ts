import {ReassigningPartition} from "./ReassigningPartition";
import {KafkaPartition} from "../../kafka/model/KafkaPartition";

export class ReassigningDocument {
    private readonly version: number;
    private readonly partitions: ReassigningPartition[];

    constructor() {
        this.version = 1;
        this.partitions = [];
    }

    public add(existingPartition: KafkaPartition): void {
        this.partitions.push(new ReassigningPartition(existingPartition));
    }

    public addReassigningPartition(existingPartition: ReassigningPartition): void {
        this.partitions.push(existingPartition);
    }

    public getPartitions(): ReassigningPartition[] {
        return this.partitions;
    }
}
